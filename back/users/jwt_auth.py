import os,json,uuid,datetime,jwt
from functools import wraps
from django.conf import settings
from django.http import JsonResponse

#Caminho para blacklist
BLACKLIST_DB=os.path.join(settings.BASE_DIR,"db","blacklist.json")

def ensure_blacklist_db():
    db = os.path.dirname(BLACKLIST_DB)
    if not os.path.exists(db):
        os.makedirs(db, exist_ok=True)
    if not os.path.exists(BLACKLIST_DB):
        with open(BLACKLIST_DB, "w", encoding="utf-8") as f:
            json.dump([],f)
        
def load_blacklist():
    ensure_blacklist_db()
    with open(BLACKLIST_DB, "r", encoding="utf-8") as f:
        return json.load(f)
    
def save_blacklist(blacklist):
    with open(BLACKLIST_DB, "w", encoding="utf-8") as f:
        json.dump(blacklist, f)
    
def add_token_to_blacklist(jti):
    bl=load_blacklist()
    if jti not in bl:
        bl.append(jti)
        save_blacklist(bl)

def is_token_blakclisted(jti):
    bl=load_blacklist()
    return jti in bl

def create_access_token(payload: dict, expires_minutes: int=60):
    jti=str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    exp=now+datetime.timedelta(minutes=expires_minutes)
    token_payload={
        **payload,
        "jti": jti,
        "iat": now,
        "exp": exp,
        "type": "access"
    }
    token=jwt.encode(token_payload, settings.SECRET_KEY, algorithm="HS256")
    return token, jti

def create_refresh_token(payload: dict, expires_days: int=7):
    jti=str(uuid.uuid4())
    now=datetime.datetime.utcnow()
    exp=now+datetime.timedelta(days=expires_days)
    token_payload={
        **payload,
        "jti": jti,
        "iat": now,
        "exp": exp,
        "type": "refresh"
    }
    token=jwt.encode(token_payload, settings.SECRET_KEY, algorithm="HS256")
    return token, jti

def decode_token(token):
    try:
        payload=jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("expired")
    except jwt.InvalidTokenError:
        raise ValueError("invalid")
    
def token_required(view_f):
    @wraps(view_f)
    def wrapper(request, *args, **kwargs):
        auth_header=request.headers.get("Authorization","")
        if not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization header must be: Bearer <token>"}, status=401)
        token=auth_header.split(" ",1)[1]

        try:
            payload=decode_token(token)
        except ValueError as e:
            msg = "Token expirado" if str(e) == "expired" else "Token inválido"
            return JsonResponse({"error": msg}, status=401)
        
        #checar blakclist
        jti = payload.get("jti")
        if jti and is_token_blakclisted(jti):
            return JsonResponse({"error": "Token revogado"}, status=401)
        
        request.user={
            "id": payload.get("user_id"),
            "username": payload.get("username"),
            "email": payload.get("email"),
        }

        return view_f(request, *args, **kwargs)
    return wrapper