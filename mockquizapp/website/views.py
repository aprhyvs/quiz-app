from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.middleware.csrf import get_token


from .models import *
from .views_admin import *
from .views_student import *
from .views_game import *


#============================== Views Webpages Pages ===============================
def home(request): 
    return render(request, "home/index.html")

def login_page(request):
    return render(request, "login/index.html")

def register_page(request):
    return render(request, 'registrations/index.html')  # Render the registration page for GET requests

def admin_login_page(request):
    return render(request, "login_admin/index.html")

def admin_dashboard(request):
    if not request.user.is_authenticated:
        if not AdminData.objects.filter(username=request.user.username).exists():
            return redirect('home')
    
    
    if request.user.is_staff:
        return render(request, "admin_dashboard/index.html")
    
    return redirect('home')

def student_analytics(request): 
    if not request.user.is_authenticated:
        if not AdminData.objects.filter(username=request.user.username).exists():
            return redirect('home')
    return render(request, "admin_visit/index.html")

def student_quizzespage(request):
    if not request.user.is_authenticated:
        return redirect('home')
    return render(request, "quizzes_page/index.html")

def student_dashboard(request):
    if not request.user.is_authenticated:
        return redirect('home')
    return render(request, "student_dashboard/index.html")

def admin_editor(request):
    if not request.user.is_authenticated:
        if not AdminData.objects.filter(username=request.user.username).exists():
            return redirect('home')
    return render(request, "admin_editor/index.html")

#=================================  Views API Routes =================================
def register_student(request):
    if request.method == 'POST':
        input_data = request.POST
        if not input_data:
            return JsonResponse({"error": "No input data provided"}, status=400)
        print(input_data)
        student_data = {}   # create empty student table
        # --check input data one by one. check if input data contains information.
        if input_data.get('fname', None):
            student_data['fname'] = input_data.get('fname')
        if input_data.get('mname', None):
            student_data['mname'] = input_data.get('mname')
        if input_data.get('lname', None):
            student_data['lname'] = input_data.get('lname')
        if input_data.get('school', None):
            student_data['school'] = input_data.get('school')
        if input_data.get('address', None):
            student_data['address'] = input_data.get('address')
        if input_data.get('gmail', None):
            if StudentData.objects.filter(gmail=input_data.get('gmail')).exists():
                print("Gmail already exists!")
                return JsonResponse({"error": "Gmail already exists"}, status=400)
            student_data['gmail']= input_data.get('gmail')
        if input_data.get('phone', None):
            student_data['phone'] = input_data.get('phone')
        if input_data.get('username', None):
            username = input_data.get('username')
            if StudentData.objects.filter(username=username).exists() or AdminData.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)
            student_data['username'] = username
        if input_data.get('password', None):
            student_data['password'] = input_data.get('password')
        # Save student data to database
        StudentData.objects.create(**student_data)
        user = User.objects.create(
            username=student_data['username'],
            #password=student_data['password'],  # Store hashed password instead
            first_name=student_data['fname'],
            last_name=student_data.get('lname', ''),
            email=student_data['gmail']
        )
        user.set_password(student_data['password'])  # Hashes the password
        user.save()
        return JsonResponse({'status': 'success'} , status=200)
    
    return JsonResponse({'csrfToken': get_token(request)})

def login_student(request):
    if request.method == 'POST':
        input_data = request.POST
        username = input_data.get('username')
        if not username:
            return JsonResponse({"error": "Enter a valid username"}, status=400)
        password = input_data.get('password')
        if not password:
            return JsonResponse({"error": "Enter password"}, status=400)
        
        user = authenticate(username=username, password=password)
        
        
        if user is not None:

            if user.is_staff:
                return JsonResponse({"error": "Invalid Username"}, status=403)


            login(request, user)
            return JsonResponse({'status': 'success', 'url': '/student_dashboard/'}, status=200)
        else:
            studentName = StudentData.objects.filter(username = input_data.get('username')).first()
            if studentName:

                return JsonResponse({"error": "Invalid Password"}, status=403)
            return JsonResponse({"error": "Invalid Username"} , status=400)
        
    return JsonResponse({'csrfToken': get_token(request)})

def login_admin(request):
    if request.method == 'POST':
        input_data = request.POST
        username = input_data.get('username')
        password = input_data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_staff:
                login(request, user)
                return JsonResponse({'status': 'success', 'url': 'admin_dashboard/'} , status=200)
            else:
                return JsonResponse({'error': 'User does not have admin status'} , status=403)
        else:
            return JsonResponse({'error': 'User does not exist'} , status=400)
    return JsonResponse({'status': 'error'} , status=400)

def logout_request(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    logout(request)

    return JsonResponse({'status': 'success'} , status=200)

#=============================================For Testing ================================
