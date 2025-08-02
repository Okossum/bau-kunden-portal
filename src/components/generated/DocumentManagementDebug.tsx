import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, Database, File, Folder, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentService, Document, DocumentFolder } from '../../services/documentService';
import ProjectService from '../../services/projectService';

interface DebugInfo {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const DocumentManagementDebug: React.FC = () => {
  const { currentUser } = useAuth();
  const [debugSteps, setDebugSteps] = useState<DebugInfo[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addDebugStep = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setDebugSteps(prev => [...prev, { step, status, message, data }]);
  };

  const runDebugTest = async () => {
    setIsRunning(true);
    setDebugSteps([]);

    try {
      // Step 1: Check Authentication
      addDebugStep('auth', 'pending', 'Überprüfe Authentifizierung...');
      if (!currentUser) {
        addDebugStep('auth', 'error', 'Kein Benutzer angemeldet');
        return;
      }
      addDebugStep('auth', 'success', `Benutzer angemeldet: ${currentUser.email}`, { uid: currentUser.uid, tenantId: currentUser.tenantId });

      // Step 2: Check MandantId
      const mandantId = currentUser.tenantId || 'default-tenant';
      addDebugStep('mandant', 'success', `MandantId: ${mandantId}`);

      // Step 3: Test ProjectService
      addDebugStep('projects', 'pending', 'Teste ProjectService...');
      try {
        const projects = await ProjectService.getProjectsByTenant(mandantId);
        addDebugStep('projects', 'success', `${projects.length} Projekte gefunden`, projects);
      } catch (error) {
        addDebugStep('projects', 'error', `ProjectService Fehler: ${error}`, error);
      }

      // Step 4: Test DocumentService - Get Documents
      addDebugStep('documents', 'pending', 'Teste DocumentService - Dokumente laden...');
      try {
        const documents = await DocumentService.getDocumentsByMandant(mandantId);
        addDebugStep('documents', 'success', `${documents.length} Dokumente gefunden`, documents);
      } catch (error) {
        addDebugStep('documents', 'error', `DocumentService Fehler: ${error}`, error);
      }

      // Step 5: Test DocumentService - Get Folders
      addDebugStep('folders', 'pending', 'Teste DocumentService - Ordner laden...');
      try {
        const projects = await ProjectService.getProjectsByTenant(mandantId);
        if (projects.length > 0) {
          const folders = await DocumentService.getFoldersByProject(projects[0].id!, mandantId);
          addDebugStep('folders', 'success', `${folders.length} Ordner für Projekt ${projects[0].projectName} gefunden`, folders);
        } else {
          addDebugStep('folders', 'error', 'Keine Projekte verfügbar für Ordner-Test');
        }
      } catch (error) {
        addDebugStep('folders', 'error', `Ordner-Service Fehler: ${error}`, error);
      }

      // Step 6: Test DocumentService - Create Folder
      addDebugStep('create-folder', 'pending', 'Teste Ordner-Erstellung...');
      try {
        const projects = await ProjectService.getProjectsByTenant(mandantId);
        if (projects.length > 0) {
          const testFolderName = `test-folder-${Date.now()}`;
          const newFolder = await DocumentService.createFolder(
            testFolderName,
            projects[0].id!,
            mandantId,
            currentUser.uid
          );
          addDebugStep('create-folder', 'success', `Ordner "${testFolderName}" erstellt`, newFolder);
        } else {
          addDebugStep('create-folder', 'error', 'Keine Projekte verfügbar für Ordner-Erstellung');
        }
      } catch (error) {
        addDebugStep('create-folder', 'error', `Ordner-Erstellung Fehler: ${error}`, error);
      }

    } catch (error) {
      addDebugStep('general', 'error', `Allgemeiner Fehler: ${error}`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Bug className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dokumentenverwaltung Debug</h1>
              <p className="text-gray-600">Systematische Fehleranalyse</p>
            </div>
          </div>

          {/* Debug Button */}
          <div className="mb-6">
            <button
              onClick={runDebugTest}
              disabled={isRunning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Database className="w-5 h-5" />
              <span>{isRunning ? 'Debug läuft...' : 'Debug starten'}</span>
            </button>
          </div>

          {/* Debug Results */}
          <div className="space-y-4">
            {debugSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  step.status === 'success' ? 'bg-green-50 border-green-200' :
                  step.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{step.step}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                    {step.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          Daten anzeigen
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(step.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          {debugSteps.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Zusammenfassung:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Gesamt:</span> {debugSteps.length}
                </div>
                <div>
                  <span className="font-medium text-green-600">Erfolgreich:</span> {debugSteps.filter(s => s.status === 'success').length}
                </div>
                <div>
                  <span className="font-medium text-red-600">Fehler:</span> {debugSteps.filter(s => s.status === 'error').length}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentManagementDebug; 