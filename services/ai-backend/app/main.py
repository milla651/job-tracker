"""Flask application entry point"""
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import config
from utils.db_init import init_cv_tables
import os
import logging

logger = logging.getLogger(__name__)

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)
    
    # Load config
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Initialize database tables (auto-migration)
    with app.app_context():
        logger.info("Running database initialization...")
        init_success = init_cv_tables()
        if init_success:
            logger.info("✅ Database ready")
        else:
            logger.warning("⚠️ Database initialization had issues - check logs")
    
    # Register blueprints
    from app.routes import health, cv, ai, files
    app.register_blueprint(health.bp)
    app.register_blueprint(cv.bp, url_prefix='/api/cv')
    app.register_blueprint(ai.bp, url_prefix='/api/ai')
    app.register_blueprint(files.bp, url_prefix='/api/files')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        return jsonify({"error": str(error)}), 500
    
    return app

if __name__ == '__main__':
    env = os.getenv('FLASK_ENV', 'development')
    app = create_app(env)
    app.run(host='0.0.0.0', port=5000, debug=(env == 'development'))
