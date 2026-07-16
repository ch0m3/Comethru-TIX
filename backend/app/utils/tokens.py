"""
Short-lived, signed tokens for the forgot/reset password flow. Uses
itsdangerous (already a Flask dependency) instead of a database table -
the token itself carries the user id and is verified by its signature
and age, so nothing needs to be stored or cleaned up server-side.

No real email is sent yet: forgot_password() logs the reset link to the
console. Swap the print() in app/routes/auth.py for a real email send
(e.g. via SendGrid/SES/Postmark) when that's ready.
"""

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask import current_app

SALT = "password-reset"


def generate_reset_token(user):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps({"user_id": user.id}, salt=SALT)


def verify_reset_token(token):
    """Returns the user_id encoded in the token, or None if it is invalid
    or has expired."""
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    max_age = current_app.config.get("RESET_TOKEN_MAX_AGE", 3600)
    try:
        data = serializer.loads(token, salt=SALT, max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None
    return data.get("user_id")
