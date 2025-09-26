from django.db import models
from django.utils import timezone


# Create your models here.


class HumedadTierra(models.Model):
    valor = models.FloatField(help_text="Porcentaje de humedad en la tierra (0-100)")
    ts_sensor = models.DateTimeField(help_text="Timestamp enviado por el ESP32")
    ts_server = models.DateTimeField(default=timezone.now, help_text="Timestamp cuando se guarda en el servidor")

    def __str__(self):
        return f"Humedad {self.valor}% @ {self.ts_server}"


class Ambiente(models.Model):
    temperatura = models.FloatField(help_text="Temperatura en °C")
    humedad = models.FloatField(help_text="Humedad relativa (%)")
    ts_sensor = models.DateTimeField()
    ts_server = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"T: {self.temperatura}°C, H: {self.humedad}% @ {self.ts_server}"


class EstadoBomba(models.Model):
    estado = models.BooleanField(help_text="True = encendida, False = apagada")
    ts_sensor = models.DateTimeField()
    ts_server = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Bomba {'ON' if self.estado else 'OFF'} @ {self.ts_server}"


class NivelAgua(models.Model):
    distancia = models.FloatField(help_text="Distancia medida en cm")
    ts_sensor = models.DateTimeField()
    ts_server = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Nivel {self.distancia} cm @ {self.ts_server}"
