from django.shortcuts import render

# Create your views here.

import json
import os
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt

# caminho para db/user.json (garanta que pasta db exista)
USER_DB = os.path.join(settings.BASE_DIR, 'db', 'user.json')


def ensure_user_db():
    """Cria user.json com lista vazia se não existir."""
    db_dir = os.path.dirname(USER_DB)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    if not os.path.exists(USER_DB):
        with open(USER_DB, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2, ensure_ascii=False)


@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Use POST'}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    username = data.get('username')
    email = data.get('email')
    # aceita tanto 'password' quanto 'senha' (compatibilidade)
    password = data.get('password') or data.get('senha')

    if not username or not email or not password:
        return JsonResponse({'error': 'username, email e password são obrigatórios'}, status=400)

    ensure_user_db()
    with open(USER_DB, 'r', encoding='utf-8') as f:
        users = json.load(f)

    # checar duplicatas
    for u in users:
        if u.get('username') == username:
            return JsonResponse({'error': 'Nome de usuário já existe!'}, status=400)
        if u.get('email') == email:
            return JsonResponse({'error': 'Email já cadastrado!'}, status=400)

    # salvar
    users.append({
        'username': username,
        'email': email,
        'password': password
    })

    with open(USER_DB, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

    return JsonResponse({'success': True, 'message': 'Registrado com sucesso!'})


@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Método não permitido")

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    username = data.get('username')
    password = data.get('password') or data.get('senha')

    if not username or not password:
        return JsonResponse({'success': False, 'message': 'username e password são obrigatórios'}, status=400)

    ensure_user_db()
    with open(USER_DB, 'r', encoding='utf-8') as f:
        users = json.load(f)

    for u in users:
        # compara com o campo 'password' salvo
        if u.get('username') == username and u.get('password') == password:
            return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'message': 'Credenciais inválidas!'}, status=401)