from django.db import models

# Create your models here.

class StudentData(models.Model):
    fname = models.CharField(max_length=50 , blank=True, default=None, null=True)
    mname = models.CharField(max_length=50 , blank=True, default=None, null=True)
    lname = models.CharField(max_length=50 , blank=True, default=None, null=True)
    school = models.CharField(max_length=50 , blank=True, default=None, null=True)
    address = models.CharField(max_length=50 , blank=True, default=None, null=True)
    gmail = models.CharField(max_length=50 , blank=True, default=None, null=True)
    phone = models.CharField(max_length=50 , blank=True, default=None, null=True)
    admin_id = models.IntegerField(blank=True, default=None, null=True)
    username = models.CharField(max_length=50 , blank=True, default=None, null=True)
    password = models.CharField(max_length=50  , blank=True, default=None, null=True)

    def __str__(self):
        return f"Student: {self.fname} {self.mname} {self.lname}"
    
    def get_data(self) -> dict:
        return {
            'fname': self.fname,
            'lname': self.lname,
            'address': self.address,
            'gmail': self.gmail,
            'phone': self.phone,
            'admin_id': self.admin_id,
            'username': self.username, 
            'school': self.school,
            'id': self.pk,
        }


class AdminData(models.Model):
    username = models.CharField(max_length=50 , blank=True, default=None, null=True)
    password = models.CharField(max_length=50  , blank=True, default=None, null=True)
    
    def __str__(self):
        return f"Admin: {self.username}"


class QuizData(models.Model):
    number_of_correct = models.IntegerField( blank=True, default=None, null=True)
    number_of_wrong = models.IntegerField( blank=True, default=None, null=True)
    student_id = models.IntegerField( blank=True, default=None, null=True)
    file = models.FileField( blank=True, default=None, null=True)
    
    def __str__(self):
        return f"Score: {self.score} - {self.student_id}"
    
    def get_data(self) -> dict:
        return {
            'number_of_correct': self.number_of_correct,
            'number_of_wrong': self.number_of_wrong,
            'student_id': self.student_id,
            'file': self.file.path if self.file else None
        }
    

class UploadedFile(models.Model): # File upload model. For handling Jarf(PDF File) uploads later.
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
