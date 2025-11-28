import os,json, hashlib, datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .jwt_auth import (
    create_access_token, 
    create_refresh_token, 
    add_token_to_blacklist, 
    decode_token, 
    token_required, 
    is_token_blacklisted,
)

# Caminho para o arquivo JSON único
USER_DB = os.path.join(settings.BASE_DIR, 'db', 'user.json')

def ensure_user_db():
    """Cria user.json com lista vazia se não existir."""
    db_dir = os.path.dirname(USER_DB)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    if not os.path.exists(USER_DB):
        with open(USER_DB, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2, ensure_ascii=False)


def load_users():
    """Carrega todos os usuários do arquivo."""
    ensure_user_db()
    with open(USER_DB, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_users(users):
    """Salva todos os usuários no arquivo."""
    with open(USER_DB, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def find_user_by_id(users, user_id):
    """Encontra um usuário pelo username."""
    for i, u in enumerate(users):
        if u.get('id') == user_id:
            return i, u
    return None, None

def find_user_by_username(users, username):
    """Encontra um usuário pelo username."""
    for i, u in enumerate(users):
        if u.get("username") == username:
            return i, u
    return None, None

def hash_password(raw_password: str) -> str:
    return hashlib.sha256(raw_password.encode()).hexdigest()


@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password').strip()

    # Validações
    if not username or not email or not password:
        return JsonResponse({'error': 'username, email e password são obrigatórios'}, status=400)
    
    if len(password) < 4:
        return JsonResponse({'error': 'A senha deve ter pelo menos 4 dígitos'}, status=400)
    
    # Validação básica de email
    if '@' not in email or '.' not in email.split('@')[-1]:
        return JsonResponse({'error': 'Email inválido'}, status=400)
    
    if len(username) < 3:
        return JsonResponse({'error': 'Username deve ter pelo menos 3 caracteres'}, status=400)

    users = load_users()

    # Checar duplicatas
    for u in users:
        if u.get('username') == username:
            return JsonResponse({'error': 'Nome de usuário já existe!'}, status=400)
        if u.get('email') == email:
            return JsonResponse({'error': 'Email já cadastrado!'}, status=400)

    #Gera id
    max_id=max([u.get("id",0) for u in users], default=0)
    new_id=max_id+1

    # Criar novo usuário com inventário vazio
    new_user = {
        'id': new_id, 
        'username': username,
        'email': email,
        'password': hash_password(password),
        'inventory': []  # Inventário já inicializado vazio
    }
    
    users.append(new_user)
    save_users(users)

    return JsonResponse({'success': True, 'message': 'Registrado com sucesso!'})


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data=json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "JSON Inválido"}, status=400)
    
    username=data.get("username")
    password=data.get("password")

    if not username or not password:
        return JsonResponse({"error","username e password são obrigatórios"}, status=400)

    users=load_users()
    _, user=find_user_by_username(users, username)
    if not user:
        return JsonResponse({"error": "Credenciais Inválidas"}, status=401)
    
    hashed=hash_password(password)
    if user.get("password") != hashed:
        return JsonResponse({"error":"Credenciais Inválidas"}, status=401)
    
    payload={
        "user_id": user["id"],
        "username": user["username"],
        "email": user.get("email")
    }

    access_token, access_jti = create_access_token(payload, expires_minutes=60)
    refresh_token, refresh_jti = create_refresh_token(payload, expires_days=2)

    response = JsonResponse({
        "access": access_token,
        "expires_in": 3600,
        "messsage": "Autenticado"
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=7*24*3600,
        path="/",
    )

    return response

@csrf_exempt
@require_http_methods(["POST"])
def refresh_view(request):
    refresh=request.COOKIES.get("refresh_token")
    if not refresh:
        return JsonResponse({"error": "Refresh token não fornecido"}, status=401)
    
    try:
        payload=decode_token(refresh)
    except ValueError:
        return JsonResponse({"error":"Refresh token Inválido"}, status=401)
    
    if payload.get("type") != "refresh":
        return JsonResponse({"error":"Token não é refresh"}, status=400)
    
    jti=payload.get("jti")
    if jti and is_token_blacklisted(jti):
        return JsonResponse({"error":"Token revogado"}, status=401)
    
    access_payload={
        "user_id" : payload.get("user_id"),
        "username" : payload.get("username"),
        "email" : payload.get("email"),
    }

    access_token, access_jti = create_access_token(access_payload, expires_minutes=60)
    return JsonResponse({"access":access_token, "expires_in":3600})
    
@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    refresh =request.COOKIES.get("refresh_token")

    if not refresh:
        try:
            data = json.loads(request.body)
            refresh = data.get("refresh")
        except Exception:
            refresh=None

    if not refresh:
        response = JsonResponse({"message":"Logout Realizado"})
        response.delete_cookie("refresh_token",path="/")
        return response
    
    try:
        payload = decode_token(refresh)
    except ValueError:
        response = JsonResponse({"message":"Logout inválido"})
        response.delete_cookie("refresh_token", path="/")
        return response
    
    jti = payload.get("jti")
    if jti:
        add_token_to_blacklist(jti)

    response = JsonResponse({"message":"Logout Realizado"})
    response.delete_cookie("refresh_token", path="/")
    return response

@csrf_exempt
@require_http_methods(["GET"])
@token_required
def get_inventory(request):
    """Retorna o inventário do usuário logado."""
    user_id = request.user.get('id')
    
    if not user_id:
        return JsonResponse({'error': 'Usuário não autenticado'}, status=401)

    users = load_users()
    _, user = find_user_by_id(users, user_id)
    
    if not user:
        return JsonResponse({'error': 'Usuário não encontrado'}, status=404)
    
    # Garantir que o inventário existe
    if 'inventory' not in user:
        user['inventory'] = []
    
    return JsonResponse({'inventory': user.get('inventory', [])})


@csrf_exempt
@require_http_methods(["POST"])
@token_required
def add_to_inventory(request):
    """Adiciona um item ao inventário do usuário."""
    user_id = request.user.get('id')
    
    if not user_id:
        return JsonResponse({'error': 'Usuário não autenticado'}, status=401)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    skin_id = data.get('skin_id')
    skin_name = data.get('skin_name')
    image_url = data.get('image_url')
    price = data.get('price', 0)

    if not skin_id or not skin_name:
        return JsonResponse({'error': 'skin_id e skin_name são obrigatórios'}, status=400)

    users = load_users()
    user_index, user = find_user_by_id(users, user_id)
    
    if not user:
        return JsonResponse({'error': 'Usuário não encontrado'}, status=404)
    
    # Garantir que o inventário existe
    if 'inventory' not in user:
        user['inventory'] = []
    
    # Verificar se já possui
    for item in user['inventory']:
        if item.get('skin_id') == skin_id:
            return JsonResponse({'error': 'Você já possui esta skin!'}, status=400)
    
    # Adicionar novo item
    new_item = {
        'skin_id': skin_id,
        'skin_name': skin_name,
        'image_url': image_url,
        'price': price
    }
    
    user['inventory'].append(new_item)
    users[user_index] = user
    save_users(users)
    
    return JsonResponse({
        'inventory': user['inventory'], 
        'message': 'Item adicionado com sucesso!'
    })


@csrf_exempt
@require_http_methods(["DELETE"])
@token_required
def remove_from_inventory(request, skin_id):
    """Remove um item do inventário do usuário."""
    user_id = request.user.get('id')
    
    if not user_id:
        return JsonResponse({'error': 'Usuário não autenticado'}, status=401)

    users = load_users()
    user_index, user = find_user_by_id(users, user_id)
    
    if not user:
        return JsonResponse({'error': 'Usuário não encontrado'}, status=404)
    
    if 'inventory' not in user or not user['inventory']:
        return JsonResponse({'error': 'Inventário vazio'}, status=404)
    
    # Remover item
    original_length = len(user['inventory'])
    user['inventory'] = [item for item in user['inventory'] if item.get('skin_id') != skin_id]
    
    if len(user['inventory']) == original_length:
        return JsonResponse({'error': 'Item não encontrado no inventário'}, status=404)
    
    users[user_index] = user
    save_users(users)
    
    return JsonResponse({
        'inventory': user['inventory'], 
        'message': 'Item removido com sucesso!'
    })