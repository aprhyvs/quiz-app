import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.db.models.functions import ExtractMonth

from .models import *

import os
 
  

def identify_file_type(uploaded_file):
    # Get the file extension
    file_extension = os.path.splitext(uploaded_file.name)[1].lower()
    
    if file_extension == '.docx':
        return 'docx'
    elif file_extension == '.pdf':
        return 'pdf'
    elif file_extension == '.txt':
        return 'txt'
    else:
        return 'invalid'
 
def getStudentStatisticRequest(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    stats = {}

    return JsonResponse(stats, status=200)

def getStudentQuizListRequest(request):
    print("Firing Student Quiz List...")
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    student = request.user
    quizzes = QuizData.objects.filter(student_id=student.id).order_by('-created_at')
    if not quizzes:
        return JsonResponse({"error": "No quizzes found"}, status=404)
    data = {quiz.pk: quiz.get_data() for quiz in quizzes}
    return JsonResponse(data, status=200)

def get_all_student_data_util(student): ## Returns all student data and stats
        if not student:
            return JsonResponse({"error": "Student not found"}, status=404)
        data = {}
        studentData = {}
        studentData['fname'] = student.fname
        studentData['mname'] = student.mname
        studentData['lname'] = student.lname
        studentData['school'] = student.school
        studentData['address'] = student.address
        studentData['gmail'] = student.gmail
        studentData['phone'] = student.phone
        studentData['admin_id'] = student.admin_id
        studentData['username'] = student.username
        studentData['created_at'] = student.created_at
    
        stats = {}
        stats['total_quizzes'] = get_total_quizzes_for_student(student)
        stats['total_correct_answers'] = get_sum_of_correct_answers(student)
        stats['total_wrong_answers'] = get_total_wrong_answers_for_student(student)
        stats['monthlyStatistics'] = get_monthly_correct_and_wrong_for_student(student)
        stats['monthlyQuizzesTaken'] = get_monthly_quizzes_taken_for_student(student)

        data['studentData'] = studentData
        data['stats'] = stats
        print(data)
        return data

def get_all_student_quizzes_util(student): ## Grabs all the student's quizzes for use in javascript.
    if not student:
        return None
    quizzes = QuizData.objects.filter(student_id=student.pk).order_by('-created_at')
    quizzesDict = [quiz.get_data() for quiz in quizzes]
    return quizzesDict

def get_total_quizzes_for_student(student):
    # Filter QuizData based on the student's ID
    total_quizzes = QuizData.objects.filter(student_id=student.id).count()
    return total_quizzes

def get_sum_of_correct_answers(student):
    # Filter QuizData based on the student's ID and sum the number_of_correct field
    total_correct_answers = QuizData.objects.filter(student_id=student.id).aggregate(
        total_correct=Sum('number_of_correct')
    )['total_correct']
    
    # Return the sum, defaulting to 0 if no correct answers are found
    return total_correct_answers or 0
 
def get_total_wrong_answers_for_student(student):
    # Filter QuizData based on the student's ID and sum the number_of_wrong field
    total_wrong_answers = QuizData.objects.filter(student_id=student.id).aggregate(
        total_wrong=Sum('number_of_wrong')
    )['total_wrong']
    
    # Return the sum, defaulting to 0 if no wrong answers are found
    return total_wrong_answers or 0
 
def get_monthly_correct_and_wrong_for_student(student):
    # Filter by the student_id and group by month
    data = QuizData.objects.filter(student_id=student.id).annotate(
        month=ExtractMonth('created_at')
    ).values(
        'month'
    ).annotate(
        total_correct=Sum('number_of_correct'),
        total_wrong=Sum('number_of_wrong')
    ).order_by('month')
    
    # Convert the queryset to a dictionary
    monthly_correct_and_wrong = {entry['month']: entry for entry in data}
    return monthly_correct_and_wrong
     

def get_monthly_quizzes_taken_for_student(student):
    # Filter by the student_id and group by month
    data = QuizData.objects.filter(student_id=student.id).annotate(
        month=ExtractMonth('created_at')
    ).values(
        'month'
    ).annotate(
        total_quizzes=Sum('id')  # Or use .count() to count records
    ).order_by('month')
    
    # Convert the queryset to a dictionary
    monthly_quiz_counts = {entry['month']: entry for entry in data}
    return monthly_quiz_counts





# def send_verification_email(user_email, verification_code , template , masbate_locker_email , subject, request):
#     subject = subject 
#     from_email = masbate_locker_email
#     to_email = user_email
 
#     deped_logo_url = request.build_absolute_uri(static('logo.png'))
#     # Render the HTML template 
#     html_content = render_to_string(template, {
#         'verification_code': verification_code ,
#         'deped_logo' : deped_logo_url,
#         'verification_for' : subject
#     })
#     text_content = strip_tags(html_content)  # Create a plain text version

#     # Create the email
#     email = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
#     email.attach_alternative(html_content, "text/html")
#     initial_delay=5
#     while True:
#         try:
#             email.send()
#             print("Email Sent Successfully")
#             break
#         except Exception as e:
#             time.sleep(1000)
#             time.sleep(initial_delay)
#             initial_delay *= 2  # Exponential backoff




CREATE_QUESTIONS_PROMPT_WITH_CONTENT = """
Generate 21 questions with A, B, C, D options based on this content:
%s

- Each option must be no more than 5 words.
- Clearly identify the correct answer.
"""

 
CREATE_QUESTIONS_PROMPT = """
Generate 21 questions with A, B, C, D options based on the provided content.

- Each option must be no more than 5 words.
- Clearly identify the correct answer.
"""


CONVERT_QUESTIONS_TO_OBJECT_WITH_QUESTIONS = """
Convert the following questions into Python dictionaries using this format:
{"<index>":{"question": "<question>","options": ["<A>", "<B>", "<C>", "<D>"],"correct_answer": "<index_of_correct_answer>"},...}

Questions:
%s

- Make sure the keys are enclosed in double quotes to make them JSON-compatible.
- Remove any trailing commas from objects.
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors.
"""

CONVERT_QUESTIONS_TO_OBJECT = """
Convert these questions into Python dictionaries:
{"<index>":{"question": "<question>","options": ["<A>", "<B>", "<C>", "<D>"],"correct_answer": "<index_of_correct_answer>"},...}

- Make sure the keys are enclosed in double quotes to make them JSON-compatible.
- Remove any trailing commas from objects.
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors.
- Do not use newlines in the output.
"""


CREATE_TITLE_PROMPT_WITH_CONTENT = """
Generate a 5-word quiz title based on the following content in this format:
{"title": "<title>"}

%s

- Make sure the keys are enclosed in double quotes to make them JSON-compatible.
- Remove any trailing commas from objects.
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors.
"""

CREATE_TITLE_PROMPT = """
Generate a 5-word quiz title based on the following content in this format:
{"title": "<title>"}

- Make sure the keys are enclosed in double quotes to make them JSON-compatible.
- Remove any trailing commas from objects.
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors.
"""

SEPARATOR_OF_DICTIONARY_TEXT = """
Here is an unformatted Python dictionary:
%s

I need you to:
1. Auto-format the dictionary to fix any unstructured elements.
   - Correct improperly escaped characters (e.g., \\").
   - Remove any irrelevant or extraneous text around the dictionary.
   - Ensure the result is a valid Python dictionary, fully JSON-compatible.
2. Treat the cleaned and formatted result as a Python dictionary.
3. Extract the value corresponding to the key: %s.
4. Return the value associated with this key as a JSON-formatted dictionary object.

If the key does not exist, respond with: "Key '%s' not found."

"""