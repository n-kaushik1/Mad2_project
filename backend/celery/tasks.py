from celery import shared_task
import time
import flask_excel
from backend.models import ServiceRequest
from backend.celery.mail_service import send_email
from backend.models import db, ServiceRequest, User,Role
from flask import current_app as app
import logging

@shared_task(ignore_results =False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(ignored_results=False)
def create_csv():
    # Filter service requests to include only those with `service_status = 'closed'`
    closed_requests = ServiceRequest.query.filter_by(service_status='closed').all()

    # Define the column names for the CSV
    column_names = [column.name for column in ServiceRequest.__table__.columns]

    # Create a CSV response with only closed service requests
    csv_out = flask_excel.make_response_from_query_sets(
        closed_requests, 
        column_names=column_names, 
        file_type='csv'
    )

    # Save the CSV to the file system
    with open('./backend/celery/user-downloads/ClosedServiceRequests.csv', 'wb') as file:
        file.write(csv_out.data)

    # Return the file name
    return 'ClosedServiceRequests.csv'

@shared_task(ignored_results=False)
def create_professional_csv(professional_id):
    # Filter closed service requests for the specific professional
    closed_requests = ServiceRequest.query.filter_by(
        service_status='closed',
        professional_id=professional_id
    ).all()

    # Define the column names for the CSV
    column_names = [column.name for column in ServiceRequest.__table__.columns]

    # Create a CSV response with only closed service requests for the professional
    csv_out = flask_excel.make_response_from_query_sets(
        closed_requests, 
        column_names=column_names, 
        file_type='csv'
    )

    # Save the CSV to the file system
    filename = f'ClosedServiceRequests_{professional_id}.csv'
    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)

    # Return the filename
    return filename

# Helper for daily emails
def fetch_accepted_requests():
    try:
        results = db.session.query(
            User.name.label('professional_name'),
            User.email.label('email'),
            ServiceRequest.id.label('request_id'),
            ServiceRequest.date_of_request.label('request_date'),
            ServiceRequest.service_status.label('status')
        ).join(
            User, User.id == ServiceRequest.professional_id
        ).filter(
            ServiceRequest.service_status == 'accepted',
            ServiceRequest.professional_id.isnot(None)
        ).all()

        if not results:
            logging.info("No assigned service requests found for professionals.")
        else:
            logging.info(f"Found {len(results)} assigned service requests.")

        return results

    except Exception as e:
        logging.error(f"Error fetching accepted requests: {e}")
        return []


@shared_task(ignore_results=True)
def email_reminder(to, subject ,content):
    send_email(to, subject ,content)

# Task to send daily reminders
@shared_task(ignore_results=True)
def send_daily_reminders():
    # Ensure that Celery has access to the Flask application context
    with app.app_context():
        requests = fetch_accepted_requests()
        if not requests:
            logging.info("No pending service requests found.")
        else:
            for req in requests:
                content = f"""
                <h1>Hi {req.professional_name},</h1>
                <p>You have pending service requests:</p>
                <ul>
                    <li>Request ID: {req.request_id}, Date of request: {req.request_date}</li>
                </ul>
                <p>Please attend to them as soon as possible.</p>
                """
                send_email(req.email, "Daily Service Request Reminder", content)
                logging.info(f"Reminder sent to {req.professional_name} at {req.email}") 


@shared_task(ignore_results=False)
def generate_all_customer_reports():
    try:
        # Query customers by joining the roles relationship
        customers = User.query.join(Role, User.roles).filter(Role.name == "Customer").all()

        if not customers:
            logging.info("No customers found with role 'Customer'.")
            return

        # Generate reports for each customer
        for customer in customers:
            generate_customer_monthly_report.delay(customer.id)

    except Exception as e:
        logging.error(f"Error generating reports for customers: {e}")


@shared_task(ignore_results=False)
def generate_customer_monthly_report(customer_id):
    try:
        # Get customer details
        customer = User.query.filter_by(id=customer_id).first()
        if not customer:
            logging.error(f"No customer found with ID {customer_id}")
            return
        
        # Get all service requests for the customer in the current month
        from datetime import datetime, timedelta
        today = datetime.today()
        start_date = today.replace(day=1)  # First day of the current month
        end_date = (today.replace(day=28) + timedelta(days=4)).replace(day=1)  # First day of the next month

        service_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer_id,
            ServiceRequest.date_of_request >= start_date,
            ServiceRequest.date_of_request < end_date
        ).all()

        # Summarize data
        total_requests = len(service_requests)
        closed_requests = len([req for req in service_requests if req.service_status == 'closed'])
        open_requests = total_requests - closed_requests

        # Generate HTML report
        html_content = f"""
        <html>
            <head>
                <style>
                    table {{
                        width: 100%;
                        border-collapse: collapse;
                    }}
                    th, td {{
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }}
                    th {{
                        background-color: #f4f4f4;
                    }}
                </style>
            </head>
            <body>
                <h1>Monthly Activity Report</h1>
                <p>Dear {customer.name},</p>
                <p>Here is your activity report for {start_date.strftime('%B %Y')}:</p>
                <ul>
                    <li>Total service requests: {total_requests}</li>
                    <li>Closed service requests: {closed_requests}</li>
                    <li>Open service requests: {open_requests}</li>
                </ul>
                <h2>Service Request Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service Name</th>
                            <th>Status</th>
                            <th>Date of Request</th>
                            <th>Date of Completion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {"".join([
                            f"<tr><td>{req.id}</td><td>{req.service.name}</td><td>{req.service_status}</td><td>{req.date_of_request}</td><td>{req.date_of_completion or 'N/A'}</td></tr>"
                            for req in service_requests
                        ])}
                    </tbody>
                </table>
                <p>Thank you for using our service!</p>
            </body>
        </html>
        """

        # Send email
        send_email(customer.email, f"Monthly Activity Report - {start_date.strftime('%B %Y')}", html_content)
        logging.info(f"Monthly report sent to {customer.email}")
    except Exception as e:
        logging.error(f"Error generating monthly report for customer {customer_id}: {e}")


