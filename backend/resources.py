from flask_restful import Api, Resource, reqparse, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models import db, User, Service, ServiceRequest

# Define the API and its prefix (already done)
api = Api(prefix='/api')

# Define field structures to format the response (output fields)
user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
    'service_type': fields.String,
    'experience': fields.Integer,
    'description': fields.String,
    'active': fields.Boolean,  # Whether the user is blocked or active
}

service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Float,
    'time_required': fields.Integer,
    'description': fields.String,
}

service_request_fields = {
    'id': fields.Integer,
    'service_id': fields.Integer,
    'customer_id': fields.Integer,
    'professional_id': fields.Integer,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'service_status': fields.String,
    'remarks': fields.String,
}

# Parsers to handle incoming request data
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help='Email is required')
user_parser.add_argument('password', type=str, required=True, help='Password is required')
user_parser.add_argument('name', type=str, required=False)
user_parser.add_argument('service_type', type=str, required=False)
user_parser.add_argument('experience', type=int, required=False)
user_parser.add_argument('description', type=str, required=False)

service_parser = reqparse.RequestParser()
service_parser.add_argument('name', type=str, required=True)
service_parser.add_argument('price', type=float, required=True)
service_parser.add_argument('time_required', type=int, required=False)
service_parser.add_argument('description', type=str, required=False)

service_request_parser = reqparse.RequestParser()
service_request_parser.add_argument('service_id', type=int, required=True)
service_request_parser.add_argument('customer_id', type=int, required=True)
service_request_parser.add_argument('remarks', type=str, required=False)


# Admin-specific actions
class AdminResource(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    def get(self, user_id=None):
        # Handle GET requests with or without a user_id
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        if user_id:
            user = User.query.get(user_id)
            if not user:
                return {'message': 'User not found'}, 404
            return user
        else:
            users = User.query.all()
            return users

    @auth_required('token')
    def post(self):
        # Admin creates a new service
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403
        args = service_parser.parse_args()
        service = Service(
            name=args['name'],
            price=args['price'],
            time_required=args.get('time_required'),
            description=args.get('description')
        )
        db.session.add(service)
        db.session.commit()
        return {'message': 'Service created'}, 201

    @auth_required('token')
    def delete(self, user_id):
        # Admin can block or delete a user
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        user.active = False  # Block user (you can also fully delete if needed)
        db.session.commit()
        return {'message': 'User blocked'}, 200



# Service Professional actions (view and accept/reject service requests)
class ProfessionalResource(Resource):
    @marshal_with(service_request_fields)
    @auth_required('token')
    def get(self, professional_id):
        # Allow professionals to view their service requests
        if 'Service Professional' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
        if not service_requests:
            return {'message': 'No service requests found'}, 404

        return service_requests

    @auth_required('token')
    def put(self, request_id):
        # Professional can accept or reject a service request
        if 'Service Professional' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return {'message': 'Service request not found'}, 404

        if service_request.professional_id != current_user.id:
            return {'message': 'Unauthorized action'}, 403

        # Accept or reject logic (example: using query param to indicate accept/reject)
        # service_request.service_status = 'accepted' or 'rejected'
        service_request.service_status = 'accepted'  # Change based on request
        db.session.commit()
        return {'message': 'Request status updated'}, 200


# Customer actions (create/view service requests, post reviews)
class CustomerResource(Resource):
    @marshal_with(service_fields)
    @auth_required('token')
    def get(self):
        # Customers can view all available services
        services = Service.query.all()
        return services

    @marshal_with(service_request_fields)
    @auth_required('token')
    def post(self):
        # Customer can create a new service request
        if 'Customer' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        args = service_request_parser.parse_args()
        service_request = ServiceRequest(
            service_id=args['service_id'],
            customer_id=current_user.id,
            remarks=args.get('remarks')
        )
        db.session.add(service_request)
        db.session.commit()
        return service_request, 201

    @auth_required('token')
    def put(self, request_id):
        # Customer closes the service request after completion
        service_request = ServiceRequest.query.get(request_id)
        if not service_request or service_request.customer_id != current_user.id:
            return {'message': 'Service request not found or unauthorized'}, 404

        service_request.service_status = 'closed'
        service_request.date_of_completion = db.func.current_timestamp()
        db.session.commit()
        return {'message': 'Service request closed'}, 200


# Define routes for the resources
api.add_resource(AdminResource, '/admin/users', '/admin/users/<int:user_id>')
api.add_resource(ProfessionalResource, '/professionals/<int:professional_id>', '/professionals/request/<int:request_id>')
api.add_resource(CustomerResource, '/customers/services', '/customers/requests/<int:request_id>')
