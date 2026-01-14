from rest_framework import serializers
from .models import EncSolicitud, DetalleSolicitud

class DetalleSolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleSolicitud
        fields = '__all__'

class EncSolicitudSerializer(serializers.ModelSerializer):
    detalles = DetalleSolicitudSerializer(many=True, required=False)

    class Meta:
        model = EncSolicitud
        fields = '__all__'

from .models import CorreosNotificacion

class CorreosNotificacionSerializer(serializers.ModelSerializer):
    # If you want the name of the type:
    tipo_novedad_nombre = serializers.CharField(source='tipo_novedad.nombre', read_only=True)
    
    class Meta:
        model = CorreosNotificacion
        fields = '__all__'
