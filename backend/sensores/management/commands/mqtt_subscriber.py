import json
import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from django.utils import timezone
from sensores.models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua


BROKER_HOST = "10.102.0.20"   # IP del broker en la red
BROKER_PORT = 1883            # puerto por defecto
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
                    valor = payload.get("valor") or payload.get("humedad") or payload.get("hum")
                    HumedadTierra.objects.create(
                        valor=valor,
                        ts_sensor=payload.get("ts_sensor", ts_sensor),
                    )

                elif topic == "/ambiente":
                    temperatura = payload.get("temperatura") or payload.get("temp")
                    humedad = payload.get("humedad") or payload.get("hum")
                    Ambiente.objects.create(
                        temperatura=temperatura,
                        humedad=humedad,
                        ts_sensor=payload.get("ts_sensor", ts_sensor),
                    )

                elif topic == "/estado_bomba":
                    estado_raw = payload.get("estado")
                    # normalizar: acepta True/False, "ON"/"OFF", "1"/"0"
                    estado_bool = None
                    if isinstance(estado_raw, bool):
                        estado_bool = estado_raw
                    elif isinstance(estado_raw, str):
                        estado_bool = estado_raw.strip().lower() in ["on", "true", "1"]
                    elif isinstance(estado_raw, (int, float)):
                        estado_bool = bool(estado_raw)

                    if estado_bool is not None:
                        EstadoBomba.objects.create(
                            estado=estado_bool,
                            ts_sensor=payload.get("ts_sensor", ts_sensor),
                        )
                    else:
                        self.stderr.write(self.style.ERROR(f"Estado inválido en /estado_bomba: {estado_raw}"))

                elif topic == "/nivel_agua":
                    distancia = payload.get("distancia") or payload.get("nivel")
                    NivelAgua.objects.create(
                        distancia=distancia,
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
