import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.db.models.functions import ExtractMonth

from .models import *

import os
 
  

def identify_file_type(uploaded_file):
    # Get the file extension
    file_extension = os.path.splitext(uploaded_file.name)[1].lower()
    
    if file_extension == '.docx':
        return 'docx'
    elif file_extension == '.pdf':
        return 'pdf'
    elif file_extension == '.txt':
        return 'txt'
    else:
        return 'invalid'
 
def getStudentStatisticRequest(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    stats = {}

    return JsonResponse(stats, status=200)

def getStudentQuizListRequest(request):
    print("Firing Student Quiz List...")
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    student = request.user
    quizzes = QuizData.objects.filter(student_id=student.id).order_by('-created_at')
    data = {quiz.pk: quiz.get_data() for quiz in quizzes}
    return JsonResponse(data, status=200)



def get_total_quizzes_for_student(student):
    # Filter QuizData based on the student's ID
    total_quizzes = QuizData.objects.filter(student_id=student.id).count()
    return total_quizzes


def get_sum_of_correct_answers(student):
    # Filter QuizData based on the student's ID and sum the number_of_correct field
    total_correct_answers = QuizData.objects.filter(student_id=student.id).aggregate(
        total_correct=Sum('number_of_correct')
    )['total_correct']
    
    # Return the sum, defaulting to 0 if no correct answers are found
    return total_correct_answers or 0
 

def get_total_wrong_answers_for_student(student):
    # Filter QuizData based on the student's ID and sum the number_of_wrong field
    total_wrong_answers = QuizData.objects.filter(student_id=student.id).aggregate(
        total_wrong=Sum('number_of_wrong')
    )['total_wrong']
    
    # Return the sum, defaulting to 0 if no wrong answers are found
    return total_wrong_answers or 0
 
def get_monthly_correct_and_wrong_for_student(student):
    # Filter by the student_id and group by month
    data = QuizData.objects.filter(student_id=student.id).annotate(
        month=ExtractMonth('created_at')
    ).values(
        'month'
    ).annotate(
        total_correct=Sum('number_of_correct'),
        total_wrong=Sum('number_of_wrong')
    ).order_by('month')
    
    return data

def get_monthly_quizzes_taken_for_student(student):
    # Filter by the student_id and group by month
    data = QuizData.objects.filter(student_id=student.id).annotate(
        month=ExtractMonth('created_at')
    ).values(
        'month'
    ).annotate(
        total_quizzes=Sum('id')  # Or use .count() to count records
    ).order_by('month')
    
    return data
