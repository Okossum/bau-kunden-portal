import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Search, Filter, Download, Trash2, Edit, Eye, Folder, FolderOpen } from 'lucide-react';
import { User, Client, Project, Document } from './DocumentPortal';
import DocumentUpload from './DocumentUpload';
import { DocumentMetadata } from '../../services/documentService';

interface AdminDocumentViewProps {
  clients: Client[];
  projects: Project[];
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  currentUser: User;
}

// Document categories/folders
const DOCUMENT_CATEGORIES = {
  'pläne': ['pdf', 'dwg', 'dxf', 'rvt', 'skp'],
  'verträge': ['pdf', 'doc', 'docx'],
  'genehmigungen': ['pdf', 'jpg', 'jpeg', 'png'],
  'bilder': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg']
};

const AdminDocumentView: React.FC<AdminDocumentViewProps> = ({
  clients,
  projects,
  documents,
  onDocumentsChange,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'clients'>('overview');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  // Filter documents based on selections
  const filteredDocuments = documents.filter(doc => {
    const matchesClient = selectedClient === 'all' || doc.clientId === selectedClient;
    const matchesProject = selectedProject === 'all' || doc.projectId === selectedProject;
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by folder/category
    const matchesFolder = selectedFolder === 'all' || 
      Object.entries(DOCUMENT_CATEGORIES).some(([category, extensions]) => {
        if (selectedFolder === category) {
          return extensions.some(ext => doc.type.toLowerCase().includes(ext));
        }
        return false;
      });
    
    return matchesClient && matchesProject && matchesSearch && matchesFolder;
  });

  // Get projects for selected client
  const clientProjects = selectedClient === 'all' 
    ? projects 
    : projects.filter(p => p.clientId === selectedClient);

  // Get documents by category
  const getDocumentsByCategory = (category: string) => {
    const extensions = DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES] || [];
    return documents.filter(doc => 
      extensions.some(ext => doc.type.toLowerCase().includes(ext))
    );
  };

  // Get folder icon
  const getFolderIcon = (category: string) => {
    return selectedFolder === category ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />;
  };

  const handleUploadComplete = (document: DocumentMetadata) => {
    // Convert DocumentMetadata to Document format
    const newDocument: Document = {
      id: document.id || Date.now().toString(),
      name: document.filename,
      type: document.fileType.split('/')[1] || 'unknown',
      size: document.fileSize,
      description: document.description,
      uploadDate: document.uploadedAt.toISOString(),
      projectId: document.projectId || 'general',
      clientId: '1', // Default client - in real app this would be determined by project
      uploadedBy: currentUser.name,
      url: document.storageUrl
    };

    onDocumentsChange([...documents, newDocument]);
    setShowUploadSuccess(true);
    setActiveTab('overview');
    
    setTimeout(() => {
      setShowUploadSuccess(false);
    }, 3000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      onDocumentsChange(documents.filter(doc => doc.id !== documentId));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showUploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">Dokument erfolgreich hochgeladen!</span>
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Übersicht
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Hochladen
            </div>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'clients'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Kunden
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Document Folders */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Dokumentenordner</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(DOCUMENT_CATEGORIES).map(([category, extensions]) => {
                const categoryDocuments = getDocumentsByCategory(category);
                const isSelected = selectedFolder === category;
                
                return (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedFolder(isSelected ? 'all' : category)}
                    className={`p-4 border rounded-lg transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                        {getFolderIcon(category)}
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {categoryDocuments.length}
                      </span>
                    </div>
                    <h4 className={`font-medium text-sm capitalize ${
                      isSelected ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {category === 'pläne' ? 'Pläne' :
                       category === 'verträge' ? 'Verträge' :
                       category === 'genehmigungen' ? 'Genehmigungen' : 'Bilder'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {extensions.join(', ').toUpperCase()}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Dokumente durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Client Filter */}
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Kunden</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.company}
                  </option>
                ))}
              </select>

              {/* Project Filter */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Projekte</option>
                {clientProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* Folder Filter */}
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Ordner</option>
                <option value="pläne">Pläne</option>
                <option value="verträge">Verträge</option>
                <option value="genehmigungen">Genehmigungen</option>
                <option value="bilder">Bilder</option>
              </select>

              {/* Upload Button */}
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neues Dokument
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedFolder === 'all' ? 'Alle Dokumente' : 
                   selectedFolder === 'pläne' ? 'Pläne' :
                   selectedFolder === 'verträge' ? 'Verträge' :
                   selectedFolder === 'genehmigungen' ? 'Genehmigungen' : 'Bilder'} 
                  ({filteredDocuments.length})
                </h2>
                
                <div className="flex items-center gap-2">
                  {selectedFolder !== 'all' && (
                    <button
                      onClick={() => setSelectedFolder('all')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Alle Ordner
                    </button>
                  )}
                  {selectedClient !== 'all' && (
                    <button
                      onClick={() => setSelectedClient('all')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Alle Kunden
                    </button>
                  )}
                  {selectedProject !== 'all' && (
                    <button
                      onClick={() => setSelectedProject('all')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Alle Projekte
                    </button>
                  )}
                </div>
              </div>
              
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-slate-600">
                    {searchTerm || selectedClient !== 'all' || selectedProject !== 'all' || selectedFolder !== 'all'
                      ? 'Keine Dokumente gefunden.'
                      : 'Noch keine Dokumente vorhanden.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((document) => {
                    const project = projects.find(p => p.id === document.projectId);
                    const client = clients.find(c => c.id === document.clientId);
                    
                    return (
                      <motion.div
                        key={document.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="text-2xl">{getFileIcon(document.type)}</div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-900 truncate">
                              {document.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                              <span>{formatFileSize(document.size)}</span>
                              <span>•</span>
                              <span>{formatDate(document.uploadDate)}</span>
                              <span>•</span>
                              <span>{client?.company}</span>
                              {project && (
                                <>
                                  <span>•</span>
                                  <span>{project.name}</span>
                                </>
                              )}
                            </div>
                            {document.description && (
                              <p className="text-xs text-slate-600 mt-1 truncate">
                                {document.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => window.open(document.url, '_blank')}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Anzeigen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => window.open(document.url, '_blank')}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Herunterladen"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Neues Dokument hochladen
            </h2>
            <p className="text-slate-600">
              Laden Sie Dokumente für Ihre Kunden und Projekte hoch.
            </p>
          </div>
          
                      <DocumentUpload
              userId={currentUser.id}
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

      {activeTab === 'clients' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Kundenübersicht</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const clientProjects = projects.filter(p => p.clientId === client.id);
              const clientDocuments = documents.filter(d => d.clientId === client.id);
              
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {client.company}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{client.name}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Projekte:</span>
                      <span className="font-medium">{clientProjects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dokumente:</span>
                      <span className="font-medium">{clientDocuments.length}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedClient(client.id);
                      setActiveTab('overview');
                    }}
                    className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Dokumente anzeigen
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentView;