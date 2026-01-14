'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

/**
 * Componente Google Maps wrapper
 * Ready para integración con Google Maps API
 */
export default function GoogleMapWrapper({ 
  center = { lat: 4.6097, lng: -74.0817 }, // Bogotá
  zoom = 12,
  markers = [],
  onMarkerClick,
}) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Cargar Google Maps script
    const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    
    if (!GOOGLE_MAPS_KEY) {
      console.warn('Google Maps API key no configurada');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (!mapLoaded) {
    return (
      <div className="map-loading">
        <MapPin size={48} />
        <p>Cargando mapa...</p>
        <p className="map-hint">Configurar NEXT_PUBLIC_GOOGLE_MAPS_KEY</p>
      </div>
    );
  }

  return (
    <div className="google-map-wrapper">
      <div id="map" style={{ width: '100%', height: '100%' }} />
      {/* TODO: Inicializar mapa con google.maps.Map */}
    </div>
  );
}

/*
Integración completa:

1. Obtener API key de Google Cloud Console
2. Habilitar Maps JavaScript API
3. Agregar a .env: NEXT_PUBLIC_GOOGLE_MAPS_KEY=tu_key_aqui

4. Inicializar mapa:
useEffect(() => {
  if (mapLoaded && window.google) {
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center,
      zoom,
    });

    markers.forEach(marker => {
      new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title,
      });
    });
  }
}, [mapLoaded, center, zoom, markers]);
*/
