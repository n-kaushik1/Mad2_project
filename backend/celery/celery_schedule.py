from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder,send_daily_reminders,generate_all_customer_reports


celery_app  = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):

    sender.add_periodic_task(
                crontab(hour=15, minute=37),  # Adjust time as needed
                send_daily_reminders.s()
    )

    sender.add_periodic_task(
        crontab(minute=57, hour=15, day_of_month=20),  # 1st of every month
        generate_all_customer_reports.s()
    )

@celery_app.task
def test(arg):
    print(arg)


