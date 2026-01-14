// frontend/app/components/MenuItem.js
'use client';

export default function MenuItem({ label, icon, url, isActive, onClick }) {
  // Check if icon is a FontAwesome class name
  const isFontAwesome = typeof icon === 'string' && (icon.startsWith('fa-') || icon.startsWith('fa ') || icon.includes('fa-'));
  
  return (
    <button
      className="menu-btn pro-btn"
      style={{
        background: isActive ? '#1565c0' : '#e3eafc',
        color: isActive ? '#fff' : '#1565c0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        fontWeight: 600,
        borderRadius: '10px',
        width: '100%',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: 'none',
        outline: 'none',
        padding: '12px 15px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onClick={onClick}
    >
      <span className="item-icon" style={{ fontSize: '1.5em' }}>
        {isFontAwesome ? <i className={`fa ${icon}`}></i> : icon}
      </span>
      <span className="item-label" style={{ fontWeight: 600 }}>
        {label}
      </span>
    </button>
  );
}