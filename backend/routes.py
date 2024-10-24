from flask import current_app as app, request, jsonify , render_template
from flask_security import auth_required, verify_password ,hash_password
from backend.models import *

datastore = app.security.datastore

# Define a home route
@app.route('/')
def home():
    return render_template('index.html')

@app.get('/protected')
@auth_required('token')
def protected():
    return '<h1>Only accessible by authenticated users</h1>'


# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Invalid inputs"}), 400

    # Find the user by email
    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "Invalid email"}), 400

    # Verify the user's password
    if verify_password(password, user.password):
        #using tokens or session authentication
        return jsonify({
            'token': user.get_auth_token(),  #  user.get_auth_token() is implemented
            'email': user.email,
            'role': [role.name for role in user.roles],  # Correctly fetch user roles
            'id': user.id
        }), 200

    return jsonify({"message": "Incorrect password"}), 400


# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role')
    name = data.get('name')  # New field
    service_type = data.get('serviceType')  # New field for Service Professionals
    description = data.get('description')  # New field for Service Professionals
    experience = data.get('experience')  # New field for Service Professionals

    if not email or not password or role_name not in ['Service Professional', 'Customer'] or not name:
        return jsonify({"message": "Invalid inputs"}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 400

    # Create a new user with additional fields
    new_user = datastore.create_user(
        email=email,
        password=hash_password(password),  # Hash the password before saving
        name=name,
        service_type=service_type,
        description=description,
        experience=experience
    )

    # Assign the role to the new user
    role = datastore.find_role(role_name)
    if role:
        datastore.add_role_to_user(new_user, role)
    else:
        return jsonify({"message": "Role not found"}), 400

    # Commit the changes to the database
    db.session.commit()

    return jsonify({
        'message': 'User registered successfully',
        'email': new_user.email,
        'role': [role.name for role in new_user.roles],
        'id': new_user.id
    }), 201