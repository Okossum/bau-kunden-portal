import React from 'react';

const SimpleDebug: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">🔧 Simple Debug</h1>
        <p className="text-gray-700 mb-4">
          Diese Komponente ist erreichbar! Die Navigation funktioniert.
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Debug-Komponente erfolgreich geladen!
        </div>
      </div>
    </div>
  );
};

export default SimpleDebug; 