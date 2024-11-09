from flask import current_app as app, request, jsonify, render_template , send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import *
from datetime import datetime
from backend.celery.tasks import add,create_csv,create_professional_csv
from celery.result import AsyncResult

datastore = app.security.datastore
cache =app.cache

# Define a home route
@app.route('/')
def home():
    return render_template('index.html')

@app.get('/celery')
def celery():
     task=add.delay(10,20)
     return {'task_id': task.id}

@app.get('/get-celery-data/<id>')
def getData(id):
    result = AsyncResult(id)

    if result.ready():
        return {'result': result.result},200
    else:
        return {'message':'Task not ready'},400
    
@app.get('/create-csv')
@auth_required('token')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id},200


@app.get('/get-csv/<id>')
@auth_required('token')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'),200
    else:
        return {'message':'Task not ready'},400  


@app.get('/cache')
@cache.cached(timeout = 3)
def cache():
    return {'Time': str(datetime.now())}

# Endpoint for professionals to download their closed service requests
@app.get('/create-professional-csv/<professional_id>')
@auth_required('token')
def createProfessionalCSV(professional_id):
    task = create_professional_csv.delay(professional_id)
    return {'task_id': task.id}, 200

@app.get('/get-professional-csv/<id>')
@auth_required('token')
def getProfessionalCSV(id):
    result = AsyncResult(id)
    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message': 'Task not ready'}, 400


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
