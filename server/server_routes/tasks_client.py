import os
import json
import logging

from google.cloud import tasks_v2

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-project-id")
GCP_LOCATION = os.getenv("GCP_LOCATION", "europe-west2")
CLOUD_TASKS_QUEUE = os.getenv("CLOUD_TASKS_QUEUE", "email-tasks")
SERVICE_URL = os.getenv("SERVICE_URL", "")
TASKS_INVOKER_SA = os.getenv("TASKS_INVOKER_SA", "")

tasks_client = tasks_v2.CloudTasksClient()


def enqueue_email_task(route_path: str, payload: dict):
    """Enqueue an HTTP POST task that Cloud Tasks will deliver to this service.

    Best-effort: failures are logged, never raised, since the caller has
    typically already committed a DB write it must not roll back.
    """
    try:
        queue_path = tasks_client.queue_path(GCP_PROJECT_ID, GCP_LOCATION, CLOUD_TASKS_QUEUE)

        task = {
            "http_request": {
                "http_method": tasks_v2.HttpMethod.POST,
                "url": f"{SERVICE_URL}{route_path}",
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(payload).encode("utf-8"),
                "oidc_token": {
                    "service_account_email": TASKS_INVOKER_SA,
                    "audience": SERVICE_URL,
                },
            }
        }

        tasks_client.create_task(request={"parent": queue_path, "task": task})
        logging.info(f"Enqueued Cloud Task for {route_path}: {payload}")
    except Exception as e:
        logging.error(f"Failed to enqueue Cloud Task for {route_path}: {e}")
