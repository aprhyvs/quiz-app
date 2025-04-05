import json
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from django.utils.timezone import now, timedelta


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
        studentData['profile_pic'] = student.profile_pic.url if student.profile_pic else None,  # If profile pic is not uploaded, return default picture URL
    
        stats = {}
        stats['total_quizzes'] = get_total_quizzes_for_student(student)
        stats['total_correct_answers'] = get_sum_of_correct_answers(student)
        stats['total_wrong_answers'] = get_total_wrong_answers_for_student(student)
        stats['monthlyStatistics'] = get_monthly_correct_and_wrong_for_student(student)
        stats['monthlyQuizzesTaken'] = get_monthly_quizzes_taken_for_student(student)
        stats['rank'] = get_student_rank(student)

        data['studentData'] = studentData
        data['stats'] = stats
        return data

def get_all_student_quizzes_util(student): ## Grabs all the student's quizzes for use in javascript.
    if not student:
        return None
    quizzes = QuizData.objects.filter(student_id=student.pk).order_by('-created_at')
    quizzesDict = [quiz.get_data() for quiz in quizzes]
    return quizzesDict

def deleteOldProfilePic(student):
    if student.profile_pic:
        os.remove(student.profile_pic.path)

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


def get_weekly_rankings_student() -> list:
    # Get the current date and calculate the start of the week (Monday)
    today = now().date()
    start_of_week = today - timedelta(days=today.weekday())  # Monday of the current week
    end_of_week = start_of_week + timedelta(days=6)  # Sunday of the current week

    # Filter QuizData for the current week
    weekly_data = QuizData.objects.filter(
        is_answered = True,
        created_at__date__gte=start_of_week,
        created_at__date__lte=end_of_week
    ).values('student_id').annotate(
        total_score=Sum('total_worth')  # Sum up the correct answers
    ).order_by('-total_score')[:5]  # Limit to top 5 students

    # Add student details to the rankings
    rankings = []
    for rank, data in enumerate(weekly_data, start=1):
        student = StudentData.objects.filter(id=data['student_id']).first()
        if student is None:
            continue
        rankings.append({
            'rank': rank,
            'student_name': f"{student.fname} {student.lname}" if student else "Unknown",
            'total_score': data['total_score'],
            'total_quizzes': get_total_quizzes_for_student(student),
            'total_correct_answers': get_sum_of_correct_answers(student),
            'total_wrong_answers': get_total_wrong_answers_for_student(student),
            'student_pic' : student.profile_pic.url if student.profile_pic else None,  # If profile pic is not uploaded, return default picture URL
        })

    return rankings

def get_monthly_rankings_student() -> list: 
    current_month = now().month
    
    # Filter QuizData for the current month
    monthly_data = QuizData.objects.filter(
        is_answered = True,
        created_at__month=current_month
    ).values('student_id').annotate(
        total_score=Sum('total_worth')
    ).order_by('-total_score')[:5]  # Order by highest score
    # Add student details to the rankings
    rankings = []
    for data in monthly_data:
        student = StudentData.objects.filter(id=data['student_id']).first()
        rankings.append({
            'student_name': f"{student.fname} {student.lname}" if student else "Unknown",
            'total_score': data['total_score'],
            'total_quizzes': get_total_quizzes_for_student(student),
            'total_correct_answers': get_sum_of_correct_answers(student),
            'total_wrong_answers': get_total_wrong_answers_for_student(student),
            'student_pic' : student.profile_pic.url if student.profile_pic else None,  # If profile pic is not uploaded, return default picture URL
        })
    return rankings
 

def get_student_leaderboards_util():
    # Get leaderboards type from admin data, use the right function to get correct leaderboards
    data = {}
    leaderboard_type = AdminData.objects.first().leaderboard_reset
    if leaderboard_type == "weekly":
        data['type'] = "weekly"
        data['rankings'] = get_weekly_rankings_student()
    elif leaderboard_type == "monthly":
        data['type'] = "monthly"
        data['rankings'] = get_monthly_rankings_student()
    return data

def get_student_rank(student):
    leaderboards = get_student_leaderboards_util()
    if leaderboards is None:
        return None
    rankings = leaderboards['rankings']
    for i, ranking in enumerate(rankings):
        if ranking['student_name'] == f"{student.fname} {student.lname}":
            return i + 1
        return None
    return None

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
Following this format:

<index> : <question>
 A : <choice>
 B : <choice>
 C : <choice>
 D : <choice>
 Correct Answer : <letter>
 
 
- Each option must be no more than 5 words.
- Clearly identify the correct answer.

Here is the content;
%s

"""
 
CREATE_QUESTIONS_PROMPT_COMMAND = """
Generate 21 questions with A, B, C, D options based on the provided content. 
Following this format:

<index> : <question>
 A : <choice>
 B : <choice>
 C : <choice>
 D : <choice>
 Correct Answer : <letter>
 
 
- Each option must be no more than 5 words.
- Clearly identify the correct answer.

"""



CONVERT_QUESTIONS_TO_OBJECT_WITH_QUESTIONS = """
Convert the following questions into Python dictionaries using this format:
{
    "<index>": {
        "question": "<question>",
        "options": ["A. <answer>","B. <answer>","C. <answer>","D. <answer>"],
        "correct_answer": "<letter_of_correct_answer>"
    },
    ...
}
Questions:
%s

- Make sure the keys are enclosed in double quotes to make them JSON-compatible. 
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors.
"""

CONVERT_QUESTIONS_TO_OBJECT = """
Convert below questions into Python dictionaries and importantly must following these format:
{
    "<index>": {
        "question": "<question>",
        "options": ["A. <answer>","B. <answer>","C. <answer>","D. <answer>"],
        "correct_answer": "<letter_of_correct_answer>"
    },
    ...
}
- Make sure the keys are enclosed in double quotes to make them JSON-compatible. 
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors. 

Question:
%s
"""
CONVERT_QUESTIONS_TO_OBJECT_COMMAND = """
Convert below questions into Python dictionaries and importantly must following these format:
{
    "<index>": {
        "question": "<question>",
        "options": ["A. <answer>","B. <answer>","C. <answer>","D. <answer>"],
        "correct_answer": "<letter_of_correct_answer>"
    },
    ...
}
- Make sure the keys are enclosed in double quotes to make them JSON-compatible. 
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors. 
"""



CREATE_TITLE_PROMPT_WITH_CONTENT = """
Generate a 5-word quiz title based on the following content and importantly must following these format:
{"title": "<title>"}

Content:
%s

- Make sure the keys are enclosed in double quotes to make them JSON-compatible.
- Remove any trailing commas from objects.
- Ensure that the resulting Python dictionary can be converted to valid JSON without errors.
"""

CREATE_TITLE_PROMPT = """
Generate a 5-word quiz title based on the following content and importantly must following these format:
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

SEPARATOR_OF_DICTIONARY_TEXT_COMMAND = """
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


CONVERT_QUESTIONS_TO_OBJECT_CLEANING = """
Clean and format the provided questions in this structure:
%s

- Ensure all keys and values are enclosed in double quotes for JSON compatibility.
- Remove any trailing commas or unstructured elements from objects.
- Output the cleaned and formatted dictionary as a single line without newlines or unnecessary spaces.
"""
CONVERT_QUESTIONS_TO_OBJECT_CLEANING_COMMAND = """
- Ensure all keys and values are enclosed in double quotes for JSON compatibility.
- Remove any trailing commas or unstructured elements from objects.
- Output the cleaned and formatted dictionary as a single line without newlines or unnecessary spaces.
"""






