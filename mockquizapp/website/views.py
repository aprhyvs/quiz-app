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
        input_data = request.POST
        student_data = {}   # create empty student table

        # --check input data one by one. check if input data contains information.
        if input_data.get('fname', None):
            student_data.fname = input_data.get('fname')
        if input_data.get('mname', None):
            student_data.mname = input_data.get('mname')
        if input_data.get('lname', None):
            student_data.lname = input_data.get('lname')
        if input_data.get('school', None):
            student_data.school = input_data.get('school')
        if input_data.get('address', None):
            student_data.address = input_data.get('address')
        if input_data.get('gmail', None):
            student_data.gmail = input_data.get('gmail')
        if input_data.get('phone', None):
            student_data.phone = input_data.get('phone')
        if input_data.get('username', None):
            username = input_data.get('username')
            if StudentData.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)
            student_data.username = username
        if input_data.get('password', None):
            student_data.password = input_data.get('password')

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



@csrf_exempt  # Test for later when uploading PDF is available.
def upload_file(request): #TODO - Make it delete the file upon extracting raw text to send to AI language model
    if request.method == "POST" and request.FILES.get("file"):
        uploaded_file = request.FILES["file"]
        
        # Save file manually (or use Django model)
        file_path = default_storage.save(f"uploads/{uploaded_file.name}", ContentFile(uploaded_file.read()))

        return JsonResponse({"message": "File uploaded successfully!", "file_path": file_path})

    return JsonResponse({"error": "No file provided"}, status=400)



