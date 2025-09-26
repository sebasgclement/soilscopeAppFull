from rest_framework.decorators import api_view
from rest_framework.response import Response
from .mqtt_client import publicar_comando


@api_view(["POST"])
def control_bomba(request):
    estado = request.data.get("estado")

    if estado not in [True, False, "true", "false", 1, 0, "1", "0"]:
        return Response({"error": "Parámetro 'estado' inválido"}, status=400)

    # convertir a bool
    estado_bool = str(estado).lower() in ["true", "1"]

    publicar_comando(estado_bool)

    return Response({"mensaje": f"Bomba {'ENCENDIDA' if estado_bool else 'APAGADA'}"})
