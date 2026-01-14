'use client';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function Dashboard() {
  const { user, isAuthenticated, loading, permissions, operations, logout } =
    useAuth(); // Get states from AuthContext
  return (
    <div
      className="dashboard-main"
      style={{ padding: '32px 0 0 0', maxWidth: '900px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '40px' }}>
        <h2
          style={{
            color: '#0056b3',
            marginBottom: '15px',
            fontWeight: 700,
            fontSize: '1.15em',
          }}
        >
          Dashboard
        </h2>
      </div>
      {/* Gráficas de muestra para dashboard */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            padding: '24px',
            minWidth: '320px',
            maxWidth: '400px',
          }}
        >
          <h3
            style={{ color: '#1976d2', fontWeight: 700, marginBottom: '12px' }}
          >
            Gráfica de barras
          </h3>
          <img
            src="https://quickchart.io/chart?c={type:'bar',data:{labels:['Ene','Feb','Mar','Abr'],datasets:[{label:'Ventas',data:[12,19,3,5]}]}}"
            alt="Gráfica de barras"
            style={{ width: '100%', height: '160px', objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            padding: '24px',
            minWidth: '320px',
            maxWidth: '400px',
          }}
        >
          <h3
            style={{ color: '#1976d2', fontWeight: 700, marginBottom: '12px' }}
          >
            Gráfica circular
          </h3>
          <img
            src="https://quickchart.io/chart?c={type:'pie',data:{labels:['A','B','C'],datasets:[{data:[30,50,20]}]}}"
            alt="Gráfica circular"
            style={{ width: '100%', height: '160px', objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
}
