"""
role_required(*roles) enforces role checks on the backend, not just in
the UI. It reads the "role" custom claim baked into the JWT at login
time (see app/routes/auth.py), so it never needs to hit the database to
check who is allowed to call a route.

    @events_bp.route("", methods=["POST"])
    @role_required("organizer")
    def create_event():
        ...

    @admin_bp.route("/users", methods=["GET"])
    @role_required("admin")
    def list_users():
        ...

Accepts multiple roles when a route is shared, e.g. role_required("organizer", "admin").
"""

from functools import wraps

from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def error(message, status=400):
    return jsonify(error=message), status


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return error("You do not have permission to do that.", 403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
