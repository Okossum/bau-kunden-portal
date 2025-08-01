import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Eye, Calendar, FileText } from 'lucide-react';
import { User, Project, Document } from './DocumentPortal';

interface ClientDocumentViewProps {
  projects: Project[];
  documents: Document[];
  currentUser: User;
}

const ClientDocumentView: React.FC<ClientDocumentViewProps> = ({
  projects,
  documents,
  currentUser
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

  // Filter documents based on selections
  const filteredDocuments = documents.filter(doc => {
    const matchesProject = selectedProject === 'all' || doc.projectId === selectedProject;
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesSearch;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'date':
      default:
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Willkommen, {currentUser.name}!</h2>
        <p className="text-blue-100">
          Hier finden Sie alle Dokumente und Informationen zu Ihren Bauprojekten.
        </p>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Ihre Projekte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectDocuments = documents.filter(d => d.projectId === project.id);
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-slate-900">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status === 'active' ? 'Aktiv' : 
                     project.status === 'completed' ? 'Abgeschlossen' : 'Pausiert'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-slate-600 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Start: {new Date(project.startDate).toLocaleDateString('de-DE')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {projectDocuments.length} Dokument{projectDocuments.length !== 1 ? 'e' : ''}
                  </span>
                  
                  <button
                    onClick={() => setSelectedProject(project.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Anzeigen
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Dokumente ({sortedDocuments.length})
            </h3>
            
            <button
              onClick={() => setSelectedProject('all')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Alle anzeigen
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Projekte</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sortiert nach Datum</option>
              <option value="name">Sortiert nach Name</option>
              <option value="size">Sortiert nach Größe</option>
            </select>
          </div>

          {/* Documents List */}
          {sortedDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-slate-600">
                {searchTerm || selectedProject !== 'all'
                  ? 'Keine Dokumente gefunden.'
                  : 'Noch keine Dokumente für Sie verfügbar.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDocuments.map((document) => {
                const project = projects.find(p => p.id === document.projectId);
                
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
                        <h4 className="text-sm font-medium text-slate-900 truncate">
                          {document.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                          <span>{formatFileSize(document.size)}</span>
                          <span>•</span>
                          <span>{formatDate(document.uploadDate)}</span>
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
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{projects.length}</div>
          <div className="text-sm text-slate-600">Aktive Projekte</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{documents.length}</div>
          <div className="text-sm text-slate-600">Verfügbare Dokumente</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {formatFileSize(documents.reduce((total, doc) => total + doc.size, 0))}
          </div>
          <div className="text-sm text-slate-600">Gesamtgröße</div>
        </div>
      </div>
    </div>
  );
};

export default ClientDocumentView;