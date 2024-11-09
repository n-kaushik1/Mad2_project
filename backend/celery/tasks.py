from celery import shared_task
import time
import flask_excel
from backend.models import ServiceRequest
from backend.celery.mail_service import send_email
from backend.models import db, ServiceRequest, User
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