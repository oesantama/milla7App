from rest_framework import serializers
from .models import DeliveryPlan, FileUploadLog


class DeliveryPlanSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = DeliveryPlan
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_by', 'created_at', 'updated_at')


class FileUploadLogSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    success_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = FileUploadLog
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_by', 'uploaded_at')
    
    def get_success_rate(self, obj):
        if obj.records_processed == 0:
            return 0
        return round((obj.records_success / obj.records_processed) * 100, 2)


class FileUploadResponseSerializer(serializers.Serializer):
    """Serializer para respuestas de carga de archivos"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    upload_log_id = serializers.IntegerField(required=False, allow_null=True)
    stats = serializers.DictField(required=False)
    errors = serializers.ListField(required=False)
