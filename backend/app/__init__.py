"""
Application factory. create_app() builds and configures the Flask app:
wires up the extensions (database, JWT, CORS, etc.), imports the models
so Flask-Migrate can see every table, and registers each blueprint of
routes.

Using a factory function (instead of one global app) makes it possible
to create a fresh app with different config in tests later.
"""

from flask import Flask, jsonify

from app.config import Config
from app.extensions import db, migrate, jwt, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialise extensions with this app instance
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # Import models so Flask-Migrate can see every table
    from app import models  # noqa: F401

    # Register route blueprints
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.bookings import bookings_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(admin_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "ok"}, 200

    # ── Consistent JSON error responses ──────────────────────────────
    # The frontend's apiRequest() reads `data.error` on any failure, so
    # every error path (including ones Flask/JWT generate on their own)
    # should come back in that shape rather than Flask's default HTML
    # error pages.

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error="Not found."), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify(error="Method not allowed."), 405

    @app.errorhandler(500)
    def server_error(e):
        return jsonify(error="Something went wrong on our end."), 500

    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify(error="Authentication is required for this request."), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify(error="Your session is invalid. Please log in again."), 422

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify(error="Your session has expired. Please log in again."), 401

    return app
