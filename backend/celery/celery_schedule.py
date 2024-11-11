from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder,send_daily_reminders

celery_app  = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):


    sender.add_periodic_task(
                crontab(hour=16, minute=2),  # Adjust time as needed
                send_daily_reminders.s()
    )

@celery_app.task
def test(arg):
    print(arg)

