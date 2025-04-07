

#pip install cohere
#pip install -U g4f[all]
# pip install python-docx
# pip install PyPDF2
# pip install gtts
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
import time
import uuid
import json
from django.http import HttpResponse, JsonResponse
from gtts import gTTS

from .models import *

from .admin_utils import *
from .student_utils import *


TEXTLENGTH_REQUIRED = 300
TOTAL_QUESTIONS = 20

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


def is_correct_format_stage_2(result : dict) -> tuple[bool , dict]:
    if not isinstance(result, dict):
        return (False , None)
    
    """
    {
        "<index>": {
            "question": "<question>",
            "options": ["A. <answer>","B. <answer>","C. <answer>","D. <answer>"],
            "correct_answer": "<letter_of_correct_answer>"
        },
        ...
    }
    """
    fix_result = {}
    for k in range(1,22):
        selected_data = result.get(str(k), None)
        if selected_data is None:
            continue
        if not "question" in selected_data:
            continue 
        if not "options" in selected_data:
            continue
        if not "correct_answer" in selected_data:
            continue
        if not isinstance(selected_data["options"], list):
            continue
        if len(selected_data["options"]) != 4:
            continue
        if not isinstance(selected_data["correct_answer"], str):
            continue
        if not isinstance(selected_data["question"], str):
            continue
        fix_result[str(k)] = selected_data
        
    
    for k in fix_result:
        if k not in [ str(i) for i in range(1,22) ]:
            return (False , fix_result)
        
    if len(fix_result) != 21:
        return (False , fix_result)
    
    return (True , fix_result)


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


def get_index_content(index: str, questions: str , past_error = None):
    system_prompt = """
    Extract the content of the specific number of the question from the provided questions and return it as a valid JSON object.

    Instructions:
    1. Find and extract the content of the question with the number "<index>" from the provided questions.
    2. Ensure the output follows this structure:
    {
        "<index>": {
            "question": "<question>",
            "options": ["A. <answer>","B. <answer>","C. <answer>","D. <answer>"],
            "correct_answer": "<letter_of_correct_answer>"
        }
    }
    3. Make sure the keys are enclosed in double quotes to make them JSON-compatible.
    4. Ensure that the resulting JSON object is properly formatted and can be parsed without errors.

    If the given number of question which is <index> does not exist, respond with: {"error": "Key '<index>' not found."}
    
    Ensure it will work with this format checker;
    ```
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



    def is_index_correct_format(data: dict, index: str) -> bool:
        if not isinstance(data, dict):
            return False

        selected_data = data.get(index)
        if not isinstance(selected_data, dict):
            return False
        
        required_keys = ["question", "options", "correct_answer"]
        if not all(key in selected_data for key in required_keys):
            return False
        
        if not isinstance(selected_data["question"], str) or not selected_data["question"]:
            return False

        if not isinstance(selected_data["options"], list) or len(selected_data["options"]) != 4:
            return False

        if not isinstance(selected_data["correct_answer"], str):
            return False

        valid_answers = {"a", "b", "c", "d"}
        if selected_data["correct_answer"].strip().lower() not in valid_answers:
            return False

        return True
    ```
    
    """
    # Replace <index> in system prompt with actual value
    if past_error is not None:
        system_prompt += f"""
        Here is your past result error! Please make sure it does not repeat the same error again. 
        Error: {past_error}
        """
    
    system_prompt = system_prompt.replace("<index>", index)
    print(system_prompt)
    # Call generate_response_cohere
    response = generate_response_cohere(command=questions, system=system_prompt)
    return response


def is_index_correct_format(data: dict, index: str) -> bool:
    if not isinstance(data, dict):
        return False

    selected_data = data.get(index)
    if not isinstance(selected_data, dict):
        return False
    
    required_keys = ["question", "options", "correct_answer"]
    if not all(key in selected_data for key in required_keys):
        return False
    
    if not isinstance(selected_data["question"], str) or not selected_data["question"]:
        return False

    if not isinstance(selected_data["options"], list) or len(selected_data["options"]) != 4:
        return False

    if not isinstance(selected_data["correct_answer"], str):
        return False

    valid_answers = {"a", "b", "c", "d"}
    if selected_data["correct_answer"].strip().lower() not in valid_answers:
        return False

    return True



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
        
        # TODO: Generate questionaire based on the text of the uploaded 
        
        if len(file_content) == 0:
            return JsonResponse({'error': 'No content found in the file.'}, status=400)
        if len(file_content) < TEXTLENGTH_REQUIRED:
            return JsonResponse({'error': 'The content in the file is too short.'}, status=400)
        
        # generate questionair in g4f
        questionairs = generate_response_cohere(CREATE_QUESTIONS_PROMPT % file_content, CREATE_QUESTIONS_PROMPT_COMMAND)
        if questionairs is None:
            return JsonResponse({'error': 'Failed to generate questionaire.'}, status=500)
    
        # TODO: Save the questionaire in the database
        try:
            admin_data = AdminData.objects.all().first() 
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
                raw_generated_questions = questionairs,
                safe_level = admin_data.safe_level,
                worth_sequence = {
                    "1" : 10,
                    "2" : 20,
                    "3" : 30,
                    "4" : 50,
                    "5" : 100,
                    "6" : 200,
                    "7" : 400,
                    "8" : 800,
                    "9" : 1500,
                    "10" : 3000,
                    "11" : 6000,
                    "12" : 12000,
                    "13" : 25000,
                    "14" : 50000,
                    "15" : 100000,
                    "16" : 250000,
                    "17" : 500000,
                    "18" : 750000,
                    "19" : 900000,
                    "20" : 1000000,  
                }
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
        # if len(quiz.raw_generated_questions) == 0:
        #     questionaire_dict_text = generate_response_cohere(quiz.raw_generated_questions, CONVERT_QUESTIONS_TO_OBJECT_COMMAND)
        #     if not questionaire_dict_text:
        #         return JsonResponse({'error': 'Failed to generate questionnaire object.'}, status=500)
            
        #     quiz.raw_generated_json_questions = questionaire_dict_text
        #     quiz.save()
            
        # print(questionaire_dict_text) 
        # print("What converted to : {}".format(questionaire_dict_text))
        # converted_dict = text_to_dictionary(questionaire_dict_text)
        # print("Converted dict: {}".format(converted_dict))
        # # print(converted_dict)
        # if not converted_dict:
        #     quiz.raw_generated_json_questions = questionaire_dict_text
        #     quiz.save()
        #     converted_dict = {}
        #     print("Using for loop to convert to dictionary")
        #     for index in range(21):
        #         selected_question_dict = None
        #         for strike in range(3):
        #             selected_question_text = get_index_content(index=str(index), questions=quiz.raw_generated_questions)
        #             selected_question_dict = text_to_dictionary(selected_question_text)
        #             if selected_question_dict is not None:
        #                 _, cleaned_dict = is_correct_format_stage_2(selected_question_dict)
        #                 if isinstance(cleaned_dict, dict):
        #                     if str(index) in cleaned_dict:
        #                         break
                
        #         if isinstance(selected_question_dict, dict):
        #             if str(index) in selected_question_dict:
        #                 selected_question_dict = selected_question_dict[str(index)]
        #             converted_dict[index] = selected_question_dict
    
        #     # return JsonResponse({'error': 'Failed to convert text to dictionary.'}, status=500)
        
        # # TODO: Validate and sanitize the questionaire data
        # is_valid, converted_dict = is_correct_format_stage_2(converted_dict)
        # if not is_valid:
        #     for index in range(1,22):
        #         if str(index) not in converted_dict:
        #             for strike in range(3):
        #                 selected_question_text = get_index_content(index=str(index), questions=quiz.raw_generated_questions)
        #                 selected_question_dict = text_to_dictionary(selected_question_text)
        #                 if selected_question_dict is not None:
        #                     if is_correct_format_stage_2(selected_question_dict):
        #                         break
        #             converted_dict[index] = selected_question_dict
        
        # is_valid , converted_dict = is_correct_format_stage_2(converted_dict)
        # if not is_valid:
        #     return JsonResponse({'error': 'Invalid questionaire data.'}, status=400)
        # TODO: Save the questionaire in the database
        try:
            raw_cleaned_generated_question = quiz.raw_generated_questions.replace('"', '')
            raw_cleaned_generated_question = raw_cleaned_generated_question.replace("'", '')
            quiz.raw_generated_json_questions = raw_cleaned_generated_question
            quiz.upload_stage = 2   
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
        strike_counter = 0
        strike = 3
        title = None
        while strike > strike_counter:
            title = generate_response_cohere(CREATE_TITLE_PROMPT_WITH_CONTENT % minimize_content , CREATE_TITLE_PROMPT )
            converted_title = text_to_dictionary(title)
            if converted_title:
                break
            strike_counter += 1
            
        converted_title = text_to_dictionary(title)
        if not converted_title:
            parse_title = extract_title(title)
            if not parse_title:
                return JsonResponse({'error': 'Failed to convert title to dictionary.'}, status=500)
            converted_title = {'title': parse_title}
        
        real_title = converted_title.get('title' , None) 
        if not real_title:
            return JsonResponse({'error': 'Failed to extract title from generated text.'}, status=500)
        
        quiz.quiz_title = real_title
        quiz.upload_stage = 3
        quiz.save()
        return JsonResponse({"quiz_id": quiz.pk , "upload_stage": quiz.upload_stage }, status=200)
    
    return JsonResponse({'error': 'Invalid request method.'}, status=405)


def on_game_data_generation(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
      
        
        old_generated_questions = quiz.questions if quiz.questions else {}
        selected_questions = old_generated_questions.get(question , None)
        print("selected_questions : ", selected_questions)
        # If has selected questions then verify it if it correct format then send it
        if selected_questions:
            for_correct_format_data = { question : selected_questions} 
            is_valid = is_index_correct_format(for_correct_format_data , question)
            print("valid_for_correct_format_data : ", for_correct_format_data)
            if is_valid:       
                selected_questions['correct_answer'] = None
                selected_questions["answer"] = None  
                return JsonResponse({'question': selected_questions}, status=200)
        
        # return JsonResponse({'error': 'Failed to generate questions.'}, status=500)
        print("generated questions")
        # If has not selected questions then generate it
        converted_questions = None
        if not selected_questions:
            converted_questions = None
            past_error = None
            raw_cleaned_generated_question = quiz.raw_generated_questions.replace('"', '') # remove double quotes
            raw_cleaned_generated_question = raw_cleaned_generated_question.replace("'", '') # remove double quotes
            for _ in range(3):
                selected_questions = get_index_content(index=question , questions=raw_cleaned_generated_question, past_error=past_error)
                if selected_questions:
                    converted_questions = text_to_dictionary(selected_questions)
                    if converted_questions:
                        is_valid = is_index_correct_format(converted_questions , question)
                        if is_valid:
                            break
                        else:
                            converted_questions = None
                        
                past_error = selected_questions
                time.sleep(1)
            if not converted_questions:
                return JsonResponse({'error': 'Failed to convert questions to dictionary.'}, status=500)
            
            print("converted questions : ", converted_questions)
            # is_valid = is_index_correct_format(converted_questions , question)
            # if not is_valid:
            #     return JsonResponse({'error': 'Failed to extract questions from generated text.'}, status=500)
        
        selected_data = converted_questions.get(question, None)
        if selected_data is None:
            selected_data = converted_questions
            
        """
        questions = {
                "1": {
                    "question": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "correct_answer": "Paris",
                    "answered": False,
                    "answer": None,
                    "worth" : 100
                },
                ...
            }
        
        """
        selected_data["answered"] = False
        selected_data["answer"] = None
        selected_data["worth"] = 0
        old_generated_questions[question] = selected_data
        quiz.questions = old_generated_questions
        quiz.save()
        selected_data['correct_answer'] = None
        return JsonResponse({'question': selected_data}, status=200)
            

    return JsonResponse({'error': 'Invalid request method.'}, status=405)



def on_game_data_get_answer(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        old_generated_questions = quiz.questions if quiz.questions else {}
        selected_questions = old_generated_questions.get(question , None)
        if not selected_questions:
            return JsonResponse({'error': 'Question not found.'}, status=404)
         
        return JsonResponse({'question': selected_questions}, status=200)


def on_game_data_ask_ai(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401) 
    
    if request.method == 'POST':
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        if quiz.game_has_ai_hint:
            return JsonResponse({'hint': 'You have already asked the AI for a hint.'}, status=200)
        
        old_generated_questions = quiz.questions if quiz.questions else {}
        selected_questions = old_generated_questions.get(question , None)
        if not selected_questions:
            return JsonResponse({'error': 'Question not found.'}, status=404)
        
        # Check if the selected question has already been generated
        if 'hint' in quiz.game_data_ai_hint:
            return JsonResponse({'hint': quiz.game_data_ai_hint}, status=200)
        
        # Check if the student has already been used the ai hint
        if quiz.game_has_ai_hint:
            return JsonResponse({'hint': 'You have already asked the AI for a hint.'}, status=200)
        
        # TODO: Ask AI to tell the answer but not really telling the answer just giving a hint
        # Structure the prompt
        prompt = f"""
        You are given a question, its options, and the correct answer. Provide a hint based on the correct answer, but do not give the answer directly. The hint should help the user think critically about the question.

        Requirements:
        - Keep the hint subtle and helpful.
        - The hint must not exceed 50 words.
        - Return the result as a dictionary in this format: {{"hint": "<message>"}}.

        Input:
        {selected_questions}

        Output:
        """
        
        # Use the Cohere AI model to generate the 
        response_dict = None
        for _ in range(3):
            response = generate_response_cohere(command=prompt, system=None)
            response_dict = text_to_dictionary(response)
            if response_dict:
                hint = response_dict.get('hint' , None)
                if hint:
                    break
            time.sleep(1)
        if not response_dict:
            return JsonResponse({'error': 'Failed to generate hint.'}, status=500)
        quiz.game_data_ai_hint = response_dict
        quiz.game_has_ai_hint = True
        quiz.save()
        return JsonResponse(response_dict, status=200)


def on_game_data_answer(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        
        user_answer : str = request.POST.get('user_answer', None)
        if not user_answer:
            return JsonResponse({'error': 'No user answer provided.'}, status=400)
        
        if user_answer not in ['A', 'B', 'C', 'D']:
            return JsonResponse({'error': 'Invalid user answer.'}, status=400)
        
        
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        old_generated_questions : dict = quiz.questions if quiz.questions else {}
        selected_questions : dict = old_generated_questions.get(question , None)
        if selected_questions is None or not selected_questions:
            return JsonResponse({'error': 'Question not found.'}, status=404)
        """
        questions = {
                "1": {
                    "question": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "correct_answer": "Paris",
                    "answered": False,
                    "answer": None,
                    "worth" : 100,
                    "is_correct" : False
                },
                ...
            }
        
        """
        is_answer = selected_questions.get("answered" , False)
        if is_answer:
            return JsonResponse({'error': 'Question has already been answered.'}, status=400)
        
        # This part is updating the question data
        selected_questions["answered"] = True
        selected_questions["answer"] = user_answer
        real_answer = selected_questions["correct_answer"]
        selected_questions["worth"] = quiz.worth_sequence[question]
        
        if user_answer.lower() in real_answer.lower():
            quiz.number_of_correct += 1
            selected_questions["is_correct"] = True
        else:
            quiz.number_of_wrong += 1
            selected_questions["is_correct"] = False
            
        quiz.questions[question] = selected_questions
        quiz.save()
        
        # This part is checking the safe level
        safe_level = quiz.safe_level.split(',')
        if question in safe_level:
            question_to_int = int(question)
            while True:
                print("Checking safe level for question", question_to_int)
                
                safe_level_selected_question = quiz.questions.get(str(question_to_int), None)
                print("safe_level_selected_question :", safe_level_selected_question)
                if not safe_level_selected_question or safe_level_selected_question is None:
                    continue
                
                correct_answer = safe_level_selected_question["correct_answer"]
                user_answer = safe_level_selected_question["answer"]
                
                if user_answer.lower() in correct_answer.lower() or user_answer == correct_answer: 
                    worth_assign = quiz.worth_sequence.get(str(question_to_int))
                    quiz.total_worth = quiz.total_worth + worth_assign
                    print("Total worth", quiz.total_worth)
                
                question_to_int = question_to_int - 1
                if str(question_to_int) in safe_level:
                    break
                
                if question_to_int == 0:
                    break
        
        if (quiz.number_of_correct + quiz.number_of_wrong ) == TOTAL_QUESTIONS:
            quiz.is_answered = True 
        quiz.save()
        
        return JsonResponse({'status': 'success'}, status=200)
        

def on_game_get_quiz_data(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
         
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)

        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        
        return JsonResponse({'data': quiz.game_data() }, status=200)
        

def on_game_data_update(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    
    if request.method == 'POST': 
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        
        update_type = request.POST.get('update_type', None)
        if not update_type:
            return JsonResponse({'error': 'No update type provided.'}, status=400) 
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)

        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        if update_type == '5050':
            quiz.game_has_5050 = True
            quiz.save()
            return JsonResponse({'status': 'Hint given.'}, status=200)
        elif update_type == 'hint':
            quiz.game_has_ai_hint = True
            quiz.save()
            return JsonResponse({'status': 'Hint given.'}, status=200)
        elif update_type == "x2":
            quiz.game_has_times2 = True
            quiz.save()
            return JsonResponse({'status': 'Double points given.'}, status=200)
        elif update_type == "pass":
            quiz.game_has_pass = True
            quiz.save()
            return JsonResponse({'status': 'Quiz passed.'}, status=200)
        
        return JsonResponse({'error': 'Invalid update type.'}, status=400)




def on_game_data_5050(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        if len(quiz.game_data_5050) > 0:
            return JsonResponse({'5050': quiz.game_data_5050}, status=200)
        
        old_generated_questions = quiz.questions if quiz.questions else {}
        selected_questions = old_generated_questions.get(question , None)
        if not selected_questions:
            return JsonResponse({'error': 'Question not found.'}, status=404)
        
        
        # if question in quiz.game_data_5050 :
        #     return JsonResponse({'5050': quiz.game_data_5050.get(question)}, status=200)
        
        # Check if there is a data in dictionary game_data_5050
        if bool(quiz.game_data_5050):
            return JsonResponse({'5050': "You have already used your 50/50 hint."}, status=200)
        
        decoy_5050 = []
        correct_answer = selected_questions["correct_answer"]
        decoy_5050.append(correct_answer)
        decoy_sample = ["A", "B", "C", "D"]
        random.shuffle(decoy_sample)
        for decoy in decoy_sample: 
            if decoy != correct_answer:
                decoy_5050.append(decoy)
        
        random.shuffle(decoy_5050)
        quiz.game_data_5050 = { question: decoy_5050}
        quiz.game_has_5050 = True
        quiz.save()
        
        return JsonResponse({'5050': quiz.game_data_5050}, status=200)


def on_game_data_answer_with_x2(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        
        
        
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        answer_1 = request.POST.get('answer_1', None)
        if not answer_1:
            return JsonResponse({'error': 'No answer provided.'}, status=400)
        
        
        if answer_1 not in ['A', 'B', 'C', 'D']:
            return JsonResponse({'error': 'Invalid user answer.'}, status=400)
        
        
        answer_2 = request.POST.get('answer_2', None)
        if not answer_2:
            return JsonResponse({'error': 'No answer provided.'}, status=400)
        
        if answer_2 not in ['A', 'B', 'C', 'D']:
            return JsonResponse({'error': 'Invalid user answer.'}, status=400)
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        old_generated_questions : dict = quiz.questions if quiz.questions else {}
        selected_questions : dict = old_generated_questions.get(question , None)
        if not selected_questions:
            return JsonResponse({'error': 'Question not found.'}, status=404)
        """
        questions = {
                "1": {
                    "question": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "correct_answer": "Paris",
                    "answered": False,
                    "answer": None,
                    "worth" : 100,
                    "is_correct" : False
                },
                ...
            }
        
        """
        is_answer = selected_questions.get("answered" , False)
        if is_answer:
            return JsonResponse({'error': 'Question has already been answered.'}, status=400)
        
        # This part is updating the question data
        selected_questions["answered"] = True
        real_answer = selected_questions["correct_answer"]
        selected_questions["worth"] = quiz.worth_sequence[question]
        
        if answer_1.lower() in real_answer.lower() or answer_2.lower() in real_answer.lower():
            quiz.number_of_correct += 1
            selected_questions["answer"] = real_answer
            selected_questions["is_correct"] = True
        else:
            quiz.number_of_wrong += 1
            selected_questions["answer"] = answer_1
            selected_questions["is_correct"] = False
        
        quiz.game_data_times2 = { question: [answer_1, answer_2]}
        quiz.questions[question] = selected_questions
        quiz.game_has_times2 = True
        quiz.save()
        
        # This part is checking the safe level
        safe_level = quiz.safe_level.split(',')
        if question in safe_level:
            question_to_int = int(question)
            while True:
                
                safe_level_selected_question = quiz.questions.get(str(question_to_int), None)
                if not safe_level_selected_question:
                    continue
                
                correct_answer = safe_level_selected_question["correct_answer"]
                user_answer = safe_level_selected_question["answer"]
                
                if user_answer.lower() in correct_answer.lower(): 
                    worth_assign = quiz.worth_sequence.get(question)
                    quiz.total_worth = quiz.total_worth + worth_assign
                
                question_to_int = question_to_int - 1
                if str(question_to_int) in safe_level:
                    break
                
                if question_to_int == 0:
                    break
                
        quiz.save()
        
        return JsonResponse({'status': 'success'}, status=200)
    
    
def on_game_data_pass(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        question = request.POST.get('question', None)
        if not question:
            return JsonResponse({'error': 'No question provided.'}, status=400)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        if quiz.game_has_pass:
            return JsonResponse({'message': 'You have already passed this quiz.'}, status=400)
        
        # This part is updating the question data    
        old_generated_questions = quiz.questions if quiz.questions else {}
        selected_questions = old_generated_questions.get(question , None)
        
        print("generated questions")
        # If has not selected questions then generate it
        converted_questions = None
        if not selected_questions:
            converted_questions = None
            for _ in range(3):
                selected_questions = get_index_content(index="21" , questions=quiz.raw_generated_questions)
                if selected_questions:
                    converted_questions = text_to_dictionary(selected_questions)
                    if converted_questions:
                        break
                time.sleep(1)
            if not converted_questions:
                return JsonResponse({'error': 'Failed to convert questions to dictionary.'}, status=500)
            
            print("converted questions : ", converted_questions)
            is_valid = is_index_correct_format(converted_questions , "21")
            if not is_valid:
                return JsonResponse({'error': 'Failed to extract questions from generated text.'}, status=500)
        
        selected_data = converted_questions.get(21, None)
        if selected_data is None:
            selected_data = converted_questions
            
        """
        questions = {
                "1": {
                    "question": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "correct_answer": "Paris",
                    "answered": False,
                    "answer": None,
                    "worth" : 100,
                    "is_correct" : False
                },
                ...
            }
        
        """
        selected_data["answered"] = False
        selected_data["answer"] = None
        selected_data["worth"] = 0
        selected_questions["is_correct"] = False
        old_generated_questions[question] = selected_data
        quiz.questions = old_generated_questions
        quiz.game_has_pass = True
        quiz.save()
        selected_data['correct_answer'] = None
        return JsonResponse({'question': selected_data}, status=200)


def on_game_data_generate_voice(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        # Get the text from POST request
        mytext = request.POST.get('text', None)
        if not mytext:
            return JsonResponse({'error': 'No text provided.'}, status=400)
        
        language = 'en-uk'

        # Generate the TTS object
        tts = gTTS(text=mytext, lang=language, slow=False)

        # Generate a unique filename using UUID
        unique_filename = f"{uuid.uuid4()}.mp3"
        folder_path = "voice_files"  # Define the folder where files will be saved

        # Create the folder if it doesn't exist
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        # Full path to the audio file
        audio_file_path = os.path.join(folder_path, unique_filename)
        
        # Save the audio file
        tts.save(audio_file_path)

        # Serve the audio file as a response
        with open(audio_file_path, 'rb') as audio:
            response = HttpResponse(audio.read(), content_type='audio/mpeg')
            response['Content-Disposition'] = f'attachment; filename="{unique_filename}"'

        # Delete the file after sending the response
        os.remove(audio_file_path)
        
        return response

    return JsonResponse({"error": "Invalid request method."}, status=405)



def on_game_is_complete(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)
        
        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        if (quiz.number_of_correct + quiz.number_of_wrong ) == TOTAL_QUESTIONS:
            quiz.is_answered = True
            quiz.save()
            return JsonResponse({'message': 'Quiz is completed.', 'is_completed': True, 'data': quiz.game_data()}, status=200)
        
        return JsonResponse({'message': 'Quiz is not completed.', 'is_completed': False , 'data': quiz.game_data()}, status=200)



def on_game_check_power_up(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
         
        student = StudentData.objects.filter(account_id=request.user.pk).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        
        quiz_id = request.POST.get('quiz_id', None)
        if not quiz_id:
            return JsonResponse({'error': 'No quiz ID provided.'}, status=400)
        
        if not str(quiz_id).isdigit():
            return JsonResponse({'error': 'Invalid quiz ID.'}, status=400)

        quiz = QuizData.objects.filter(id = int(quiz_id) , student_id = student.pk).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found.'}, status=404)
        
        
        
        return JsonResponse({
            'has_5050' : quiz.game_has_5050,
            '5050_data' : quiz.game_data_5050,
            'has_pass' : quiz.game_has_pass,
            'has_hint' : quiz.game_has_ai_hint,
            'hint_data' : quiz.game_data_ai_hint,
            'has_2x' : quiz.game_has_times2,
            'x2_data' : quiz.game_data_times2
        }, status=200)
        
        
        
        