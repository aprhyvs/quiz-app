import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import *

from .admin_utils import *
from .student_utils import *


import random
from docx import Document
from PyPDF2 import PdfReader
# pip install python-docx
# pip install PyPDF2


# STATISTICS
# 1. Total amount of quizes
# 2. Total amount of correct answers
# 3. Total amount of wrong answers
# 4. Graph of monthly total correct answers and wrong answers
# 5. Total of amount quizes take in every month


def getStudentByUsername(username): #Go find the student by only using their username. Returns the student
    student = get_object_or_404(StudentData, username=username)
    return student

def student_start_game(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        file = request.FILES['file']
        
def get_student_statistic(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        statsToGet = request.POST.get('statRequest') # statRequest is a table of stats that needs to be retrieved
        
        if not statsToGet:
            return JsonResponse({"error": "Statistics request not provided"}, status=400)
         
        student = StudentData.objects.filter(username = request.user.username).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        
        if statsToGet == '1':
            # 1. Total amount of quizes
            totalQuizes = get_total_quizzes_for_student(student)
            return JsonResponse({"totalQuizes": totalQuizes}, status=200) 
        
        if statsToGet == '2':
            # 2. Total amount of correct answers
            totalCorrectAnswers = get_sum_of_correct_answers(student)
            return JsonResponse({"totalCorrectAnswers": totalCorrectAnswers}, status=200)
        
        if statsToGet == '3':
            # 3. Total amount of wrong answers
            totalWrongAnswers = get_total_wrong_answers_for_student(student)
            return JsonResponse({"totalWrongAnswers": totalWrongAnswers}, status=200)
        
        if statsToGet == '4':
            # 4. Graph of monthly total correct answers and wrong answers
            monthlyStatistics = get_monthly_correct_and_wrong_for_student(student)
            return JsonResponse({"monthlyStatistics": monthlyStatistics}, status=200)
        
        if statsToGet == '5':
            # 5. Total of amount quizes take in every month
            monthlyQuizesTaken = get_monthly_quizzes_taken_for_student(student)
            return JsonResponse({"monthlyQuizesTaken": monthlyQuizesTaken}, status=200)
         
    
    
    return JsonResponse(student , status=200)


def upload_file_view(request):
    
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return JsonResponse({'error': 'No file uploaded.'}, status=400)

        # Identify file type
        file_type = identify_file_type(uploaded_file)

        if file_type == 'invalid':
            return JsonResponse({'error': 'Unsupported file type. Only .docx, .pdf, and .txt are allowed.'}, status=400)

        # Process the file based on its type
        if file_type == 'txt':  
            lines = uploaded_file.read().decode('utf-8').splitlines()  # Decode and split into lines
            total_lines = len(lines)
            if total_lines > 0:
                selected_line = random.randint(0, total_lines - 1)  # Select a random line
                extracted_text = lines[selected_line]
            else:
                extracted_text = None
                
                
        elif file_type == 'pdf':
            reader = PdfReader(uploaded_file)
            total_pages = len(reader.pages)
            
            if total_pages > 0:
                selected_page = random.randint(0, total_pages - 1)  # Select a random page
                page_text = reader.pages[selected_page].extract_text()
                extracted_text =  page_text.strip() if page_text.strip() else None
            else:
                extracted_text =  None
            
            
        elif file_type == 'docx':
            document = Document(uploaded_file)
            paragraphs = [p.text for p in document.paragraphs if p.text.strip()]  # Non-empty paragraphs
            total_pages = len(paragraphs)  # Treating paragraphs as "pages" for simplicity

            if total_pages > 0:
                selected_page = random.randint(0, total_pages - 1)  # Select a random page (paragraph)
                extracted_text = paragraphs[selected_page]
            else:
                extracted_text = None
        
        else:
            extracted_text = None
            
            
        if not extracted_text:
            return JsonResponse({'error': 'Failed to extract text from the uploaded file.'}, status=500)
        
        # TODO: Generate questionaire based on the text of the uploaded file
        # TODO: Create new QuizData object to save the current session
        # TODO: Return response that the user can now start the quizes based on the uploaded file
                
    
 