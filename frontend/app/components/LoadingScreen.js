// ruta: frontend/app/components/LoadingScreen.js
"use client";

import React from 'react';

export default function LoadingScreen({ message = "Cargando..." }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}