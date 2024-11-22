from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

# Many-to-Many association table for users and roles
roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

# Role model
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)  # Role name: 'Admin', 'Service Professional', 'Customer'
    description = db.Column(db.String(255))

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    # Flask-Security specific fields
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=True)
    permission = db.Column(db.String(255),nullable=True)
    
    # Many-to-Many relationship between users and roles
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))

    # Additional fields for customers and professionals
    name = db.Column(db.String(255))  # Full name
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    description = db.Column(db.String(255))
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=True)
    experience = db.Column(db.Integer)  # Experience in years for professionals
    address = db.Column(db.String(255))  # Address field
    pin_code = db.Column(db.String(10))  # Pin Code field
    document_path = db.Column(db.String(255), nullable=True) 
    service = db.relationship('Service', backref=db.backref('professionals', lazy=True))

# Service model
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer)  # In minutes, e.g., 60 for 1 hour
    description = db.Column(db.String(255))

    #cascade delete for service requests related to this service
    requests = db.relationship('ServiceRequest', backref=db.backref('parent_service', lazy=True), cascade="all, delete", passive_deletes=True)
 
# Service request model
class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id', ondelete="CASCADE"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Initially null until assigned
    date_of_request = db.Column(db.DateTime, default=db.func.current_timestamp())
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(50), default='requested')  # Status: 'requested', 'assigned', 'closed'
    remarks = db.Column(db.Text)
    customer_phone = db.Column(db.String(20), nullable=True)
    customer_msg = db.Column(db.Text)
    
    
    #rating for the service (1-5 scale, assuming integer)
    rating = db.Column(db.Integer, nullable=True)  # Rating: null if not rated yet

    # Relationships
    service = db.relationship('Service')
    customer = db.relationship('User', foreign_keys=[customer_id])
    professional = db.relationship('User', foreign_keys=[professional_id])
