from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import *
from .views_admin import *
from .views_student import *


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
    if request.user.is_authenticated:
        logout(request)
    return JsonResponse({'status': 'success'} , status=200)




@csrf_exempt  # Test for later when uploading PDF is available.
def upload_file(request): #TODO - Make it delete the file upon extracting raw text to send to AI language model
    if request.method == "POST" and request.FILES.get("file"):
        uploaded_file = request.FILES["file"]
        
        # Save file manually (or use Django model)
        file_path = default_storage.save(f"uploads/{uploaded_file.name}", ContentFile(uploaded_file.read()))

        return JsonResponse({"message": "File uploaded successfully!", "file_path": file_path})

    return JsonResponse({"error": "No file provided"}, status=400)



