from django.db.models import Sum
from django.utils.timezone import now
from .models import QuizData, StudentData

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






