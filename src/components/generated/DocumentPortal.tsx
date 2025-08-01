import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Building2, ArrowLeft } from 'lucide-react';
import AdminDocumentView from './AdminDocumentView';
import ClientDocumentView from './ClientDocumentView';
import { useAuth } from '../../contexts/AuthContext';
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'client';
  email: string;
}
export interface Client {
  id: string;
  name: string;
  company: string;
}
export interface Project {
  id: string;
  name: string;
  clientId: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
}
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  description?: string;
  uploadDate: string;
  projectId: string;
  clientId: string;
  uploadedBy: string;
  url: string;
}
interface DocumentPortalProps {
  onNavigateToDashboard: () => void;
}

const DocumentPortal: React.FC<DocumentPortalProps> = ({ onNavigateToDashboard }) => {
  const { currentUser: authUser, userData } = useAuth();
  
  // Convert auth user to DocumentPortal User format
  const currentUser: User = {
    id: authUser?.uid || '1',
    name: userData?.displayName || authUser?.displayName || authUser?.email?.split('@')[0] || 'Benutzer',
    role: userData?.role === 'admin' ? 'admin' : 'client',
    email: authUser?.email || 'user@example.com'
  };

  // Mock data
  const [clients] = useState<Client[]>([{
    id: '1',
    name: 'Müller GmbH',
    company: 'Müller Bau'
  }, {
    id: '2',
    name: 'Schmidt AG',
    company: 'Schmidt Construction'
  }, {
    id: '3',
    name: 'Weber & Co',
    company: 'Weber Immobilien'
  }]);
  const [projects] = useState<Project[]>([{
    id: '1',
    name: 'Bürogebäude Zentrum',
    clientId: '1',
    status: 'active',
    startDate: '2024-01-15'
  }, {
    id: '2',
    name: 'Wohnkomplex Nord',
    clientId: '1',
    status: 'active',
    startDate: '2024-02-01'
  }, {
    id: '3',
    name: 'Industriehalle Süd',
    clientId: '2',
    status: 'completed',
    startDate: '2023-11-01'
  }, {
    id: '4',
    name: 'Einkaufszentrum West',
    clientId: '3',
    status: 'on-hold',
    startDate: '2024-03-01'
  }]);
  const [documents, setDocuments] = useState<Document[]>([{
    id: '1',
    name: 'Bauplan_Erdgeschoss.pdf',
    type: 'pdf',
    size: 2048000,
    description: 'Grundriss des Erdgeschosses',
    uploadDate: '2024-01-20T10:30:00Z',
    projectId: '1',
    clientId: '1',
    uploadedBy: 'admin',
    url: '#'
  }, {
    id: '2',
    name: 'Statik_Berechnung.pdf',
    type: 'pdf',
    size: 1536000,
    description: 'Statische Berechnungen für Tragwerk',
    uploadDate: '2024-01-22T14:15:00Z',
    projectId: '1',
    clientId: '1',
    uploadedBy: 'admin',
    url: '#'
  }, {
    id: '3',
    name: 'Fortschritt_Januar.jpg',
    type: 'jpg',
    size: 512000,
    description: 'Baufortschritt Ende Januar',
    uploadDate: '2024-01-31T16:45:00Z',
    projectId: '2',
    clientId: '1',
    uploadedBy: 'admin',
    url: '#'
  }]);
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Dokumentenverwaltung</h1>
                <p className="text-slate-600 mt-1">Bauprojekt-Dokumentation und -verwaltung</p>
              </div>
            </div>
            
            <button
              onClick={onNavigateToDashboard}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-600">Angemeldet als:</span>
              <strong className="text-slate-900">{currentUser.name}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentUser.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {currentUser.role === 'admin' ? 'Administrator' : 'Kunde'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {currentUser.role === 'admin' ? (
            <AdminDocumentView 
              clients={clients} 
              projects={projects} 
              documents={documents} 
              onDocumentsChange={setDocuments} 
              currentUser={currentUser} 
            />
          ) : (
            <ClientDocumentView 
              projects={projects.filter(p => p.clientId === currentUser.id)} 
              documents={documents.filter(d => d.clientId === currentUser.id)} 
              currentUser={currentUser} 
            />
          )}
        </main>
      </motion.div>
    </div>;
};
export default DocumentPortal;