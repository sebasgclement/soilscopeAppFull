from rest_framework import serializers
from .models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua
from .models import SensorConfig

class HumedadTierraSerializer(serializers.ModelSerializer):
    class Meta:
        model = HumedadTierra
        fields = "__all__"


class AmbienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ambiente
        fields = "__all__"


class EstadoBombaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoBomba
        fields = "__all__"


class NivelAguaSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelAgua
        fields = "__all__"

class SensorConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorConfig
        fields = "__all__"
