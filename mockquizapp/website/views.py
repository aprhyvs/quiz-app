from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

from .models import *


#============================== Views Pages ===============================
def home(request):
    return render(request, "home/index.html")

 






#=================================  API Routes =================================
def register_student(request):
    if request.method == 'POST':
        student_data = request.POST
        student_data = {
            'fname': student_data.get('fname'),
            'mname': student_data.get('mname'),
            'lname': student_data.get('lname'), 
            'address': student_data.get('address'),
            'gmail': student_data.get('gmail'),
            'phone': student_data.get('phone'),
            'username' : student_data.get('username'),
            'password': student_data.get('password')
        }
        # Save student data to database
        StudentData.objects.create(**student_data)
        User.objects.create(
            username=student_data.get('username'),
            password=student_data.get('password'),
            first_name=student_data.get('fname'),
            last_name=student_data.get('lname'),
            email=student_data.get('gmail')
        )
        return JsonResponse({'status': 'success'} , status=200)
    
    return JsonResponse({'status': 'error'} , status=400)



def login_student(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'status': 'success', 'url': 'student/dashboard'} , status=200)
        else:
            return JsonResponse({'status': 'error'} , status=400)
    return JsonResponse({'status': 'error'} , status=400)



def login_admin(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_staff:
                login(request, user)
                return JsonResponse({'status': 'success', 'url': 'admin/dashboard'} , status=200)
            else:
                return JsonResponse({'status': 'error'} , status=403)
        else:
            return JsonResponse({'status': 'error'} , status=400)
    return JsonResponse({'status': 'error'} , status=400)


def logout_student(request):
    logout(request)
    return JsonResponse({'status': 'success'} , status=200)