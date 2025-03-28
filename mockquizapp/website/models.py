from django.db import models
from django.utils import timezone

# Create your models here.

class StudentData(models.Model):
    fname = models.CharField(max_length=50 , default="")
    mname = models.CharField(max_length=50 , default="")
    lname = models.CharField(max_length=50 , default="")
    school = models.CharField(max_length=50 , default="")
    address = models.CharField(max_length=50 , default="")
    gmail = models.CharField(max_length=50 , default="")
    phone = models.CharField(max_length=50 , default="")
    admin_id = models.IntegerField(blank=True, default=None, null=True)
    username = models.CharField(max_length=50 , default="")
    password = models.CharField(max_length=50  , default="")
    created_at = models.DateTimeField( default=timezone.now)

    def __str__(self):
        return f"Student: {self.fname} {self.mname} {self.lname}"
    
    def get_data(self) -> dict:
        return {
            'fname': self.fname,
            'mname' : self.mname,
            'lname': self.lname,
            'address': self.address,
            'gmail': self.gmail,
            'phone': self.phone,
            'admin_id': self.admin_id,
            'username': self.username, 
            'school': self.school,
            'id': self.pk,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S %p'),  
        }


class AdminData(models.Model):
    username = models.CharField(max_length=50 , default="")
    password = models.CharField(max_length=50  , default="")
    created_at = models.DateTimeField( default=timezone.now)
    
    def __str__(self):
        return f"Admin: {self.username}"


class QuizData(models.Model):
    number_of_correct = models.IntegerField(default=0)
    number_of_wrong = models.IntegerField(default=0)
    student_id = models.IntegerField(blank=True, default=None, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_answered = models.BooleanField(default=False)
    number_of_answered_questions = models.IntegerField(default=0)
    quiz_title = models.CharField(max_length=50 , default="")
    total_worth = models.IntegerField(default=0)
    questions = models.JSONField(default=dict)
    upload_stage = models.IntegerField(default=0)
    raw_file_content = models.TextField(default="" )
    file_type = models.CharField(max_length=50 , default="")

    """
        questions = {
            "1": {
                "question": "What is the capital of France?",
                "options": ["London", "Paris", "Berlin", "Madrid"],
                "correct_answer": "Paris",
                "answered": False,
                "answer": None,
                "worth" : 100
            },
        }
    """
    """
    upload_stage:
        0 = Creating a questions
        1 = Done Creating Questions and Ready to convert python objects dictionary
        2 = Questions are converted to python objects dictionary and Ready to create quiz title
        3 = Title are converted to python objects dictionary and Ready to start the quiz
    """
    
    
    def __str__(self):
        return f"Score: {self.number_of_correct} - Student ID: {self.student_id}"
    
    def calculate_score(self):
        # Assuming each correct answer gives 1 point
        return self.number_of_correct or 0
    
    def get_data(self) -> dict:
        return {
            'number_of_correct': self.number_of_correct,
            'number_of_wrong': self.number_of_wrong,
            'student_id': self.student_id,
            'created_at': self.created_at,
            'questions': self.questions,
            'id': self.pk,
            'is_answered': self.is_answered,
            'number_of_answered_questions': self.number_of_answered_questions,
            'quiz_title': self.quiz_title,
            'total_worth': self.total_worth,
            'upload_stage': self.upload_stage,
            'raw_file_content': self.raw_file_content,
            'file_type': self.file_type
        }
    


class UploadedFile(models.Model):
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(default=timezone.now)
