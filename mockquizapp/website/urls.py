from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import *


urlpatterns = [
    #=============================== Views Pages ===============================#
    path('', home, name='home'),
    path('register-student/', register_page, name='register-page'),
    path('login/', login_page, name='login-page'),
    path('login_admin/', admin_login_page, name='admin-login-page'),
    path('admin_dashboard/', admin_dashboard, name='admin-dashboard'),
    path('student_dashboard/', student_dashboard, name='student-dashboard'),
    path('admin_editor/', admin_editor, name='admin-editor'),
    path('student_analytics/', student_analytics, name='student-analytics'),
    path('student_quizzespage/', student_quizzespage, name='student-quizzespage'),
    path("student_leaderboard/", student_leaderboard, name="student-leaderboard"),
    path('verify/email/<verification_code>', view=verify_email),
    path("verify_success/", verify_success, name="verify-success"),
    path("game_quiz/", game_quiz, name="game-quiz"),
    path("quiz_complete/", quiz_complete, name="quiz-complete"),

    #=============================== API Endpoints ===============================#
    path('api/login/student', view=login_student),
    path('api/login/admin', view=login_admin),
    path('api/logout', view=logout_request),    
    path('api/register/student', view=register_student),
    
    
    path('api/admin/students', view=get_list_of_students),
    path('api/admin/search/students', view=search_users),
    path('api/admin/delete/student', view=delete_student),
    path('api/admin/update/student', view=update_student_data),
    path('api/admin/get/stats', view=get_admin_statistics),
    path('api/admin/get/rankings', view=update_rankings),
    path('api/admin/get/studentdata', view=get_student_by_id),
    path('api/admin/get/studentgetalldata', view=get_all_student_data_and_stats_from_id),
    path('api/admin/get/studentgetallquizzes', view=get_all_student_quizzes_from_id),
    path('api/admin/get/gamesettings', view=get_game_settings),
    path('api/admin/update/gamesettings', view=set_game_settings),
    path('api/admin/update/student', view=update_student_data),

    path('api/student/stats', view=get_all_student_stats),
    path('api/student/alldata', view=get_all_student_data),
    path('api/student/data', view=get_student_data),
    path('api/student/quizzes', view=get_all_student_quizzes),
    path('api/student/verify_email', view=verify_email),
    path('api/student/leaderboards', view=get_student_leaderboards),
    
    path('api/student/upload/stage1', view=upload_file_view_status_1),
    path('api/student/upload/stage2', view=upload_file_view_status_2),
    path('api/student/upload/stage3', view=upload_file_view_status_3),
    
    path('api/game/generate/questions', view=on_game_data_generation),
    path('api/game/generate/hints', view=on_game_data_ask_ai),
    path('api/game/generate/answer', view=on_game_data_get_answer),
    path('api/game/get/quiz', view=on_game_get_quiz_data),
    path('api/game/update/actions', view=on_game_data_update),
    path('api/game/answer' , view=on_game_data_answer),
    path('api/game/5050', view=on_game_data_5050),
    path('api/game/x2', view=on_game_data_answer_with_x2),
    
    path('api/generate/voice', view=on_game_data_generate_voice),



    #=============================== File Upload ===============================#



    #=============================== Testing ===================================#
    
] 


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
