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
        input_data = json.loads(request.body)
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
                return JsonResponse({"error": "Gmail already exists"}, status=400)
            student_data['gmail']= input_data.get('gmail')
        if input_data.get('phone', None):
            student_data['phone'] = input_data.get('phone')
        if input_data.get('username', None):
            username = input_data.get('username')
            if StudentData.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)
            student_data['username'] = username
        if input_data.get('password', None):
            student_data['password'] = input_data.get('password')

        """ The table above should look like this example after the function is done checking and setting each information to the table

        student_data = {
            'fname': "Jeremiah Alvin"
            'mname': "Perocillo",
            'lname': "Nava", 
            'address': "Block 12, Lot 22, Yagba Road, Brgy. Nursery, Milagros City",
            'gmail': "jeremiahpnava@gmail.com",
            'phone': "09456487069",
            'username' : "JereNava420",
            'password': "$2y$10$P0tkpHtXa30wl9dumSPOjeWWynDVmmp6uSnZUvvqreSSUWVKZTQTy"
        }

        """

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




'''
def login_student_test(request):
        username = "vionsyrion"
        password = "totnakmaster420"
        user = authenticate(username=username, password=password)
        print("test logging in...")
        if user is not None:
            login(request, user)
            print("Login successful")
            return JsonResponse({'status': 'success', 'url': 'student/dashboard'} , status=200)
        else:
            return JsonResponse({'status': 'error, user is none'} , status=400)

'''





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
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    logout(request)

    return JsonResponse({'status': 'success'} , status=200)


#=============================================For Testing ================================

def register_student_demo(request):
    if request.method == 'POST':
        try:
            input_data = json.loads(request.body)  # Get JSON data from request
            student_data = {}

            # Check and store each field if provided
            if input_data.get('fname'):
                student_data['fname'] = input_data['fname']
            if input_data.get('mname'):
                student_data['mname'] = input_data['mname']
            if input_data.get('lname'):
                student_data['lname'] = input_data['lname']
            if input_data.get('school'):
                student_data['school'] = input_data['school']
            if input_data.get('address'):
                student_data['address'] = input_data['address']
            if input_data.get('gmail'):
                if StudentData.objects.filter(gmail=input_data['gmail']).exists():
                    return JsonResponse({"error": "Email already exists"}, status=400)
                student_data['gmail'] = input_data['gmail']
            if input_data.get('phone'):
                student_data['phone'] = input_data['phone']
            if input_data.get('username'):
                if StudentData.objects.filter(username=input_data['username']).exists():
                    return JsonResponse({"error": "Username already exists"}, status=400)
                student_data['username'] = input_data['username']
            if input_data.get('password'):
                student_data['password'] = input_data['password']  # Consider hashing passwords

            # Save to database
            student = StudentData.objects.create(**student_data)

            # Also create a corresponding user (Django's auth model)
            User.objects.create_user(
                username=student_data['username'],
                password=student_data['password'],  # Store hashed password instead
                first_name=student_data['fname'],
                last_name=student_data.get('lname', ''),
                email=student_data['gmail']
            )

            return JsonResponse({'status': 'success'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return render(request, 'registrations_demo/index.html')  # Render the registration page for GET requests


