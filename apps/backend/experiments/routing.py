from django.urls import re_path
from .consumers import ExperimentConsumer

websocket_urlpatterns = [
    re_path(r'ws/experiments/$', ExperimentConsumer.as_asgi()),
]