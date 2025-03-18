import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import *



# STATISTICS
# 1. Total amount of quizes
# 2. Total amount of correct answers
# 3. Total amount of wrong answers
# 4. Graph of monthly total correct answers and wrong answers
# 5. Total of amount quizes take in every month


def getStudentByUsername(username): #Go find the student by only using their username. Returns the student
    student = get_object_or_404(StudentData, username=username)
    return student

def getStudentStat(monthly, student, month, statname):
    stat = 0  # Default value

    if monthly == 0:  # Get total stats
        total_stats = student.total_stats
        stat = getattr(total_stats, statname, 0)  # Get the stat dynamically

    else:  # Get monthly stats for a specific month
        monthly_stats = student.monthly_stats.filter(month=month).first()
        if monthly_stats:
            stat = getattr(monthly_stats, statname, 0)  # Get the stat dynamically

    return stat

def get_allStudentStats(student):  #Grabs all the stats of the student and prints.
    # Get total stats
    total_stats = student.total_stats
    print("Total Quizzes:", total_stats.quiz_amount)
    print("Total Items Answered:", total_stats.total_items_answered)

    # Get all monthly stats
    monthly_stats = student.monthly_stats.all()
    for month_stat in monthly_stats:
        print(f"{month_stat.month}: {month_stat.quiz_amount} quizzes, {month_stat.total_items_correct} correct")
    return total_stats



#Json Response
def getStudentByUsernameRequest(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    username = request.POST.get('username' , None)
    student = get_object_or_404(StudentData, username=username)
    return JsonResponse(student , status=200)

def getStudentStatisticRequest(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)

    student = getStudentByUsername(request.user.username)  # Retrieve student based on username

    if request.method == 'POST':
        try:
            statsToGet = json.loads(request.body).get('statsRequest', {})  # Parse JSON request
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

        stats = {}  # Dictionary to store the requested stats






        ''' Stats Requests table looks like this for example:

        statsRequest = {
    "allTime": {  # Total statistics
        "quizAmount": 13,
        "totalItemsAnswered": 260,
        "totalItemsCorrect": 174,
        "totalItemsIncorrect": 86
    },
    "monthly": {  # Monthly statistics
        "March 2025": {
            "quizAmount": 8,
            "totalItemsAnswered": 160,
            "totalItemsCorrect": 100,
            "totalItemsIncorrect": 60
        },
        "February 2025": {
            "quizAmount": 5,
            "totalItemsAnswered": 100,
            "totalItemsCorrect": 74,
            "totalItemsIncorrect": 26
        }
    }
}
        '''


        # Retrieve all-time (total) statistics
        if "allTime" in statsToGet:
            stats["allTime"] = {}
            for statname in statsToGet["allTime"]:
                stats["allTime"][statname] = getStudentStat(0, student, None, statname)

        # Retrieve monthly statistics
        if "monthly" in statsToGet:
            stats["monthly"] = {}
            for month, statnames in statsToGet["monthly"].items():
                stats["monthly"][month] = {}
                for statname in statnames:
                    stats["monthly"][month][statname] = getStudentStat(1, student, month, statname)

        return JsonResponse(stats, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)