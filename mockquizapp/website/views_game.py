

#pip install cohere
#pip install -U g4f[all]
g4f_client = None
cohere_client = None



try:
    # Error: unsupported operand type(s) for |: 'type' and 'type'
    # Don't panic it is working fine
    import pathlib
    from typing import Union
    PathLike = Union[str, pathlib.Path]

    from g4f.client import Client
    from g4f.Provider import RetryProvider, Free2GPT , Pizzagpt 
    g4f_client = Client(
        provider=RetryProvider([Pizzagpt , Free2GPT], shuffle=False)
    )
except Exception as e:
    print(f"Error: {e}")


try:
    import cohere
    cohere_client = cohere.ClientV2("Syr2F0x4B8B77QnUdxBCB3ZI5doGaEDHmtGK8oII")
except Exception as e:
    print(f"Error: {e}")
    
    
    
    
import re
import random
from docx import Document
from PyPDF2 import PdfReader

import json
from django.http import HttpResponse, JsonResponse


from .models import *

from .admin_utils import *
from .student_utils import *



def generate_response_cohere(command : str , system : str):
    global cohere_client
    if cohere_client is None:
        print("Cohere client not initialized")
        return None
    try: 
        if system :
            response = cohere_client.chat(
                model="command-r", 
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": command}
                ]
            )
        else:
            response = cohere_client.chat(
                model="command-r", 
                messages=[
                    {"role": "user", "content": command}
                ]
            )
        data = response.dict()
        print(data)
        
        for k in data:
            if k == "message":
                message: list = data[k]["content"]
                for mes in message:
                    if isinstance(mes, dict):
                        main_content = mes.get("text") 
                        if main_content:
                            return main_content
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def generate_response_g4f( command : str ):
    global g4f_client
    if g4f_client is None:
        print("G4F client not initialized")
        return None
    try:
        response = g4f_client.chat.completions.create(
            model="",
            messages=[
                {"role": "user", "content": command}
            ],
        ) 
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error: {e}")
        return None


def text_to_dictionary(response: str):
        # Check if the input is a string
    if not isinstance(response, str):
        print("Error: Response must be a string")
        return None

    try:
        # Use regex to extract the dictionary-like content
        match = re.search(r'{[\s\S]*}', response, re.DOTALL)
        if match:
            python_dict_text = match.group(0)

            # Preprocess to make it JSON-compatible
            json_text = re.sub(r'\\"', '"', python_dict_text) 
            
            # 2. Convert integer keys to JSON string keys (e.g., `1:` -> `"1":`)
            json_text = re.sub(r'"\\?"(\w+)\\?"":', r'"\1":', json_text)  # Normalize keys (handles words and numbers)

            # Attempt to parse the JSON content
            try:
                parsed_json = json.loads(json_text)
                return parsed_json
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print("Ensure proper formatting in the dictionary.")
                return None
        else:
            print("No dictionary-like content found in the response")
            return None
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return None



def extract_title(response: str):
    try:
        # Attempt to parse as JSON
        parsed_json = json.loads(response)
        # If JSON is valid, return the "title" if it exists
        if "title" in parsed_json:
            return parsed_json["title"]
    except json.JSONDecodeError:
        # Handle JSON parsing error
        print("JSON parsing failed. Attempting to extract title manually...")

        # Use regex to extract the title field
        match = re.search(r'"title"\s*:\s*"([^"]+)"', response)
        if match:
            return match.group(1)

    # If no title is found, return None or a default message
    return "No valid title found"





def upload_file_view_status_1(request):
    
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return JsonResponse({'error': 'No file uploaded.'}, status=400)
        
        student = StudentData.objects.filter(username = request.user.username).first()
        if student is None:
            return JsonResponse({'error': 'Failed to find a student record.'}, status=404)

        # Identify file type
        file_type = identify_file_type(uploaded_file)

        if file_type == 'invalid':
            return JsonResponse({'error': 'Unsupported file type. Only .docx, .pdf, and .txt are allowed.'}, status=400)

        file_content = ""
        # Process the file based on its type

        if file_type == 'txt':   
            lines = uploaded_file.read().decode('utf-8').splitlines()  # Decode and split into lines
            total_lines = len(lines)
            if total_lines > 21:
                # If more than 21 lines then randomly select 21 lines uniquely
                selected_lines = []
                while len(selected_lines) < 21:
                    random_line = random.randint(0, total_lines - 1)
                    if random_line not in selected_lines:
                        selected_lines.append(random_line)
                
                file_content = '\n'.join(lines[i] for i in selected_lines)
            elif total_lines > 0:
                file_content = '\n'.join(lines)
            else:
                return JsonResponse({'error': 'No content found in the file.'}, status=400)
            
            
        elif file_type == 'pdf':
            reader = PdfReader(uploaded_file)
            total_pages = len(reader.pages)
            pages_that_has_text = []
            for page_num in range(total_pages):
                page_text = reader.pages[page_num].extract_text()
                if page_text.strip():
                    pages_that_has_text.append(page_num)
            
            if len(pages_that_has_text) > 21:
                selected_pages = random.sample(pages_that_has_text, 21)
                file_content = '\n'.join(reader.pages[page_num].extract_text() for page_num in selected_pages)
            elif len(pages_that_has_text) > 0:
                file_content = '\n'.join(reader.pages[page_num].extract_text() for page_num in pages_that_has_text)
            else:
                return JsonResponse({'error': 'No text found in any of the pages.'}, status=400)
              
        elif file_type == 'docx':
            document = Document(uploaded_file)
            paragraphs = [p.text for p in document.paragraphs if p.text.strip()]  # Non-empty paragraphs
            total_pages = len(paragraphs)  # Treating paragraphs as "pages" for simplicity

            if total_pages > 21:
                selected_pages = random.sample(range(total_pages), 21)
                file_content = '\n'.join(paragraphs[page_num] for page_num in selected_pages)
            elif total_pages > 0:
                file_content = '\n'.join(paragraphs)
            else:
                return JsonResponse({'error': 'No content found in the file.'}, status=400)
            # if total_pages > 0:
            #     selected_page = random.randint(0, total_pages - 1)  # Select a random page (paragraph)
            #     extracted_text = paragraphs[selected_page]
            # else:
            #     extracted_text = None
        
        else:
            return JsonResponse({'error': 'Failed to extract text from the uploaded file.'}, status=500)
        
        # TODO: Generate questionaire based on the text of the uploaded file
        
        # generate questionair in g4f
        questionairs = generate_response_g4f(CREATE_QUESTIONS_PROMPT_WITH_CONTENT % file_content)
        if questionairs is None:
            questionairs = generate_response_cohere(file_content, CREATE_QUESTIONS_PROMPT)
            if questionairs is None:
                return JsonResponse({'error': 'Failed to generate questionaire.'}, status=500)
        
        # TODO: Save the questionaire in the database
        try:
            
            quiz = QuizData.objects.create(
                student_id = student.pk,
                is_answered = False,
                number_of_correct = 0,
                number_of_wrong = 0,
                number_of_answered_questions = 0,
                total_worth = 0,
                raw_file_content = file_content,
                file_ext = file_type,
                upload_stage = 1,
                raw_generated_questions = questionairs
            )
            return JsonResponse({"quiz_id": quiz.pk , "upload_stage": quiz.upload_stage }, status=200)
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({'error': 'Failed to save questionaire in the database.'}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)
        
        

def upload_file_view_status_2(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        stage = request.POST.get('stage', None)
        if not stage:
            return JsonResponse({'error': 'No stage provided.'}, status=400)
        
        if not str(stage).isdigit():
            return JsonResponse({'error': 'Invalid stage.'}, status=400)
        
        stage = int(stage)
        if stage != 1:
            return JsonResponse({'error': 'Invalid stage.'}, status=400)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id), upload_stage = 1).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        # TODO: Generate a python object from generated questionaire from the uploaded 
        print("Generating Questionaire using G4F")
        if len(quiz.raw_generated_questions) == 0:
            questionaire_dict_text = generate_response_g4f(CONVERT_QUESTIONS_TO_OBJECT_WITH_QUESTIONS % quiz.raw_generated_questions )
            if not questionaire_dict_text:
                questionaire_dict_text = generate_response_cohere(quiz.raw_generated_questions , CONVERT_QUESTIONS_TO_OBJECT)
                if not questionaire_dict_text:
                    return JsonResponse({'error': 'Failed to generate questionnaire object.'}, status=500)
            
            quiz.raw_generated_json_questions = questionaire_dict_text
            quiz.save()
        else:
            questionaire_dict_text = generate_response_cohere( CONVERT_QUESTIONS_TO_OBJECT_CLEANING % quiz.raw_generated_questions, CONVERT_QUESTIONS_TO_OBJECT_CLEANING_COMMAND)
            
        # print(questionaire_dict_text) 
        print("What converted to : {}".format(questionaire_dict_text))
        converted_dict = text_to_dictionary(questionaire_dict_text)
        print("Converted dict: {}".format(converted_dict))
        # print(converted_dict)
        if not converted_dict:
            converted_dict = {}
            print("Using for loop to convert to dictionary")
            for index in range(21):
                selected_question_text = generate_response_cohere(
                    SEPARATOR_OF_DICTIONARY_TEXT % ( questionaire_dict_text, str(index), str(index) ),
                    SEPARATOR_OF_DICTIONARY_TEXT_COMMAND % (str(index), str(index))
                    )
                selected_question_dict = text_to_dictionary(selected_question_text)
                if not selected_question_dict:
                    return JsonResponse({'error': 'Failed to generate selected question dictionary.'}, status=500)
                converted_dict[index] = selected_question_dict
    
            return JsonResponse({'error': 'Failed to convert text to dictionary.'}, status=500)
        
        # TODO: Save the questionaire in the database
        try:
            quiz.upload_stage = 2
            quiz.questions = converted_dict
            quiz.save()
            return JsonResponse({"quiz_id": quiz.pk , "upload_stage": quiz.upload_stage }, status=200)
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({'error': 'Failed to save questionaire in the database.'}, status=500)
        
        
    return JsonResponse({'error': 'Invalid request method.'}, status=405)
                


def upload_file_view_status_3(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        stage = request.POST.get('stage', None)
        if not stage:
            return JsonResponse({'error': 'No stage provided.'}, status=400)
        
        if not str(stage).isdigit():
            return JsonResponse({'error': 'Invalid stage.'}, status=400)
        
        stage = int(stage)
        if stage!= 2:
            return JsonResponse({'error': 'Invalid stage.'}, status=400)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        quiz = QuizData.objects.filter(id = int(quiz_id), upload_stage = 2).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        #TODO: Create a title for the quiz and save it in the database
        minimize_content = quiz.raw_file_content[:300] if len(quiz.raw_file_content) > 300 else quiz.raw_file_content
        title = generate_response_g4f(CREATE_TITLE_PROMPT_WITH_CONTENT % minimize_content )
        if not title:
            title = generate_response_cohere(minimize_content, CREATE_TITLE_PROMPT)
            if not title:
                return JsonResponse({'error': 'Failed to generate title.'}, status=500)
            
        converted_title = text_to_dictionary(title)
        if not converted_title:
            converted_title = extract_title(title)
            if not converted_title:
                return JsonResponse({'error': 'Failed to convert title to dictionary.'}, status=500)
            converted_title = {'title': converted_title}
        
        real_title = converted_title.get('title' , None) 
        if not real_title:
            return JsonResponse({'error': 'Failed to extract title from generated text.'}, status=500)
        
        quiz.quiz_title = real_title
        quiz.upload_stage = 3
        quiz.save()
        return JsonResponse({"quiz_id": quiz.pk , "upload_stage": quiz.upload_stage }, status=200)
    
    return JsonResponse({'error': 'Invalid request method.'}, status=405)

