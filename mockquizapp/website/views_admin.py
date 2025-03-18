
from django.http import HttpResponse, JsonResponse

from .models import *


def get_list_of_students(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    students = StudentData.objects.all()
    data = { student.id: student.get_data() for student in students}
    return JsonResponse(data , status=200)








