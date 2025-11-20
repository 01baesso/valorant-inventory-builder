from django.shortcuts import render

# Create your views here.

from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

import json
import os

USER_DB = os.path.join(settings.BASE_DIR, 'db', 'user.json')

def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Use POST'}, status=405)
    data = json.loads(request.body)
    username = data.get('username')
    email = data.get('email')
    senha = data.get('senha')

    with open(USER_DB, 'r+') as f:
        users = json.load(f)
    # Verificar existência
    for u in users:
        if u.get('username') == username or u.get('email') == email:
            return JsonResponse({'error': 'Usuário ou email já cadastrado'}, status=400)
    # Adicionar novo usuário
    users.append({'username': username, 'email': email, 'senha': senha})
    with open(USER_DB, 'w') as f:
        json.dump(users, f, indent=2)
    return JsonResponse({'status': 'Registrado com sucesso'})

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Método não permitido")
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    # Carrega usuários existentes
    if os.path.exists(USER_DB):
        with open(USER_DB, 'r') as f:
            users = json.load(f)
    else:
        users = []

    # Verifica credenciais
    for u in users:
        if u['username'] == username and u['password'] == password:
            return JsonResponse({'success': True})
    # Se não encontrou ou senha não confere
    return JsonResponse({'success': False, 'message': 'Credenciais inválidas'}, status=401)