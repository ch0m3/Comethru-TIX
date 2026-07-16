from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.utils.decorators import error
from app.utils.tokens import generate_reset_token, verify_reset_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

MIN_PASSWORD_LENGTH = 8


def _validate_password(password):
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    return None


# ── Registration ────────────────────────────────────────────────────────

@auth_bp.route("/customer/register", methods=["POST"])
def register_customer():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email:
        return error("Name and email are required.")
    pw_error = _validate_password(password)
    if pw_error:
        return error(pw_error)
    if User.query.filter_by(email=email).first():
        return error("An account with that email already exists.", 409)

    user = User(name=name, email=email, role="customer", status="active")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@auth_bp.route("/organizer/register", methods=["POST"])
def register_organizer():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    business_name = (data.get("business_name") or "").strip() or None

    if not name or not email:
        return error("Name and email are required.")
    pw_error = _validate_password(password)
    if pw_error:
        return error(pw_error)
    if User.query.filter_by(email=email).first():
        return error("An account with that email already exists.", 409)

    # Organizers start as 'pending' - an admin must activate them before
    # they can log in. See docs in app/routes/admin.py.
    user = User(
        name=name,
        email=email,
        role="organizer",
        business_name=business_name,
        status="pending",
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


# Note: there is deliberately no /admin/register route. Admin accounts are
# only created via `python seed.py` (see backend/seed.py).


# ── Login ────────────────────────────────────────────────────────────────

def _login(role):
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error("Email and password are required.")

    user = User.query.filter_by(email=email, role=role).first()
    if not user or not user.check_password(password):
        return error("Invalid email or password.", 401)

    if user.status == "pending":
        return error(
            "Your organizer account is still pending admin review.", 403
        )
    if user.status == "deactivated":
        return error("Your account has been deactivated. Contact support.", 403)

    access_token = create_access_token(
        identity=str(user.id), additional_claims={"role": user.role}
    )
    return jsonify(user=user.to_dict(), access_token=access_token), 200


@auth_bp.route("/customer/login", methods=["POST"])
def login_customer():
    return _login("customer")


@auth_bp.route("/organizer/login", methods=["POST"])
def login_organizer():
    return _login("organizer")


@auth_bp.route("/admin/login", methods=["POST"])
def login_admin():
    return _login("admin")


# ── Profile ──────────────────────────────────────────────────────────────

@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if name is not None:
        name = name.strip()
        if not name:
            return error("Name cannot be empty.")
        user.name = name

    if email is not None:
        email = email.strip().lower()
        if not email:
            return error("Email cannot be empty.")
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user.id:
            return error("That email is already in use.", 409)
        user.email = email

    if password:
        pw_error = _validate_password(password)
        if pw_error:
            return error(pw_error)
        user.set_password(password)

    db.session.commit()
    return jsonify(user.to_dict()), 200


# ── Forgot / reset password ────────────────────────────────────────────

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first() if email else None

    # Always return the same message whether or not the account exists,
    # so this endpoint can't be used to check which emails are registered.
    if user:
        token = generate_reset_token(user)
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        # TODO: send `reset_link` by real email (SendGrid/SES/Postmark...).
        # Logged to the console for now so it can be tested locally.
        print(f"[password reset] {user.email} -> {reset_link}")

    return jsonify(
        message="If that email exists, a reset link has been sent."
    ), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    new_password = data.get("new_password") or ""

    if not token:
        return error("Reset token is required.")
    pw_error = _validate_password(new_password)
    if pw_error:
        return error(pw_error)

    user_id = verify_reset_token(token)
    if not user_id:
        return error("This reset link is invalid or has expired.", 400)

    user = User.query.get(user_id)
    if not user:
        return error("This reset link is invalid or has expired.", 400)

    user.set_password(new_password)
    db.session.commit()

    return jsonify(message="Password updated.", role=user.role), 200
