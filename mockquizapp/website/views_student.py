import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import *

from .admin_utils import *
from .student_utils import *



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
    if request.method == 'GET':
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
    if request.method == "GET":
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

def get_all_student_quizzes(request): ## Grabs all the student's quizzes for use in javascript.
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    student = StudentData.objects.filter(username = request.user.username).first()
    if not student: 
        return JsonResponse({"error": "Student not found"}, status=404)
    quizzesDict = get_all_student_quizzes_util(student)
    return JsonResponse({"quizzes": quizzesDict}, status=200)

def get_all_student_data(request): ## Returns all student data and stats
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request:
        student = StudentData.objects.filter(username = request.user.username).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        data = get_all_student_data_util(student)
        return JsonResponse({"studentData": data}, status=200)

def get_student_leaderboards(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request.method == 'GET':
        leaderboard = get_student_leaderboards_util()
        return JsonResponse({"leaderboard": leaderboard}, status=200)

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

def get_student_by_id(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        if not student_id:
            return JsonResponse({'error': 'No student ID provided.'}, status=400)
        student = StudentData.objects.filter(id = student_id).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404)
        return JsonResponse(student.get_data(), status=200)

def update_student_data(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        if not student_id:
            return JsonResponse({'error': 'No student ID provided.'}, status=400)
        student = StudentData.objects.filter(id = student_id).first()
        if not student:
            return JsonResponse({'error': 'Student not found.'}, status=404) 
        # Update User object in django configuration
        user = User.objects.filter(username = student.username).first()
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)
        
        fname = request.POST.get('fname' , None)
        mname = request.POST.get('mname', None)
        lname = request.POST.get('lname', None)
        school = request.POST.get('school', None)
        address = request.POST.get('address', None)
        gmail = request.POST.get('gmail', None)
        phone = request.POST.get('phone', None)
        username = request.POST.get('username', None) 
        password = request.POST.get('password', None) 
        profile_pic = request.FILES.get('profile_pic')
        
        
        if fname:
            student.fname =  fname
        if mname:
            student.mname = mname
        if lname:
            student.lname = lname
        if school:
            student.school = school
        if address:
            student.address = address
        if gmail:
            student.gmail = gmail
        if phone:
            student.phone = phone
        
        if fname:
            user.first_name =  fname
        if lname:
            user.last_name = lname
        if username:
            if student.username != username:
                student.username = username 
                user.username = username
        if password:
            user.set_password(password)
        if profile_pic:
            deleteOldProfilePic(student)
            student.profile_pic = profile_pic 
        
        student.save()
        user.save()
        
        
        return JsonResponse({"success": "Student data updated successfully."}, status=200)
        
def get_verified_status(user):
    if not user:
        return
    student = StudentData.objects.filter(username = user.username).first()
    if student:
        return student.is_verified
    