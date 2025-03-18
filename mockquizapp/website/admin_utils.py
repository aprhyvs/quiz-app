from django.db.models import Sum
from django.utils.timezone import now
from .models import QuizData, StudentData
from django.db.models.functions import ExtractMonth, ExtractYear
from django.db.models import Count 
 
def get_quiz_count_per_month_for_year():
    # Automatically get the current year
    current_year = now().year

    # Filter quizzes for the current year and group by month
    monthly_data = QuizData.objects.filter(
        created_at__year=current_year
    ).annotate(
        month=ExtractMonth('created_at')
    ).values(
        'month'
    ).annotate(
        quiz_count=Count('id')
    ).order_by('month')

    # Format the result as a dictionary for better readability
    monthly_quiz_counts = {entry['month']: entry['quiz_count'] for entry in monthly_data}
    return monthly_quiz_counts


def get_monthly_rankings() -> list: 
    current_month = now().month
    current_year = now().year
    
    # Filter QuizData for the current month
    monthly_data = QuizData.objects.filter(
        created_at__year=current_year,
        created_at__month=current_month
    ).values('student_id').annotate(
        total_score=Sum('number_of_correct')
    ).order_by('-total_score')[:5]  # Order by highest score
    
    # Add student details to the rankings
    rankings = []
    for data in monthly_data:
        student = StudentData.objects.filter(id=data['student_id']).first()
        rankings.append({
            'student_name': f"{student.fname} {student.lname}" if student else "Unknown",
            'total_score': data['total_score'],
        })
    
    return rankings

 

def get_yearly_rankings():
    current_year = now().year
    
    # Filter QuizData for the current year
    yearly_data = QuizData.objects.filter(
        created_at__year=current_year
    ).values('student_id').annotate(
        total_score=Sum('number_of_correct')
    ).order_by('-total_score')[:5]  # Order by highest score
    
    # Add student details to the rankings
    rankings = []
    for data in yearly_data:
        student = StudentData.objects.filter(id=data['student_id']).first()
        rankings.append({
            'student_name': f"{student.fname} {student.lname}" if student else "Unknown",
            'total_score': data['total_score'],
        })
    
    return rankings






