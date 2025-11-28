import os,json, hashlib, datetime
from django.http import JsonResponse
from django.conf import settings

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