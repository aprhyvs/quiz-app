from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.conf import settings

from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.middleware.csrf import get_token

from django.core.mail import send_mail
from django.core.mail import EmailMessage
from mockquizapp.settings import EMAIL_HOST_USER
from django.template.loader import render_to_string
import threading

from .models import *
from .views_admin import *
from .views_student import *
from .views_game import *

import random
import string


# pip install pillow


#============================== Views Webpages Pages ===============================
def home(request): 
    return render(request, "home/index.html")

def login_page(request):
    return render(request, "login/index.html")

def register_page(request):
    return render(request, 'registrations/index.html')  # Render the registration page for GET requests

def admin_login_page(request):
    return render(request, "login_admin/index.html")

def verify_success(request):
    return render(request, "verify_success/index.html")

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

def student_leaderboard(request):
    if not request.user.is_authenticated:
        return redirect('home')
    return render(request, "student_leaderboard/index.html")

def student_dashboard(request):
    if not request.user.is_authenticated:
        return redirect('home')
    return render(request, "student_dashboard/index.html")

def game_quiz(request):
    #if not request.user.is_authenticated:
    #    return redirect('home')
    return render(request, "game_quiz/index.html")

def quiz_complete(request):
    #if not request.user.is_authenticated:
    #    return redirect('home')
    return render(request, "quiz_complete/index.html")

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
        if request.FILES.get('image' , None):
            print("Image gotten!")
            student_data['profile_pic'] = request.FILES.get('image')
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
        
        studentDataObject = StudentData.objects.create(**student_data)
        user = User.objects.create(
            username=student_data['username'],
            #password=student_data['password'],  # Store hashed password instead
            first_name=student_data['fname'],
            last_name=student_data.get('lname', ''),
            email=student_data['gmail']
        )
        
        studentDataObject.account_id = user.pk # Connection to its USER account
        studentDataObject.save()
        
        verification = VerificationData.objects.create()
        verification.verification_code = str(verification.pk) + "".join(random.choices(string.ascii_letters, k=30))
        verification.student_id = studentDataObject.pk
        verification.save()
        user.set_password(student_data['password'])  # Hashes the password
        user.save()

        # Threading na matapok san email sa register email
        # verification_code , template , masbate_locker_email , subject
        # Thread(target=my_utils.send_verification_email, args=(
        #     email_address, verification , 'email-template.html', settings.EMAIL_HOST_USER, 'School Registration' , request
        # )).start()

        email_thread = threading.Thread(target=send_email, args=(request, studentDataObject, student_data['gmail']) )
        email_thread.start()
        
        return JsonResponse({'status': 'success'} , status=200)
    
    return JsonResponse({'csrfToken': get_token(request)})

def send_email(request, student, to_email):
    mail_subject = "Activate your GameIQ account"
    verificationData = VerificationData.objects.filter(student_id=student.pk).first()
    message = render_to_string('emails/verification_email.html', {
        'student': student,
        'verification_code': verificationData.verification_code,
        'protocol': 'https' if request.is_secure() else 'http',
        'hostname': request.get_host() or settings.SITE_DOMAIN

    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    email.content_subtype = 'html'  # This tells Django the email content is HTML
    
    if email.send():
        print("Email sent successfully!")
    else:
        print("Error sending email!")

def login_student(request):
    print("Fired Login")
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
            verified = get_verified_status(user)
            if verified == True:
                login(request, user)
            else:
                print("Not verified")
                return JsonResponse({"error": "Not verified"}, status=403)
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
                if not AdminData.objects.filter(username=request.user.username).exists():
                    admin = AdminData.objects.create(username=request.user.username)
                    admin.save()
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

def verify_email(request, verification_code):
    if request.method == 'GET':
        if not verification_code:
            return JsonResponse({"error": "No verification code provided"}, status=400)
        verification = VerificationData.objects.filter(verification_code=verification_code).first()
        if not verification:
            return JsonResponse({"error": "Invalid verification code"}, status=400)
        student = StudentData.objects.filter(pk=verification.student_id).first()
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        user = User.objects.filter(username=student.username).first()
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)
        student.is_verified = True
        student.save()
        print("Student " + student.username + " Verified!")
        verification.delete()
        
    return redirect('verify-success')






#=============================================For Testing ================================
