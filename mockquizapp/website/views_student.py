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


def get_student_data(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request.method == 'POST':
        student = StudentData.objects.filter(username = request.user.username).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        studentData = {}
        studentData['fname'] = student.fname
        studentData['mname'] = student.mname
        studentData['lname'] = student.lname
        studentData['school'] = student.school
        studentData['address'] = student.address
        studentData['gmail'] = student.gmail
        studentData['phone'] = student.phone
        studentData['admin_id'] = student.admin_id
        studentData['username'] = student.username
        studentData['created_at'] = student.created_at

        return JsonResponse({"studentData": studentData}, status=200)
    
def get_all_student_stats(request): ## Returns all student data and stats
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request.method == 'POST':
        student = StudentData.objects.filter(username = request.user.username).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        
        stats = {}
        stats['total_quizzes'] = get_total_quizzes_for_student(student)
        stats['total_correct_answers'] = get_sum_of_correct_answers(student)
        stats['total_wrong_answers'] = get_total_wrong_answers_for_student(student)
        stats['monthlyStatistics'] = get_monthly_correct_and_wrong_for_student(student)
        stats['monthlyQuizzesTaken'] = get_monthly_quizzes_taken_for_student(student)
        return JsonResponse({"stats": stats}, status=200)

def get_all_student_data(request): ## Returns all student data and stats
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request.method == 'GET':
        print("Grabbing student...")
        student = StudentData.objects.filter(username = request.user.username).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        data = {}
        studentData = {}
        studentData['fname'] = student.fname
        studentData['mname'] = student.mname
        studentData['lname'] = student.lname
        studentData['school'] = student.school
        studentData['address'] = student.address
        studentData['gmail'] = student.gmail
        studentData['phone'] = student.phone
        studentData['admin_id'] = student.admin_id
        studentData['username'] = student.username
        studentData['created_at'] = student.created_at
    
        stats = {}
        stats['total_quizzes'] = get_total_quizzes_for_student(student)
        stats['total_correct_answers'] = get_sum_of_correct_answers(student)
        stats['total_wrong_answers'] = get_total_wrong_answers_for_student(student)
        ##stats['monthlyStatistics'] = get_monthly_correct_and_wrong_for_student(student)
        ##stats['monthlyQuizzesTaken'] = get_monthly_quizzes_taken_for_student(student)

        data['studentData'] = studentData
        data['stats'] = stats

        return JsonResponse({"studentData": data}, status=200)


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
            monthlyQuizzesTaken = get_monthly_quizzes_taken_for_student(student)
            return JsonResponse({"monthlyQuizzesTaken": monthlyQuizzesTaken}, status=200)
         
    
    
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
                
    
 