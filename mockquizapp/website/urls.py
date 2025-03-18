from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

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
    
    path('api/admin/students', view=get_list_of_students),
    path('api/admin/delete/student', view=delete_student),
    path('api/admin/update/student', view=update_student_data),
    
    path('api/admin/get/stats', view=get_admin_statistics),
    path('api/student/stats', view=get_student_statistic),

    #=============================== File Upload ===============================#
    path("upload/", upload_file, name="upload_file"),


    #=============================== Testing ===================================#
    
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
