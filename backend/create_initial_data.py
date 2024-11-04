import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))  # Add parent directory to path

from app import createApp  # Use the same app instance from app.py
from backend.models import db, Role, User  # Import the same db, Role, User from models.py
from flask_security import SQLAlchemyUserDatastore, hash_password

# Create the app and initialize the context
app = createApp()

# Ensure that the database is created inside the app context
with app.app_context():
    db.create_all()  # Create tables

    # Get access to the user_datastore
    user_datastore: SQLAlchemyUserDatastore = app.security.datastore

    # Create roles (if they don't already exist)
    if not Role.query.filter_by(name="Admin").first():
        user_datastore.create_role(name="Admin", description="Administrator with full access")
    if not Role.query.filter_by(name="Service Professional").first():
        user_datastore.create_role(name="Service Professional", description="Professional providing services")
    if not Role.query.filter_by(name="Customer").first():
        user_datastore.create_role(name="Customer", description="Customer who requests services")

    # Create a default admin user (if one doesn't already exist)
    if not User.query.filter_by(email="admin@example.com").first():
        admin_user = user_datastore.create_user(
            email="admin@mail.com",
            password=hash_password("adminpass")  # Make sure to hash the password properly in real applications
        )
        # Assign the admin role to the admin user
        user_datastore.add_role_to_user(admin_user, "Admin")

    # Commit the changes to the database
    db.session.commit()

    print("Initial data created: roles and admin user.")
