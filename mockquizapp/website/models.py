from django.db import models
from django.utils import timezone

# Create your models here.
def local_timezone():
    return timezone.localtime(timezone.now())

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
    created_at = models.DateTimeField( default=local_timezone)
    profile_pic = models.ImageField(upload_to='profile_pics', blank=True, null=True, default=None)
    is_verified = models.BooleanField( default=False)
    account_id = models.IntegerField( blank=True, default=None, null=True)
    age = models.IntegerField( blank=True, default=None, null=True)
    school_attended = models.CharField(max_length=200 , default="")
    course = models.CharField(max_length=200 , default="")

    def __str__(self):
        return f" {self.pk}. Student: {self.fname} {self.mname} {self.lname}"
    
    def get_data(self) -> dict:
        data = {
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
            # 'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S %p'),  
            'profile_pic': self.profile_pic.url if self.profile_pic else None,  # If profile pic is not uploaded, return default picture URL
            'is_verified': self.is_verified,
            'course': self.course,
            'school_attended': self.school_attended,
            'age': self.age
        }
        local_created_at = timezone.localtime(self.created_at)
        #data['created_at'] = local_created_at.strftime('%Y-%m-%d %H:%M:%S %p')
        data['created_at'] = local_created_at.strftime('%Y-%m-%d %I:%M:%S %p')
        return data


class AdminData(models.Model):
    username = models.CharField(max_length=50 , default="")
    password = models.CharField(max_length=50  , default="")
    created_at = models.DateTimeField( default=local_timezone)
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
            ("3,6,9,12,15,20","3,6,9,12,15,20"),
            ("4,8,12,16,20","4,8,12,16,20"), 
            ("5,10,15,20","5,10,15,20")
            
        ], 
        default="3,6,9,12,15,20"
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
    created_at = models.DateTimeField( default=local_timezone)
    is_answered = models.BooleanField(default=False)
    number_of_answered_questions = models.IntegerField(default=0)
    quiz_title = models.CharField(max_length=50 , default="")
    total_worth = models.IntegerField(default=0)
    questions = models.JSONField(default=dict , blank=True, null=True)
    upload_stage = models.IntegerField(default=0)
    raw_file_content = models.TextField(default="" )
    raw_generated_questions = models.TextField(default="" )
    raw_generated_json_questions = models.TextField(default="" )
    file_ext = models.CharField(max_length=50 , default="")
    
    game_has_5050 = models.BooleanField(default=False)
    game_data_5050 = models.JSONField(default=dict, blank=True, null=True)
    game_has_ai_hint = models.BooleanField(default=False)
    game_data_ai_hint = models.JSONField(default=dict, blank=True, null=True)
    game_has_times2 = models.BooleanField(default=False)
    game_data_times2 = models.JSONField(default=dict, blank=True, null=True)
    game_has_pass = models.BooleanField(default=False)
    game_5050_question_index = models.CharField(max_length=3 , default="" , blank=True, null=True)
    game_times2_question_index = models.CharField(max_length=3 , default="" , blank=True, null=True)
    game_pass_question_index = models.CharField(max_length=3 , default="", blank=True, null=True)
    game_ai_hint_question_index = models.CharField(max_length=3 , default="" , blank=True, null=True)

    """
        questions = {
            "1": {
                "question": "What is the capital of France?",
                "options": ["London", "Paris", "Berlin", "Madrid"],
                "correct_answer": "Paris",
                "answered": False,
                "answer": None,
                "worth" : 100,
                "is_correct" : False
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
    safe_level = models.CharField(default="3,6,9,12,15,20", max_length=50)
    
    
    
    
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
            'safe_level' : self.safe_level,
            'quiz_title' : self.quiz_title,
            'is_answered' : self.is_answered,
            'number_of_correct' : self.number_of_correct,
            'number_of_wrong' : self.number_of_wrong,
            "questions" : []
        }
        
        admin_game = AdminData.objects.all().first()
        if admin_game:
            data["timer_countdown"] = admin_game.timer_countdown
            data["safe_level"] = admin_game.safe_level
            
        for k in self.questions:
            data["questions"].append({
                "number": k,
                "question": self.questions[k].get("question", None),
                "options": self.questions[k].get("options", None),
                "correct_answer": None,
                "answered": self.questions[k].get("answered", False),
                "answer": self.questions[k].get("answer", None),
                "worth" : self.questions[k].get("worth", 0),
            })
        
        data["worth_sequence"] = self.worth_sequence
        
        return data
        
        
    
    def get_data(self) -> dict:
        data = {
            'number_of_correct': self.number_of_correct,
            'number_of_wrong': self.number_of_wrong,
            'student_id': self.student_id,
            # 'created_at': self.created_at,
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
        
        local_created_at = timezone.localtime(self.created_at)
        #data['created_at'] = local_created_at.strftime('%Y-%m-%d %H:%M:%S %p')
        data['created_at'] = local_created_at.strftime('%Y-%m-%d %I:%M:%S %p')
        return data
    


class VerificationData(models.Model):
    student_id = models.IntegerField(blank=True, default=None, null=True)
    verification_code = models.CharField(max_length=50 , default="")
    created_at = models.DateTimeField( default=local_timezone)

    def __str__(self):
        return f"Verification: {self.student_id}"

