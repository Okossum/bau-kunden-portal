import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Folder, BarChart3, Settings } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import { DocumentMetadata } from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';

interface DocumentManagementProps {
  projectId?: string;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ projectId }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Bitte melden Sie sich an, um Dokumente zu verwalten.</p>
      </div>
    );
  }

  const handleUploadComplete = (document: DocumentMetadata) => {
    setShowUploadSuccess(true);
    setActiveTab('list');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowUploadSuccess(false);
    }, 3000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You could show a toast notification here
  };

  const handleDocumentDelete = (documentId: string) => {
    console.log('Document deleted:', documentId);
    // You could show a success message here
  };

  const handleDocumentEdit = (document: DocumentMetadata) => {
    console.log('Edit document:', document);
    // You could open an edit modal here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dokumentenverwaltung</h1>
            <p className="text-slate-600 mt-2">
              Verwalten Sie Ihre Dokumente und Dateien sicher und übersichtlich
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neues Dokument
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showUploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Dokument erfolgreich hochgeladen!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
          >
            <div className="flex items-center">
              <Folder className="w-4 h-4 mr-2" />
              Dokumente
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
          >
            <div className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Hochladen
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200">
        {activeTab === 'list' ? (
          <div className="p-6">
            <DocumentList
              userId={currentUser.uid}
              projectId={projectId}
              onDocumentDelete={handleDocumentDelete}
              onDocumentEdit={handleDocumentEdit}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Neues Dokument hochladen
              </h2>
              <p className="text-slate-600">
                Laden Sie Dokumente, Bilder oder andere Dateien hoch. 
                {projectId && ' Das Dokument wird automatisch diesem Projekt zugeordnet.'}
              </p>
            </div>
            
            <DocumentUpload
              userId={currentUser.uid}
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
              maxFileSize={50 * 1024 * 1024} // 50MB
              allowedFileTypes={[
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
              ]}
            />
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sicherheit & Datenschutz
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Alle Dokumente werden verschlüsselt gespeichert</li>
                <li>Zugriff nur für Sie und berechtigte Personen</li>
                <li>Automatische Backup-Sicherung</li>
                <li>DSGVO-konforme Datenspeicherung</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement; 