from flask import current_app as app, request, jsonify, render_template
from flask_security import auth_required, verify_password, hash_password
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
    
    # Check if the account is active
    if not user.active:
        return jsonify({"message": "This account is not active or rejected by admin"}), 403

    # Verify the user's password
    if verify_password(password, user.password):
        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': [role.name for role in user.roles],
            'id': user.id
        }), 200

    return jsonify({"message": "Incorrect password"}), 400

# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Common fields for all users
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role')
    name = data.get('name')
    address = data.get('address')
    pin_code = data.get('pinCode')

    # Fields specific to Service Professionals
    service_id = data.get('serviceType')
    description = data.get('description')
    experience = data.get('experience')

    # Validate input fields
    if not email or not password or role_name not in ['Service Professional', 'Customer'] or not name:
        return jsonify({"message": "Invalid inputs"}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 400

    # Validate service ID if user is a Service Professional
    if role_name == 'Service Professional':
        if not service_id:
            return jsonify({"message": "Service ID is required for service professionals"}), 400
        service = Service.query.get(service_id)
        if not service:
            return jsonify({"message": "Invalid service ID"}), 400

    # Create a new user
    new_user = datastore.create_user(
        email=email,
        password=hash_password(password),
        name=name,
        address=address,
        pin_code=pin_code,
        service_id=service_id if role_name == 'Service Professional' else None,
        description=description if role_name == 'Service Professional' else None,
        experience=experience if role_name == 'Service Professional' else None,
        permission='pending' if role_name == 'Service Professional' else None,
        active= False if role_name == 'Service Professional' else True
    )

    # Assign the role to the new user
    role = datastore.find_role(role_name)
    if role:
        datastore.add_role_to_user(new_user, role)
    else:
        return jsonify({"message": "Role not found"}), 400

    db.session.commit()

    return jsonify({
        'message': 'User registered successfully',
        'email': new_user.email,
        'role': [role.name for role in new_user.roles],
        'id': new_user.id
    }), 201
