import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import *

from .admin_utils import *
from .student_utils import *



# STATISTICS
# 1. Total amount of quizes
# 2. Total amount of correct answers
# 3. Total amount of wrong answers
# 4. Graph of monthly total correct answers and wrong answers
# 5. Total of amount quizes take in every month


def getStudentByUsername(username): #Go find the student by only using their username. Returns the student
    student = get_object_or_404(StudentData, username=username)
    return student



#Json Response
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





