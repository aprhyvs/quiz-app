from django.urls import path
from .views import *
from .views import upload_file

urlpatterns = [
    #=============================== Views Pages ===============================#
    path('', home, name='home'),
    
    #=============================== API Endpoints ===============================#
    path('api/login/student', view=login_student),
    path('api/login/admin', view=login_admin),
    path('api/logout', view=logout),
    path('api/register/student', view=register_student),

    #=============================== File Upload ===============================#
    path("upload/", upload_file, name="upload_file"),
]