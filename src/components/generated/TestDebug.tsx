import React from 'react';

const TestDebug: React.FC = () => {
  console.log('🔧 TestDebug Komponente geladen!');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f8ff', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#0066cc' }}>🔧 Test Debug - Navigation Test</h1>
      <div style={{ 
        backgroundColor: '#e6f3ff', 
        padding: '15px', 
        borderRadius: '8px',
        margin: '20px 0',
        border: '2px solid #0066cc'
      }}>
        <h2 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>✅ Navigation funktioniert!</h2>
        <p style={{ margin: '0', color: '#333' }}>
          Diese Komponente wurde erfolgreich geladen. Die Navigation ist funktionsfähig.
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        margin: '20px 0',
        border: '2px solid #ffc107'
      }}>
        <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>📋 Nächste Schritte:</h3>
        <ul style={{ margin: '0', color: '#856404' }}>
          <li>✅ Navigation getestet</li>
          <li>🔄 Komponenten-Loading getestet</li>
          <li>🎯 Bereit für Document Management Debug</li>
        </ul>
      </div>
      
      <button 
        onClick={() => {
          console.log('🔧 Test Button geklickt!');
          alert('Test Button funktioniert!');
        }}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🧪 Test Button
      </button>
    </div>
  );
};

export default TestDebug; 