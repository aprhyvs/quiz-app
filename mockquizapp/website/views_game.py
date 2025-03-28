


import random
from docx import Document
from PyPDF2 import PdfReader

import json
from django.http import HttpResponse, JsonResponse


from .models import *

from .admin_utils import *
from .student_utils import *

import cohere
#pip install cohere
#pip install -U g4f[all]

from g4f.client import Client
from g4f.Provider import RetryProvider, Free2GPT , Pizzagpt
import g4f.debug


g4f.debug.logging = True
g4f.debug.version_check = False

g4f_client = Client(
    provider=RetryProvider([Pizzagpt , Free2GPT], shuffle=False)
)
cohere_client = cohere.ClientV2("Syr2F0x4B8B77QnUdxBCB3ZI5doGaEDHmtGK8oII")

def generate_response_cohere(command : str , system : str):
    global cohere_client
    try: 
        response = cohere_client.chat(
            model="command-r", 
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": command}
            ]
        )
        data = response.dict()
        
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






def upload_file_view_status_1(request):
    
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return JsonResponse({'error': 'No file uploaded.'}, status=400)

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
        questionairs = generate_response_g4f(file_content)
        if questionairs is None:
            questionairs = generate_response_cohere(file_content)
            if questionairs is None:
                return JsonResponse({'error': 'Failed to generate questionaire.'}, status=500)
        
        student = StudentData.objects.filter(username = request.user.username).first()
        if student is None:
            return JsonResponse({'error': 'Failed to find a student record.'}, status=404)
        # TODO: Save the questionaire in the database
        try:
            
            QuizData.objects.create(
                student_id = student.pk,
                
            )
            
            # number_of_correct = models.IntegerField(blank=True, default=None, null=True)
            # number_of_wrong = models.IntegerField(blank=True, default=None, null=True)
            # student_id = models.IntegerField(blank=True, default=None, null=True)
            # created_at = models.DateTimeField(auto_now_add=True)
            # is_answered = models.BooleanField(default=False)
            # number_of_answered_questions = models.IntegerField(default=0)
            # quiz_title = models.CharField(max_length=50 , blank=True, default=None, null=True)
            # total_worth = models.IntegerField(default=0)
            # questions = models.JSONField(default=dict, blank=True, null=True)
            # """
            #     questions = {
            #         "1": {
            #             "question": "What is the capital of France?",
            #             "options": ["London", "Paris", "Berlin", "Madrid"],
            #             "correct_answer": "Paris",
            #             "answered": False,
            #             "answer": None,
            #             "worth" : 100
            #         },
            #     }
            # """
            # upload_stage = models.SmallIntegerField(default=0)
            # """
            #     0 = Creating a questions
            #     1 = Done Creating Questions and Converting to python objects dictionary
            #     2 = Questions are converted to python objects dictionary and ready for answering
            # """
            # raw_file_content = models.TextField(default=None, blank=True, null=True)
            # file_type = models.CharField(max_length=50 , blank=True, default=None, null=True)

            
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({'error': 'Failed to save questionaire in the database.'}, status=500)
        
        
        
        
        # TODO: Generate a python object from generated questionaire from the uploaded file
        # TODO: Create new QuizData object to save the current session
        # TODO: Return response that the user can now start the quizes based on the uploaded file
                
    
 