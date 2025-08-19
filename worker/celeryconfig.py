"""
Celery configuration for SneakerSniper
"""

import os
from kombu import Exchange, Queue

# Broker settings
broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
result_backend = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Task settings
task_serializer = 'pickle'
result_serializer = 'pickle'
accept_content = ['json', 'pickle']
timezone = 'UTC'
enable_utc = True

# Performance settings
worker_prefetch_multiplier = 1
worker_max_tasks_per_child = 1000
worker_disable_rate_limits = False
task_compression = 'gzip'

# Task routing
task_routes = {
    'checkout.*': {'queue': 'high_priority'},
    'monitoring.*': {'queue': 'medium_priority'},
    'community.*': {'queue': 'low_priority'}
}

# Queue configuration
task_queues = (
    Queue('high_priority', Exchange('high_priority'), routing_key='high_priority'),
    Queue('medium_priority', Exchange('medium_priority'), routing_key='medium_priority'),
    Queue('low_priority', Exchange('low_priority'), routing_key='low_priority'),
)

# Task time limits
task_time_limit = 300  # 5 minutes hard limit
task_soft_time_limit = 240  # 4 minutes soft limit

# Retry settings
task_acks_late = True
task_reject_on_worker_lost = True
task_default_retry_delay = 60  # 1 minute
task_max_retries = 3

# Result backend settings
result_expires = 3600  # 1 hour
result_persistent = False
result_compression = 'gzip'

# Worker settings
worker_concurrency = os.cpu_count() * 2
worker_enable_remote_control = True
worker_send_task_events = True
task_send_sent_event = True

# Beat schedule for periodic tasks
beat_schedule = {
    'rotate-proxies': {
        'task': 'worker.tasks.rotate_proxies',
        'schedule': 300.0,  # Every 5 minutes
        'options': {'queue': 'medium_priority'}
    },
    'analyze-performance': {
        'task': 'worker.tasks.analyze_checkout_performance',
        'schedule': 900.0,  # Every 15 minutes
        'options': {'queue': 'low_priority'}
    },
    'daily-cleanup': {
        'task': 'worker.tasks.cleanup_old_data',
        'schedule': 86400.0,  # Daily
        'options': {'queue': 'low_priority'}
    }
}

# Monitoring
worker_hijacking_freq = 30.0
worker_stats_rate = 10.0

# Error handling
task_annotations = {
    '*': {
        'rate_limit': '100/m',
        'time_limit': 300,
        'soft_time_limit': 240,
    },
    'worker.tasks.process_checkout_batch': {
        'rate_limit': '1000/m',  # Higher rate for checkouts
    }
}
