from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User

from .models import *


# STATISTICS




def get_student_statistics(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    student = request.user

    if request.method == 'POST':
        statsToGet = request.POST.get('statRequest') # statRequest is a table of stats that needs to be retrieved


        
        stats = {}

    return JsonResponse(stats , status=200)
