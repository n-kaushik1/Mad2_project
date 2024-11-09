from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
from flask_caching import Cache
from  backend.celery.celery import celery_init_app
import flask_excel as excel

def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)  # Initialize the database
    cache = Cache(app)  # Initialize cache and set it on app
    app.cache = cache  # Assign cache instance to app


    # Initialize Flask-Security
    user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, user_datastore, register_blueprint=False)

    with app.app_context():  # Ensure the app context is active
        db.create_all()  # Optional: Create tables automatically
        
        # Import after setting up app.cache
        from backend.resources import api
        api.init_app(app)  # Initialize API with app
        import backend.routes

    return app

app = createApp()
with app.app_context(): 
 celery_app = celery_init_app(app)
 import backend.celery.celery_schedule
 
excel.init_excel(app)

if __name__ == '__main__':
    app.run()
