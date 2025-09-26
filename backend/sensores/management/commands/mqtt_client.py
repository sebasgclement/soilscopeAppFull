import json
import paho.mqtt.client as mqtt

BROKER_HOST = "localhost"   # cambiar por la IP/host real del broker
BROKER_PORT = 1883
TOPIC_COMANDO = "/comando_bomba"


def publicar_comando(estado: bool):
    """
    Publica un comando al broker para encender/apagar la bomba.
    estado=True -> encender
    estado=False -> apagar
    """
    client = mqtt.Client()
    client.connect(BROKER_HOST, BROKER_PORT, 60)

    payload = {
        "estado": estado
    }

    client.publish(TOPIC_COMANDO, json.dumps(payload), qos=1, retain=False)
    client.disconnect()
