from rest_framework import routers
from .views import HumedadTierraViewSet, AmbienteViewSet, EstadoBombaViewSet, NivelAguaViewSet, SensorConfigViewSet

router = routers.DefaultRouter()
router.register(r"humedad", HumedadTierraViewSet)
router.register(r"ambiente", AmbienteViewSet)
router.register(r"bomba", EstadoBombaViewSet)
router.register(r"nivel", NivelAguaViewSet)
router.register(r"sensores-config", SensorConfigViewSet)

urlpatterns = router.urls
