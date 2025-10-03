from django.urls import re_path
from .consumers import SensorConsumer

websocket_urlpatterns = [
    re_path(r"ws/sensores/$", SensorConsumer.as_asgi()),
]
