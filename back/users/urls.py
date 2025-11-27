from django.urls import path
from .views import (
    login_view, 
    register_view,
    logout_view,
    refresh_view,
    get_inventory,
    add_to_inventory,
    remove_from_inventory
)

urlpatterns = [
    # Autenticação
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
    path('refresh/', refresh_view, name="refresh"),
    
    # Inventário
    path('inventory/', get_inventory, name='get_inventory'),
    path('inventory/add/', add_to_inventory, name='add_inventory'),
    path('inventory/<str:skin_id>/', remove_from_inventory, name='remove_inventory'),
]