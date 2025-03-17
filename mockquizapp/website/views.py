from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse, JsonResponse

def home(request):
    return render(request, "home/index.html")

 



