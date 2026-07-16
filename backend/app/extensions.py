"""
Flask extensions are created here without an app attached, then
initialised with the real app inside create_app() in app/__init__.py.
This avoids circular imports: models and routes can import `db`,
`bcrypt`, `jwt` from this file without needing the app instance.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()
