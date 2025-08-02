import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Folder, 
  File, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Plus,
  Eye,
  MoreVertical,
  ArrowLeft,
  Database,
  Users,
  Calendar,
  Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentService, Document, DocumentFolder, DocumentUpload } from '../../services/documentService';
import ProjectService from '../../services/projectService';

interface DocumentManagementPageProps {
  onNavigateToDashboard?: () => void;
  onNavigateToProjectManagement?: () => void;
}

interface Project {
  id: string;
  projectName: string;
  description?: string;
  status: string;
  tenantId: string;
}

const DocumentManagementPage: React.FC<DocumentManagementPageProps> = ({
  onNavigateToDashboard,
  onNavigateToProjectManagement
}) => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [uploadTags, setUploadTags] = useState<string>('');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterFolder, setFilterFolder] = useState<string>('');
  const [filterTags, setFilterTags] = useState<string>('');
  
  // UI state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mandantId = currentUser?.tenantId || '';
  
  // Test function to check if ProjectService is working
  const testProjectService = async () => {
    console.log('DocumentManagementPage: Testing ProjectService...');
    try {
      const testProjects = await ProjectService.getProjectsByTenant('default-tenant');
      console.log('DocumentManagementPage: Test projects loaded:', testProjects.length);
    } catch (error) {
      console.error('DocumentManagementPage: Test ProjectService error:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    console.log('DocumentManagementPage: useEffect triggered');
    console.log('DocumentManagementPage: mandantId in useEffect:', mandantId);
    loadData();
    // Also test ProjectService directly
    testProjectService();
  }, [mandantId, loadData]);

  const loadData = useCallback(async () => {
    console.log('DocumentManagementPage: loadData called');
    console.log('DocumentManagementPage: mandantId:', mandantId);
    console.log('DocumentManagementPage: currentUser:', currentUser);
    
    setLoading(true);
    setError(null);
    
    try {
      // Load projects - use mandantId or fallback to 'default-tenant'
      const effectiveMandantId = mandantId || 'default-tenant';
      console.log('DocumentManagementPage: Using effectiveMandantId:', effectiveMandantId);
      
      const projectsData = await ProjectService.getProjectsByTenant(effectiveMandantId);
      console.log('DocumentManagementPage: Projects loaded:', projectsData.length);
      setProjects(projectsData);
      
      // Load documents
      const documentsData = await DocumentService.getDocumentsByMandant(effectiveMandantId);
      console.log('DocumentManagementPage: Documents loaded:', documentsData.length);
      setDocuments(documentsData);
      
      // Load folders for all projects
      const allFolders: DocumentFolder[] = [];
      for (const project of projectsData) {
        const projectFolders = await DocumentService.getFoldersByProject(project.id, effectiveMandantId);
        allFolders.push(...projectFolders);
      }
      console.log('DocumentManagementPage: Folders loaded:', allFolders.length);
      setFolders(allFolders);
      
    } catch (err) {
      console.error('DocumentManagementPage: Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      console.log('DocumentManagementPage: loadData completed');
      setLoading(false);
    }
  }, [mandantId, currentUser]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length || !selectedProject || !selectedFolder || !user) {
      setError('Bitte wählen Sie Dateien, Projekt und Ordner aus');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const tags = uploadTags ? uploadTags.split(',').map(tag => tag.trim()) : [];
        
        const upload: DocumentUpload = {
          file,
          projectId: selectedProject,
          folder: selectedFolder,
          tags,
          meta: {
            uploadedVia: 'DocumentManagementPage'
          }
        };

        await DocumentService.uploadDocument(upload, mandantId, currentUser?.uid || '');
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      // Reset form and reload data
      setSelectedFiles([]);
      setSelectedProject('');
      setSelectedFolder('');
      setUploadTags('');
      setShowUploadModal(false);
      await loadData();
      
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Fehler beim Hochladen der Dateien');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFiles, selectedProject, selectedFolder, uploadTags, currentUser, mandantId, loadData]);

  // Handle folder creation
  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName || !selectedProject || !currentUser) {
      setError('Bitte geben Sie einen Ordnernamen ein und wählen Sie ein Projekt aus');
      return;
    }

    try {
      await DocumentService.createFolder(newFolderName, selectedProject, mandantId, currentUser.uid);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      await loadData();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Fehler beim Erstellen des Ordners');
    }
  }, [newFolderName, selectedProject, currentUser, mandantId, loadData]);

  // Handle document deletion
  const handleDeleteDocument = useCallback(async (documentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      return;
    }

    try {
      await DocumentService.deleteDocument(documentId);
      await loadData();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Fehler beim Löschen des Dokuments');
    }
  }, [loadData]);

  // Handle document download
  const handleDownload = useCallback((document: Document) => {
    const link = window.document.createElement('a');
    link.href = document.downloadUrl;
    link.download = document.filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProject = !filterProject || doc.projectId === filterProject;
    const matchesFolder = !filterFolder || doc.folder === filterFolder;
    const matchesTags = !filterTags || 
      doc.tags?.some(tag => tag.toLowerCase().includes(filterTags.toLowerCase()));

    return matchesSearch && matchesProject && matchesFolder && matchesTags;
  });

  // Get project name by ID
  const getProjectName = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.projectName || 'Unbekanntes Projekt';
  }, [projects]);

  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Format date
  const formatDate = useCallback((timestamp: any) => {
    if (!timestamp) return 'Unbekannt';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zurück zum Dashboard</span>
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dokumentenverwaltung</h1>
              <p className="text-gray-600">Verwalten Sie Ihre Projektdokumente</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {onNavigateToProjectManagement && (
              <button
                onClick={onNavigateToProjectManagement}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Database className="w-5 h-5" />
                <span>Projektverwaltung</span>
              </button>
            )}
            
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Ordner erstellen</span>
            </button>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Dokumente hochladen</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <File className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Gesamt Dokumente</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Folder className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ordner</p>
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Projekte</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Mandant</p>
                <p className="text-2xl font-bold text-gray-900">{mandantId}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* No Projects Warning */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Keine Projekte gefunden</h3>
                <p className="text-yellow-700 mt-1">
                  Um Dokumente hochzuladen, müssen Sie zuerst ein Projekt erstellen.
                </p>
                <div className="mt-3">
                  <button
                    onClick={onNavigateToProjectManagement}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Database className="w-5 h-5" />
                    <span>Projekt erstellen</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter & Suche</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dateiname oder Tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projekt
              </label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Projekte</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordner
              </label>
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Ordner</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.name}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Tags filtern..."
                value={filterTags}
                onChange={(e) => setFilterTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Documents Grid/List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Dokumente ({filteredDocuments.length})
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <div className="w-5 h-5 flex flex-col space-y-0.5">
                    <div className="bg-current rounded-sm h-0.5"></div>
                    <div className="bg-current rounded-sm h-0.5"></div>
                    <div className="bg-current rounded-sm h-0.5"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Dokumente gefunden</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterProject || filterFolder || filterTags 
                    ? 'Versuchen Sie andere Filtereinstellungen'
                    : 'Laden Sie Ihr erstes Dokument hoch'
                  }
                </p>
                {!searchTerm && !filterProject && !filterFolder && !filterTags && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Dokument hochladen</span>
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((document, index) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <File className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {document.filename}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDownload(document)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Herunterladen"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id!)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span>{getProjectName(document.projectId)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4" />
                        <span>{document.folder}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {formatFileSize(document.size)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          v{document.version}
                        </span>
                      </div>
                    </div>
                    
                    {document.tags && document.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {document.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dokument
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projekt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Größe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hochgeladen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <File className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {document.filename}
                              </div>
                              <div className="text-sm text-gray-500">
                                {document.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getProjectName(document.projectId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {document.folder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(document.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            v{document.version}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(document.uploadedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDownload(document)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Herunterladen"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(document.id!)}
                              className="text-red-600 hover:text-red-900"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Dokumente hochladen</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* File Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dateien auswählen
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Dateien hierher ziehen oder klicken zum Auswählen
                      </p>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Ausgewählte Dateien ({selectedFiles.length}):
                      </p>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                            <span>{file.name}</span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projekt auswählen *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Projekt auswählen...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Folder Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordner auswählen *
                  </label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Ordner auswählen...</option>
                    {folders
                      .filter(folder => !selectedProject || folder.projectId === selectedProject)
                      .map(folder => (
                        <option key={folder.id} value={folder.name}>
                          {folder.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Tag1, Tag2, Tag3..."
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <span>Upload läuft...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isUploading}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || !selectedFiles.length || !selectedProject || !selectedFolder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Neuen Ordner erstellen</h3>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projekt auswählen *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Projekt auswählen...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordnername *
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Verträge, Pläne, Bilder..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateFolderModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName || !selectedProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ordner erstellen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagementPage; 