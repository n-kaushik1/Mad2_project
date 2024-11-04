from flask_restful import Api, Resource, reqparse, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models import db, User, Service, ServiceRequest ,Role

# Define the API and its prefix
api = Api(prefix='/api')

# Define field structures to format the response (output fields)
user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
    'service_type': fields.String(attribute='service.name'),
    'experience': fields.Integer,
    'description': fields.String,
    'active': fields.Boolean,  # Whether the user is blocked or active
    'address': fields.String,
    'pin_code': fields.String,
    'date_created': fields.DateTime,
    'permission': fields.String
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
    'customer_phone': fields.String,
    'service_name': fields.String(attribute='parent_service.name') 
}

# Parsers to handle incoming request data
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=False)
user_parser.add_argument('password', type=str, required=False)
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
service_request_parser.add_argument('customer_id', type=int, required=False)
service_request_parser.add_argument('remarks', type=str, required=False)
service_request_parser.add_argument('customer_phone', type=str, required=False)


# Admin-specific actions for managing services
class AdminResource(Resource):
    @marshal_with(service_fields)
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
        return service, 201

    @marshal_with(service_fields)
    @auth_required('token')
    def put(self, service_id):
        # Update service information
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        service = Service.query.get(service_id)
        if not service:
            return {'message': 'Service not found'}, 404

        args = service_parser.parse_args()
        service.name = args['name']
        service.price = args['price']
        service.time_required = args.get('time_required')
        service.description = args.get('description')
        db.session.commit()
        return service, 200

    @auth_required('token')
    def delete(self, service_id):
        # Delete service
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        service = Service.query.get(service_id)
        if not service:
            return {'message': 'Service not found'}, 404
        
        # delete related service requests
        for request in service.requests:
            db.session.delete(request)  
        
        for professional in service.professionals:
            db.session.delete(professional) 

        # Delete the service
        db.session.delete(service)
        db.session.commit()

        return {'message': 'Service deleted successfully.'}, 200

    @auth_required('token')
    def patch(self, user_id):
        # Block or unblock a user
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        user.active = not user.active  # Toggle the active status
        db.session.commit()

        status = "blocked" if not user.active else "active"
        return {'message': f'User {status} successfully'}, 200


# Service request viewing for Admin
class ServiceRequestManagementResource(Resource):
    @marshal_with(service_request_fields)
    @auth_required('token')
    def get(self, request_id=None):
        # Only allow Admin users to view service requests
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        if request_id:
            service_request = ServiceRequest.query.get(request_id)
            if not service_request:
                return {'message': 'Service request not found'}, 404
            return service_request
        else:
            service_requests = ServiceRequest.query.all()
            return service_requests, 200


# Professional management for Admin
class ProfessionalManagementResource(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    def get(self, professional_id=None):
        # Admin views details of a specific professional or all professionals
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        if professional_id:
            professional = User.query.join(User.roles).filter(
                User.id == professional_id,
                Role.name == "Service Professional"
            ).first()
            if not professional:
                return {'message': 'Service Professional not found'}, 404
            return professional
        else:
            professionals = User.query.join(User.roles).filter(Role.name == "Service Professional",User.permission == 'pending').all()
            return professionals, 200

    @auth_required('token')
    def patch(self, professional_id):
        # Toggle active status of a professional
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        professional = User.query.join(User.roles).filter(
            User.id == professional_id,
            Role.name == "Service Professional"
        ).first()
        if not professional:
            return {'message': 'Service Professional not found'}, 404

        professional.active = not professional.active
        db.session.commit()

        status = "approved" if professional.active else "rejected"
        return {'message': f'Service Professional {status} successfully'}, 200

    @auth_required('token')
    def post(self, professional_id):
        # Approve or reject professional's permission
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403
        
        # Parse action (approve or reject) from request arguments
        parser = reqparse.RequestParser()
        parser.add_argument('action', type=str, required=True, choices=('approve', 'reject'))
        args = parser.parse_args()

        professional = User.query.join(User.roles).filter(
            User.id == professional_id,
            Role.name == "Service Professional"
        ).first()
        if not professional:
            return {'message': 'Service Professional not found'}, 404

        # Approve or reject logic
        if args['action'] == 'approve':
            professional.permission = 'approved'
            professional.active = True 
        elif args['action'] == 'reject':
            professional.permission = 'rejected'


        db.session.commit()
        return {'message': f'Professional permission {args["action"]}ed successfully'}, 200
    
#  Admin gets all approved professional details 
class AllProfessionalsResource(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    def get(self):
        # Check if the current user has admin privileges
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        # Retrieve all professionals without filtering by permission status
        professionals = User.query.join(User.roles).filter(
            Role.name == "Service Professional",
            User.permission != 'pending'  # Exclude professionals with pending permission
        ).all()
        
        return professionals, 200
    
# Customer management for Admin
class CustomerManagementResource(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    def get(self):
        # Check if the current user has admin privileges
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        # Retrieve all users with the 'Customer' role
        customers = User.query.join(User.roles).filter(Role.name == "Customer").all()
        
        return customers, 200

    @auth_required('token')
    def patch(self, user_id):
        # Toggle active status of a customer
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        customer = User.query.get(user_id)
        if not customer:
            return {'message': 'Customer not found'}, 404

        customer.active = not customer.active  # Toggle the active status
        db.session.commit()

        status = "blocked" if not customer.active else "active"
        return {'message': f'Customer {status} successfully'}, 200


# User resource for updating profile information
class UserResource(Resource):
    @marshal_with(user_fields)
    @auth_required('token')
    def put(self):
        # Any authenticated user can update their own profile
        user = User.query.get(current_user.id)
        if not user:
            return {'message': 'User not found'}, 404

        args = user_parser.parse_args()
        if args['email']:
            user.email = args['email']
        if args['password']:
            user.password = args['password']
        if args['name']:
            user.name = args['name']
        if args['service_type']:
            user.service_type = args['service_type']
        if args['experience']:
            user.experience = args['experience']
        if args['description']:
            user.description = args['description']

        db.session.commit()
        return user, 200


# Service Professional actions (view and accept/reject service requests)
class ProfessionalResource(Resource):
    @marshal_with(service_request_fields)
    @auth_required('token')
    def get(self, professional_id):
        if 'Service Professional' not in [role.name for role in current_user.roles]:
            return {'message': 'Access denied'}, 403

        # Filter by professional's service type
        service_requests = ServiceRequest.query.filter_by(professional_id=professional_id, service_id=current_user.service_id).all()

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
            remarks=args.get('remarks'),
            customer_phone=args.get('customer_phone')
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


# Service listing for all available services
class AvailableServicesResource(Resource):
    @marshal_with(service_fields)
    def get(self, service_id=None):
        if service_id:
            @auth_required('token')
            def fetch_service():
                service = Service.query.get(service_id)
                if not service:
                    return {"message": "Service not found"}, 404
                return service
            
            return fetch_service() 
        else:
            # Return all available services
            services = Service.query.all()
            return services


# Define routes for the resources
api.add_resource(AdminResource, '/admin/services', '/admin/services/<int:service_id>','/admin/block_user/<int:user_id>')
api.add_resource(ServiceRequestManagementResource, '/admin/requests', '/admin/requests/<int:request_id>')
api.add_resource(AllProfessionalsResource, '/admin/all_professionals')
api.add_resource(ProfessionalManagementResource, '/admin/professionals', '/admin/professionals/<int:professional_id>')
api.add_resource(CustomerManagementResource, '/admin/customers', '/admin/customers/<int:user_id>')
api.add_resource(UserResource, '/users/profile')
api.add_resource(ProfessionalResource, '/professionals/<int:professional_id>', '/professionals/request/<int:request_id>')
api.add_resource(CustomerResource, '/customers/services','/customers/requests','/customers/requests/<int:request_id>')
api.add_resource(AvailableServicesResource, '/services','/services/<int:service_id>')
