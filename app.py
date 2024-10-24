from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role  # Use the same db instance from models.py
from flask_security import Security, SQLAlchemyUserDatastore , auth_required
from backend.resources import api

def createApp():
    app = Flask(__name__,template_folder = 'frontend' , static_folder='frontend',static_url_path='/static')

    # Load configuration
    app.config.from_object(LocalDevelopmentConfig)

    # Initialize the database with the app
    db.init_app(app)  # Make sure db is initialized here

    #flask-restful init
    api.init_app(app)

    # Initialize Flask-Security
    user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, user_datastore ,register_blueprint=False)

    with app.app_context():  # Ensure the app context is active
        db.create_all()  # Optional: Create tables automatically

        import backend.routes

    return app

app = createApp()

if __name__ == '__main__':
    app.run()
