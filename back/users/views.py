import json
import os
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

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


def find_user(users, username):
    """Encontra um usuário pelo username."""
    for i, user in enumerate(users):
        if user.get('username') == username:
            return i, user
    return None, None


@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password') or data.get('senha', '')

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

    # Criar novo usuário com inventário vazio
    new_user = {
        'username': username,
        'email': email,
        'password': password,
        'inventory': []  # Inventário já inicializado vazio
    }
    
    users.append(new_user)
    save_users(users)

    return JsonResponse({'success': True, 'message': 'Registrado com sucesso!'})


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    username = data.get('username', '').strip()
    password = data.get('password') or data.get('senha', '')

    # Validações
    if not username or not password:
        return JsonResponse({'success': False, 'message': 'username e password são obrigatórios'}, status=400)
    
    if len(password) < 4:
        return JsonResponse({'success': False, 'message': 'A senha deve ter pelo menos 4 dígitos'}, status=400)

    users = load_users()

    for user in users:
        if user.get('username') == username and user.get('password') == password:
            # Criar sessão simples
            request.session['username'] = username
            return JsonResponse({
                'success': True, 
                'username': username,
                'email': user.get('email')
            })

    return JsonResponse({'success': False, 'message': 'Credenciais inválidas!'}, status=401)


@csrf_exempt
@require_http_methods(["GET"])
def get_inventory(request):
    """Retorna o inventário do usuário logado."""
    username = request.GET.get('username') or request.session.get('username')
    
    if not username:
        return JsonResponse({'error': 'Usuário não autenticado'}, status=401)

    users = load_users()
    _, user = find_user(users, username)
    
    if not user:
        return JsonResponse({'error': 'Usuário não encontrado'}, status=404)
    
    # Garantir que o inventário existe
    if 'inventory' not in user:
        user['inventory'] = []
    
    return JsonResponse({'inventory': user.get('inventory', [])})


@csrf_exempt
@require_http_methods(["POST"])
def add_to_inventory(request):
    """Adiciona um item ao inventário do usuário."""
    username = request.GET.get('username') or request.session.get('username')
    
    if not username:
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
    user_index, user = find_user(users, username)
    
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
def remove_from_inventory(request, skin_id):
    """Remove um item do inventário do usuário."""
    username = request.GET.get('username') or request.session.get('username')
    
    if not username:
        return JsonResponse({'error': 'Usuário não autenticado'}, status=401)

    users = load_users()
    user_index, user = find_user(users, username)
    
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