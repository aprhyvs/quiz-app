
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User

from .models import *


# STATISTICS
# 1. Total amount of quizes of the students
# 2. Total amount of correct answers of the students
# 3. Total amount of wrong answers of the students
# 4. Graph of monthly total correct answers and wrong answers of students
# 5. Total of amount quizes take in every month of the students
# 6. Total number of the students



def get_list_of_students(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    students = StudentData.objects.all()
    data = { student.id: student.get_data() for student in students}
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
        




