
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User

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




def update_student_data(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        
        if not student_id:
            return JsonResponse({"error": "Student ID not provided"}, status=400)
        
        
        student = StudentData.objects.filter(id=student_id).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        
        fname = request.POST.get('fname', None)
        if fname:
            student.fname = fname
        mname = request.POST.get('mname', None)
        if mname:
            student.mname = mname
        lname = request.POST.get('lname', None)
        if lname:
            student.lname = lname
        school = request.POST.get('school', None)
        if school:
            student.school = school
        address = request.POST.get('address', None)
        if address:
            student.address = address
        gmail = request.POST.get('gmail', None)
        if gmail:
            student.gmail = gmail
        phone = request.POST.get('phone', None)
        if phone:
            student.phone = phone
        username = request.POST.get('username', None)
        if username:
            if StudentData.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)
            student.username = username
        password = request.POST.get('password', None)
        if password:
            student.password = password
        student.save()
        
        return JsonResponse({"message": "Student data updated successfully"}, status=200)
             


def delete_student(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    
    if request.method == 'POST':
        student_id = request.POST.get('student_id' , None)
        
        if not student_id:
            return JsonResponse({"error": "Student ID not provided"}, status=400)
        
        student = StudentData.objects.filter(id=student_id).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        
        User.objects.filter(username=student.username).delete()
        student.delete()
        
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
        


