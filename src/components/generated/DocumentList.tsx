import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  File, 
  Download, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  Calendar,
  Tag,
  Eye,
  MoreVertical,
  FileText,
  Image,
  Archive,
  Video,
  Music
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DocumentService, { DocumentMetadata } from '../../services/documentService';

interface DocumentListProps {
  userId: string;
  projectId?: string;
  onDocumentSelect?: (document: DocumentMetadata) => void;
  onDocumentDelete?: (documentId: string) => void;
  onDocumentEdit?: (document: DocumentMetadata) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  userId,
  projectId,
  onDocumentSelect,
  onDocumentDelete,
  onDocumentEdit
}) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'filename' | 'fileSize'>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, [userId, projectId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await DocumentService.getUserDocuments(userId, projectId);
      setDocuments(docs);
    } catch (err) {
      setError('Fehler beim Laden der Dokumente');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search documents
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadDocuments();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await DocumentService.searchDocuments(userId, searchTerm, projectId);
      setDocuments(searchResults);
    } catch (err) {
      setError('Fehler bei der Suche');
      console.error('Error searching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      if (filterType === 'all') return true;
      if (filterType === 'images') return doc.fileType.startsWith('image/');
      if (filterType === 'documents') return doc.fileType.startsWith('application/');
      if (filterType === 'videos') return doc.fileType.startsWith('video/');
      if (filterType === 'audio') return doc.fileType.startsWith('audio/');
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'filename':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'uploadedAt':
        default:
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle document download
  const handleDownload = async (document: DocumentMetadata) => {
    try {
      // Record download
      if (document.id) {
        await DocumentService.recordDownload(document.id, userId);
      }
      
      // Create download link
      const link = window.document.createElement('a');
      link.href = document.storageUrl;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  // Handle document delete
  const handleDelete = async (documentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      return;
    }

    try {
      await DocumentService.deleteDocument(documentId, userId);
      setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      onDocumentDelete?.(documentId);
    } catch (err) {
      setError('Fehler beim Löschen des Dokuments');
      console.error('Error deleting document:', err);
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Dokumente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadDocuments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Dokumente durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle Dateien</option>
            <option value="images">Bilder</option>
            <option value="documents">Dokumente</option>
            <option value="videos">Videos</option>
            <option value="audio">Audio</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="uploadedAt-desc">Neueste zuerst</option>
            <option value="uploadedAt-asc">Älteste zuerst</option>
            <option value="filename-asc">Name A-Z</option>
            <option value="filename-desc">Name Z-A</option>
            <option value="fileSize-desc">Größe absteigend</option>
            <option value="fileSize-asc">Größe aufsteigend</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">
              {searchTerm ? 'Keine Dokumente gefunden.' : 'Noch keine Dokumente vorhanden.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAndSortedDocuments.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  {/* Document Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {getFileIcon(document.fileType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 truncate">
                        {document.filename}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(document.uploadedAt)}
                        </span>
                        {document.downloadCount && document.downloadCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{document.downloadCount} Downloads</span>
                          </>
                        )}
                      </div>
                      {document.description && (
                        <p className="text-xs text-slate-600 mt-1 truncate">
                          {document.description}
                        </p>
                      )}
                      {document.tags && document.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {document.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {document.tags.length > 3 && (
                            <span className="text-xs text-slate-400">
                              +{document.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Herunterladen"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {onDocumentEdit && (
                      <button
                        onClick={() => onDocumentEdit(document)}
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(document.id!)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Document Count */}
      <div className="text-center text-sm text-slate-500">
        {filteredAndSortedDocuments.length} von {documents.length} Dokumenten
      </div>
    </div>
  );
};

export default DocumentList; 