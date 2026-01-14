'use client';
import { useState } from 'react';

export default function TabbedPage({ title, tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>{title}</h1>
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === index ? '#1976d2' : 'transparent',
              color: activeTab === index ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: activeTab === index ? 'bold' : 'normal',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
