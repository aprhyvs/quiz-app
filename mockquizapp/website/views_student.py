from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User

from .models import *


# STATISTICS
# 1. Total amount of quizes
# 2. Total amount of correct answers
# 3. Total amount of correct answers
# 4. Graph of monthly total correct answers and wrong answers
# 5. Total of amount quizes take in every month


def get_student_statistics(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    student = request.user

    if request.method == 'POST':
        statsToGet = request.POST.get('statRequest') # statRequest is a table of stats that needs to be retrieved


        
        stats = {}

    return JsonResponse(stats , status=200)
