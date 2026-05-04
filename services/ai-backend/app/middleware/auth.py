"""Authentication middleware"""
from flask import request, jsonify
from functools import wraps
import os

def require_auth(f):
    """Verify request is from Next.js backend"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        secret = request.headers.get('X-Backend-Secret')
        expected_secret = os.getenv('BACKEND_SECRET', 'shared-secret')
        
        if not secret or secret != expected_secret:
            return jsonify({"error": "Unauthorized"}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function
