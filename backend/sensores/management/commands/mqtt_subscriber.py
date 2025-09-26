import json
import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from django.utils import timezone
from sensores.models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua


BROKER_HOST = "localhost"   # 👈 cambiar cuando Tobi tenga la IP/host real
BROKER_PORT = 1883          # puerto por defecto
TOPICS = [("/humedad", 0), ("/ambiente", 0), ("/estado_bomba", 0), ("/nivel_agua", 0)]


class Command(BaseCommand):
    help = "Suscriptor MQTT que guarda datos en la DB"

    def handle(self, *args, **kwargs):
        def on_connect(client, userdata, flags, rc):
            self.stdout.write(self.style.SUCCESS(f"Conectado al broker con código {rc}"))
            for topic, qos in TOPICS:
                client.subscribe(topic, qos)

        def on_message(client, userdata, msg):
            try:
                payload = json.loads(msg.payload.decode())
                ts_sensor = timezone.now()  # si no viene timestamp desde ESP32
                topic = msg.topic

                if topic == "/humedad":
                    HumedadTierra.objects.create(
                        valor=payload.get("valor"),
                        ts_sensor=payload.get("ts_sensor", ts_sensor),
                    )
                elif topic == "/ambiente":
                    Ambiente.objects.create(
                        temperatura=payload.get("temp"),
                        humedad=payload.get("hum"),
                        ts_sensor=payload.get("ts_sensor", ts_sensor),
                    )
                elif topic == "/estado_bomba":
                    EstadoBomba.objects.create(
                        estado=payload.get("estado"),
                        ts_sensor=payload.get("ts_sensor", ts_sensor),
                    )
                elif topic == "/nivel_agua":
                    NivelAgua.objects.create(
                        distancia=payload.get("distancia"),
                        ts_sensor=payload.get("ts_sensor", ts_sensor),
                    )

                self.stdout.write(self.style.SUCCESS(f"Guardado mensaje en {topic}: {payload}"))

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error procesando {msg.topic}: {e}"))

        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(BROKER_HOST, BROKER_PORT, 60)
        client.loop_forever()
