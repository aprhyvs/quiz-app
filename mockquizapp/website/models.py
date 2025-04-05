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
    profile_pic = models.ImageField(upload_to='profile_pics', blank=True, null=True, default=None)
    is_verified = models.BooleanField( default=False)
    account_id = models.IntegerField( blank=True, default=None, null=True)

    def __str__(self):
        return f" {self.pk}. Student: {self.fname} {self.mname} {self.lname}"
    
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
            'profile_pic': self.profile_pic.url if self.profile_pic else None,  # If profile pic is not uploaded, return default picture URL
            'is_verified': self.is_verified
        }


class AdminData(models.Model):
    username = models.CharField(max_length=50 , default="")
    password = models.CharField(max_length=50  , default="")
    created_at = models.DateTimeField( default=timezone.now)
    timer_countdown = models.IntegerField(default=25)
    leaderboard_reset = models.CharField(
        max_length=50 , 
        choices=[
            ("weekly", "Weekly"), 
            ("monthly", "Monthly"), 
            ("yearly", "Yearly")
            ],
        default="weekly"
        )
    safe_level = models.CharField(
        max_length=50 , 
        choices=[
            ("3,6,9,12,15","3,6,9,12,15"),
            ("4,8,12,16","4,8,12,16"), 
            ("5,10,15","5,10,15")
            
        ], 
        default="3,6,9,12,15"
        )
    
    
    
    def __str__(self):
        return f"Admin: {self.username}"
    
    def get_game_settings(self):
        return {
            'timer_countdown': self.timer_countdown,
            'leaderboard_reset': self.leaderboard_reset,
            'safe_level': self.safe_level
        }


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
    raw_generated_questions = models.TextField(default="" )
    raw_generated_json_questions = models.TextField(default="" )
    file_ext = models.CharField(max_length=50 , default="")
    
    game_has_5050 = models.BooleanField(default=False)
    game_has_ai_hint = models.BooleanField(default=False)
    game_has_times2 = models.BooleanField(default=False)
    game_has_pass = models.BooleanField(default=False)

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
    worth_sequence = models.JSONField(default=dict)
    safe_level = models.CharField(default="3,6,9,12,15", max_length=50)
    
    
    def __str__(self):
        return f"Score: {self.number_of_correct} - Student ID: {self.student_id} - Quiz ID: {self.pk}"
    
    def game_data(self):
        data = {
            'game_has_5050': self.game_has_5050,
            'game_has_ai_hint': self.game_has_ai_hint,
            'game_has_times2': self.game_has_times2,
            'game_has_pass': self.game_has_pass,
            'total_worth' : self.total_worth,
            'currently_answered_question' : self.number_of_correct + self.number_of_wrong,
            'safe_level' : self.safe_level
        }
        
        admin_game = AdminData.objects.all().first()
        if admin_game:
            data["timer_countdown"] = admin_game.timer_countdown
            data["safe_level"] = admin_game.safe_level
        
        data["questions"] = []
        for k in self.questions:
            data["questions"].append({
                "number": k,
                "question": self.questions[k]["question"],
                "options": self.questions[k]["options"],
                "correct_answer": None,
                "answered": self.questions[k]["answered"],
                "answer": self.questions[k]["answer"],
                "worth" : self.questions[k]["worth"]
            })
        
        data["worth_sequence"] = self.worth_sequence
        
        return data
        
        
    
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
            'file_ext': self.file_ext
        }
    


class VerificationData(models.Model):
    student_id = models.IntegerField(blank=True, default=None, null=True)
    verification_code = models.CharField(max_length=50 , default="")
    created_at = models.DateTimeField( default=timezone.now)

    def __str__(self):
        return f"Verification: {self.student_id}"

