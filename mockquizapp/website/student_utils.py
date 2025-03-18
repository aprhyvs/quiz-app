import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import *


def getStudentStat():
    return

def get_allStudentStats(student):  #Grabs all the stats of the student and prints.
    # Get total stats
    total_stats = {}
    # Get all monthly stats
    monthly_stats = student.monthly_stats.all()
    return total_stats

#JSON Response =================================================================
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