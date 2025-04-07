from django.db.models import Sum
from django.utils.timezone import now
from .models import QuizData, StudentData
from django.db.models.functions import ExtractMonth, ExtractYear
from django.db.models import Count 
from django.db.models import Sum
from django.utils.timezone import now, timedelta


def get_quiz_count_per_month_for_year():
    # Automatically get the current year
    current_year = now().year

    # Prepopulate dictionary with all months set to 0
    months_with_zero = {month: 0 for month in range(1, 13)}  # 1 to 12 for January to December

    # Filter quizzes for the current year and group by month
    monthly_data = QuizData.objects.filter(
        is_answered=True,
        created_at__year=current_year
    ).annotate(
        month=ExtractMonth('created_at')
    ).values(
        'month'
    ).annotate(
        quiz_count=Count('id')
    ).order_by('month')

    # Update the prepopulated dictionary with actual quiz counts
    for entry in monthly_data:
        months_with_zero[entry['month']] = entry['quiz_count']

    # Convert month numbers to month names for readability
    month_names = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April',
        5: 'May', 6: 'June', 7: 'July', 8: 'August',
        9: 'September', 10: 'October', 11: 'November', 12: 'December'
    }
    result = [value for key, value in months_with_zero.items()]

    return result

def get_weekly_rankings() -> list:
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
        rankings.append({
            'rank': rank,
            'student_name': f"{student.fname} {student.lname}" if student else "Unknown",
            'total_score': data['total_score'],
        })

    return rankings

def get_monthly_rankings() -> list: 
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
            'profile_pic': student.profile_pic.url if student.profile_pic else None,
        })
    return rankings
 
def get_yearly_rankings():
    
    current_year = now().year
    
    # Filter QuizData for the current year
    yearly_data = QuizData.objects.filter(
        is_answered = True,
        created_at__year=current_year
    ).values('student_id').annotate(
        total_score=Sum('total_worth')
    ).order_by('-total_score')[:5]  # Order by highest score
    
    # Add student details to the rankings
    rankings = []
    for data in yearly_data:
        student = StudentData.objects.filter(id=data['student_id']).first()
        rankings.append({
            'student_name': f"{student.fname} {student.lname}" if student else "Unknown",
            'total_score': data['total_score'],
            'profile_pic': student.profile_pic.url if student.profile_pic else None,
        })
    print(rankings)
    return rankings

def get_student_quizzes(student):
    quizzes = QuizData.objects.filter(student_id=student.pk, is_answered=True)
    return quizzes

def get_student_quizzes_total_worth(quizzes):

    quizzes_total_worth = quizzes.aggregate(total_worth_sum=Sum('total_worth'))['total_worth_sum'] or 0
    return quizzes_total_worth

def get_student_by_id_admin_util(student_id):
        if not student_id:
            return
        student = StudentData.objects.filter(id = student_id).first()
        if not student:
            return
        return student
