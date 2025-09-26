from rest_framework import viewsets
from .models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua
from .serializers import (
    HumedadTierraSerializer,
    AmbienteSerializer,
    EstadoBombaSerializer,
    NivelAguaSerializer,
)

# Create your views here.


class HumedadTierraViewSet(viewsets.ModelViewSet):
    queryset = HumedadTierra.objects.all().order_by("-ts_server")
    serializer_class = HumedadTierraSerializer


class AmbienteViewSet(viewsets.ModelViewSet):
    queryset = Ambiente.objects.all().order_by("-ts_server")
    serializer_class = AmbienteSerializer


class EstadoBombaViewSet(viewsets.ModelViewSet):
    queryset = EstadoBomba.objects.all().order_by("-ts_server")
    serializer_class = EstadoBombaSerializer


class NivelAguaViewSet(viewsets.ModelViewSet):
    queryset = NivelAgua.objects.all().order_by("-ts_server")
    serializer_class = NivelAguaSerializer
