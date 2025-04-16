from fastapi import APIRouter, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from backend.models.client import Client
from backend.utils.security import verify_password, create_access_token

router = APIRouter()

@router.post("/login")
async def login(credentials: LoginCredentials):
    try:
        # Buscar el cliente por email
        client = db.query(Client).filter(Client.email == credentials.email).first()
        if not client:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Verificar la contraseña
        if not verify_password(credentials.password, client.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Crear el token
        access_token = create_access_token(data={"sub": client.client_id})

        # Obtener todas las APIs permitidas
        allowed_apis = []
        for api in client.apis:
            allowed_apis.append(api.api_id)

        # Crear la respuesta con todos los campos del cliente
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "client": {
                "client_id": client.client_id,
                "name": client.name,
                "email": client.email,
                "environment": client.environment,
                "request_limit_per_day": client.request_limit_per_day,
                "allowed_apis": allowed_apis,
                "created_at": client.created_at.isoformat(),
                "updated_at": client.updated_at.isoformat() if client.updated_at else None,
                "is_active": client.is_active,
                "plan": client.plan
            }
        }

        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 