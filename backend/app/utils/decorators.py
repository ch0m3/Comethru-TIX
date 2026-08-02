"""
Authentication and authorization helpers.

role_required(*roles) verifies the JWT, loads the current user from the
latest database state, rejects inactive accounts, then checks the user's
current role. That means an old token cannot keep working after an admin
changes a user's role or deactivates the account.
"""

from functools import wraps

from flask import g, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.models.user import User


def error(message, status=400):
    return jsonify(error=message), status


def _load_current_user():
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None, error("Your session is invalid. Please log in again.", 422)

    user = User.query.get(user_id)
    if not user:
        return None, error("Your session is invalid. Please log in again.", 401)
    if user.status != "active":
        return None, error("Your account is not active. Contact support.", 403)

    claims = get_jwt()
    if claims.get("role") != user.role:
        return None, error("Your session is out of date. Please log in again.", 401)

    return user, None


def current_user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user, response = _load_current_user()
        if response:
            return response
        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user, response = _load_current_user()
            if response:
                return response
            if user.role not in roles:
                return error("You do not have permission to do that.", 403)
            g.current_user = user
            return fn(*args, **kwargs)

        return wrapper

    return decorator
