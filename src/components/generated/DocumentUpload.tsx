import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, File, AlertCircle, CheckCircle, Loader2, Folder } from 'lucide-react';
import { cn } from '../../lib/utils';
import DocumentService, { DocumentMetadata, UploadProgress } from '../../services/documentService';

interface DocumentUploadProps {
  userId: string;
  projectId?: string;
  onUploadComplete: (document: DocumentMetadata) => void;
  onError: (error: string) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

// Document categories/folders
const DOCUMENT_CATEGORIES = {
  'pläne': ['pdf', 'dwg', 'dxf', 'rvt', 'skp'],
  'verträge': ['pdf', 'doc', 'docx'],
  'genehmigungen': ['pdf', 'jpg', 'jpeg', 'png'],
  'bilder': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg']
};

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  userId,
  projectId,
  onUploadComplete,
  onError,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  allowedFileTypes = ['*/*'] // All file types by default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  // Get suggested folder based on file type
  const getSuggestedFolder = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    for (const [category, extensions] of Object.entries(DOCUMENT_CATEGORIES)) {
      if (extensions.includes(extension)) {
        return category;
      }
    }
    
    return '';
  };

  // File validation
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `Datei ist zu groß. Maximale Größe: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    if (allowedFileTypes.length > 0 && !allowedFileTypes.includes('*/*')) {
      const isValidType = allowedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isValidType) {
        return `Dateityp nicht erlaubt. Erlaubte Typen: ${allowedFileTypes.join(', ')}`;
      }
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(null);
    
    // Auto-suggest folder based on file type
    const suggestedFolder = getSuggestedFolder(file.name);
    setSelectedFolder(suggestedFolder);
  }, [maxFileSize, allowedFileTypes, onError]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress({ progress: 0, bytesTransferred: 0, totalBytes: selectedFile.size });

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const document = await DocumentService.uploadDocument(
        selectedFile,
        userId,
        description,
        projectId,
        tagsArray,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      onUploadComplete(document);
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      setTags('');
      setSelectedFolder('');
      setUploadProgress(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Fehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setSelectedFolder('');
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Drag & Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-slate-300 hover:border-slate-400",
            uploading && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileInputChange}
            accept={allowedFileTypes.join(',')}
            disabled={uploading}
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-slate-400" />
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Datei hierher ziehen oder klicken zum Auswählen
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Maximale Dateigröße: {formatFileSize(maxFileSize)}
                </p>
              </div>
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Datei auswählen
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <File className="w-12 h-12 mx-auto text-blue-500" />
              <div>
                <p className="text-lg font-medium text-slate-700">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="inline-flex items-center px-3 py-1 text-red-600 hover:text-red-700 transition-colors"
                disabled={uploading}
              >
                <X className="w-4 h-4 mr-1" />
                Entfernen
              </button>
            </div>
          )}
        </div>

        {/* File Details Form */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-800">Dokument-Details</h3>
            
            {/* Folder Selection */}
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-slate-700 mb-2">
                Ordner zuweisen <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(DOCUMENT_CATEGORIES).map(([category, extensions]) => {
                  const isSelected = selectedFolder === category;
                  const isSuggested = getSuggestedFolder(selectedFile.name) === category;
                  
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedFolder(isSelected ? '' : category)}
                      className={cn(
                        "p-3 border rounded-lg text-center transition-all duration-200",
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-300 hover:border-slate-400 hover:bg-slate-50",
                        isSuggested && !isSelected && "border-orange-300 bg-orange-50"
                      )}
                      disabled={uploading}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Folder className={cn(
                          "w-5 h-5",
                          isSelected ? "text-blue-600" : "text-slate-600"
                        )} />
                      </div>
                      <div className="text-xs font-medium">
                        {category === 'pläne' ? 'Pläne' :
                         category === 'verträge' ? 'Verträge' :
                         category === 'genehmigungen' ? 'Genehmigungen' : 'Bilder'}
                      </div>
                      {isSuggested && !isSelected && (
                        <div className="text-xs text-orange-600 mt-1">Vorgeschlagen</div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedFolder && (
                <p className="text-xs text-slate-500 mt-2">
                  Unterstützte Dateitypen: {DOCUMENT_CATEGORIES[selectedFolder as keyof typeof DOCUMENT_CATEGORIES]?.join(', ').toUpperCase()}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Beschreibung (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung des Dokuments..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={uploading}
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tag1, Tag2, Tag3..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Tags durch Kommas getrennt eingeben
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Hochladen...</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFolder}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                uploading || !selectedFolder
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Hochladen...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Dokument hochladen</span>
                </>
              )}
            </button>

            {/* Validation Message */}
            {!selectedFolder && selectedFile && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Bitte wählen Sie einen Ordner für das Dokument aus.</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentUpload; 