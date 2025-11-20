from django.urls import path
from users import views

urlpatterns = [
    path('login/', views.login_view, name='login'),       # POST para fazer login
    path('register/', views.register_view, name='register'),  # POST para criar usuário
]