
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.db.models import Q

from .models import *
from .admin_utils import *
from .student_utils import *


# STATISTICS
# 1. Total amount of quizes of the students - student visit
# 2. Total amount of correct answers of the students - student visit
# 3. Total amount of wrong answers of the students - student visit
# 4. Graph of monthly total correct answers and wrong answers of students - student visit
# 5. Graph of total amount of quizes take in every month of the students - admin
# 6. Total number of the students - admin
# 7. Top 5 Ranking for the month students  - admin
# 6. Top 5 Ranking for the yearly students - admin



def get_list_of_students(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    students = StudentData.objects.all()
    data = { student.pk: student.get_data() for student in students}
    return JsonResponse(data , status=200)

def update_rankings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if not request.user.is_staff:
        return JsonResponse({"error": "User not authorized to fetch rankings"}, status=403)
    students = StudentData.objects.all()
    rankings = {}
    rankings['weekly'] = get_weekly_rankings()
    rankings['monthly'] = get_monthly_rankings()
    return JsonResponse({"rankings": rankings}, status=200)
         
def delete_student(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        
        if not student_id:
            return JsonResponse({"error": "Student ID not provided"}, status=400)
        
        student = StudentData.objects.filter(id=student_id).first()
        verification = VerificationData.objects.filter(student_id=student.pk).first() 
        if verification:
            verification.delete()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
         
        User.objects.filter(username=student.username).delete()
        student.delete()
        
        quizzes = QuizData.objects.filter(student_id=student_id)
        if quizzes.count() > 0:
            quizzes.delete()
        
        return JsonResponse({"message": "Student deleted successfully"}, status=200)
        
def get_student_quizes(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        
        if not student_id:
            return JsonResponse({"error": "Student ID not provided"}, status=400)
        
        student = StudentData.objects.filter(id=student_id).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        
        quizes = QuizData.objects.filter(student_id=student_id)
        data = { quiz.pk: quiz.get_data() for quiz in quizes}
        return JsonResponse(data , status=200)

def delete_student_quiz(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        quiz_id = request.POST.get('quiz_id' , None)
        
        if not student_id:
            return JsonResponse({"error": "Student ID not provided"}, status=400)
        
        if not quiz_id:
            return JsonResponse({"error": "Quiz ID not provided"}, status=400)
        
        student = StudentData.objects.filter(id=student_id).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        
        quiz = QuizData.objects.filter(id=quiz_id).first()
        if not quiz:
            return JsonResponse({"error": "Quiz not found"}, status=404)
        
        quiz.delete()
        
        return JsonResponse({"message": "Quiz deleted successfully"}, status=200)

def get_admin_statistics(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        statsToGet = request.POST.get('statRequest') # statRequest is a table of stats that needs to be retrieved
        
        if not statsToGet:
            return JsonResponse({"error": "Statistics request not provided"}, status=400)
        
        if statsToGet == '1':
            # Get the total number of the registered students
            totalStudents = StudentData.objects.count()
            return JsonResponse({"total_students": totalStudents}, status=200)
        
        if statsToGet == '2':
            # Get the top 5 ranking for the month students
            monthly_rankings = get_monthly_rankings()
            return JsonResponse({"monthly_rankings": monthly_rankings}, status=200)
        
        if statsToGet == '3':
            # Get the top 5 ranking for the yearly students
            yearly_rankings = get_yearly_rankings()
            return JsonResponse({"yearly_rankings": yearly_rankings}, status=200)
        
        if statsToGet == '4':
            # Get the total amount of quizes taken in every month of the students
            monthly_quizes_taken = get_quiz_count_per_month_for_year()
            return JsonResponse({"monthly_quizes_taken": monthly_quizes_taken}, status=200)

def search_users(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        search_term = request.POST.get('search_term' , None)
        print("Search term is: " + search_term)
        if search_term is None:
            return JsonResponse({"error": "Search term not provided"}, status=400)
        if search_term == '':
            users = StudentData.objects.all()
        else:
            
            users = StudentData.objects.filter(
                Q(username__icontains=search_term) |
                Q(fname__icontains=search_term) |
                Q(mname__icontains=search_term) |
                Q(lname__icontains=search_term)
            ) 
        
        data = { user.pk: user.get_data() for user in users}
        return JsonResponse(data , status=200)
    
    return JsonResponse({"error": "Invalid request"}, status=400)


def get_all_student_data_and_stats_from_id(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if not request.user.is_staff:
        return JsonResponse({"error": "User not authorized to fetch student data"}, status=403)
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
    if not student_id:
        return JsonResponse({"error": "Student ID not provided"}, status=400)
    student = get_student_by_id_admin_util(student_id)
    if not student:
        return JsonResponse({"error": "Student not found"}, status=404)
    data = get_all_student_data_util(student)
    return JsonResponse(data, status=200)

def get_game_settings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if not request.user.is_staff:
        return JsonResponse({"error": "User not authorized to fetch game settings"}, status=403)
    if request.method == 'GET':
        game_settings = {}
        gameSettingsObject = AdminData.objects.first()

        game_settings['leaderboards_reset'] = gameSettingsObject.leaderboard_reset
        game_settings['timer_countdown'] = gameSettingsObject.timer_countdown
        game_settings['safe_level'] = gameSettingsObject.safe_level
        if not game_settings:
            return JsonResponse({"error": "Game settings not found"}, status=404)
        return JsonResponse(game_settings, status=200)
    return JsonResponse({"error": "Kupahl"}, status=404)
    
def set_game_settings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if not request.user.is_staff:
        return JsonResponse({"error": "User not authorized to set game settings"}, status=403)
    if request.method == 'POST':
        
        
        game_settings = {}
        game_settings['leaderboard_reset'] = request.POST.get('leaderboard_reset')
        if not game_settings['leaderboard_reset'] or game_settings['leaderboard_reset'] not in ['weekly', 'monthly']:
            return JsonResponse({"error": "Leaderboards reset must be weekly or monthly"}, status=400)
        game_settings['timer_countdown'] = request.POST.get('timer_countdown' , "")
        print(game_settings['timer_countdown'])
        if not game_settings['timer_countdown'] or not game_settings['timer_countdown'].isdigit() or game_settings['timer_countdown'] not in ["25", "30" , "40"]: 
            return JsonResponse({"error": "Timer countdown must be a number"}, status=400)
        game_settings['safe_level'] = request.POST.get('safe_level')
        if not game_settings['safe_level'] or game_settings['safe_level'] not in ["3, 6, 9, 12, 15, 20", "4, 8, 12, 16, 20", "5, 10, 15, 20" ]:
            return JsonResponse({"error": "Safe level must be a number"}, status=400)

        gameSettingsObject = AdminData.objects.first()
        gameSettingsObject.leaderboard_reset = game_settings['leaderboard_reset']
        gameSettingsObject.timer_countdown = game_settings['timer_countdown']
        if game_settings['safe_level'] == "3, 6, 9, 12, 15, 20":
            gameSettingsObject.safe_level = "3,6,9,12,15,20"
        elif game_settings['safe_level'] == "4, 8, 12, 16, 20":
            gameSettingsObject.safe_level = "4,8,12,16,20"
        elif game_settings['safe_level'] == "5, 10, 15, 20":
            gameSettingsObject.safe_level = "5,10,15,20"
        gameSettingsObject.save()
        print("Successfully changed Settings")
        return JsonResponse({"message": "Game settings updated successfully"}, status=200)
    return JsonResponse({"error": "Kupahl"}, status=404)

def get_all_student_quizzes_from_id(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if not request.user.is_staff:
        return JsonResponse({"error": "User not authorized to fetch student data"}, status=403)
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
    if not student_id:
        return JsonResponse({"error": "Student ID not provided"}, status=400)
    student = get_student_by_id_admin_util(student_id)
    if not student:
        return JsonResponse({"error": "Student not found"}, status=404)
    data = get_all_student_quizzes_util(student)
    return JsonResponse({"quizzes": data}, status=200)