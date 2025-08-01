import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  StorageReference 
} from 'firebase/storage';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { storage, db } from '../lib/firebase';

// Document metadata interface
export interface DocumentMetadata {
  id?: string;
  filename: string;
  originalName: string;
  description?: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  storagePath: string;
  userId: string;
  projectId?: string;
  tenantId?: string;
  uploadedAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPublic?: boolean;
  downloadCount?: number;
  lastAccessed?: Date;
}

// Upload progress callback
export interface UploadProgress {
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

// Document service class for multi-tenant document management
export class DocumentService {
  private static instance: DocumentService;
  private readonly documentsCollection = 'documents';

  private constructor() {}

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  /**
   * Generates a secure storage path for documents
   * Format: documents/{userId}/{projectId?}/{timestamp}_{filename}
   */
  private generateStoragePath(
    userId: string, 
    filename: string, 
    projectId?: string
  ): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (projectId) {
      return `documents/${userId}/${projectId}/${timestamp}_${sanitizedFilename}`;
    }
    return `documents/${userId}/${timestamp}_${sanitizedFilename}`;
  }

  /**
   * Uploads a document to Firebase Storage and saves metadata to Firestore
   */
  async uploadDocument(
    file: File,
    userId: string,
    description?: string,
    projectId?: string,
    tags?: string[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentMetadata> {
    try {
      // Generate secure storage path
      const storagePath = this.generateStoragePath(userId, file.name, projectId);
      const storageRef = ref(storage, storagePath);

      // Upload file to Firebase Storage
      const uploadTask = uploadBytes(storageRef, file);
      
      // Monitor upload progress
      if (onProgress) {
        // Note: Firebase Storage doesn't provide progress callbacks in the current SDK
        // For real progress tracking, you'd need to use a custom upload implementation
        onProgress({ progress: 0, bytesTransferred: 0, totalBytes: file.size });
      }

      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create document metadata
      const documentMetadata: Omit<DocumentMetadata, 'id'> = {
        filename: file.name,
        originalName: file.name,
        description: description || '',
        fileType: file.type,
        fileSize: file.size,
        storageUrl: downloadURL,
        storagePath: storagePath,
        userId: userId,
        projectId: projectId,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        tags: tags || [],
        isPublic: false,
        downloadCount: 0
      };

      // Save metadata to Firestore
      const docRef = await addDoc(
        collection(db, this.documentsCollection),
        {
          ...documentMetadata,
          uploadedAt: Timestamp.fromDate(documentMetadata.uploadedAt),
          updatedAt: Timestamp.fromDate(documentMetadata.updatedAt)
        }
      );

      return {
        ...documentMetadata,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Fehler beim Hochladen des Dokuments');
    }
  }

  /**
   * Retrieves documents for a specific user with optional project filter
   */
  async getUserDocuments(
    userId: string,
    projectId?: string,
    limitCount: number = 50
  ): Promise<DocumentMetadata[]> {
    try {
      let q = query(
        collection(db, this.documentsCollection),
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc'),
        limit(limitCount)
      );

      // Add project filter if specified
      if (projectId) {
        q = query(
          collection(db, this.documentsCollection),
          where('userId', '==', userId),
          where('projectId', '==', projectId),
          orderBy('uploadedAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const documents: DocumentMetadata[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          filename: data.filename,
          originalName: data.originalName,
          description: data.description,
          fileType: data.fileType,
          fileSize: data.fileSize,
          storageUrl: data.storageUrl,
          storagePath: data.storagePath,
          userId: data.userId,
          projectId: data.projectId,
          tenantId: data.tenantId,
          uploadedAt: data.uploadedAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          tags: data.tags || [],
          isPublic: data.isPublic || false,
          downloadCount: data.downloadCount || 0,
          lastAccessed: data.lastAccessed?.toDate()
        });
      });

      return documents;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw new Error('Fehler beim Abrufen der Dokumente');
    }
  }

  /**
   * Gets a single document by ID (with user permission check)
   */
  async getDocument(documentId: string, userId: string): Promise<DocumentMetadata | null> {
    try {
      const docRef = doc(db, this.documentsCollection, documentId);
      const docSnap = await getDocs(query(
        collection(db, this.documentsCollection),
        where('__name__', '==', documentId),
        where('userId', '==', userId)
      ));

      if (docSnap.empty) {
        return null;
      }

      const documentData = docSnap.docs[0].data();
      return {
        id: docSnap.docs[0].id,
        filename: documentData.filename,
        originalName: documentData.originalName,
        description: documentData.description,
        fileType: documentData.fileType,
        fileSize: documentData.fileSize,
        storageUrl: documentData.storageUrl,
        storagePath: documentData.storagePath,
        userId: documentData.userId,
        projectId: documentData.projectId,
        tenantId: documentData.tenantId,
        uploadedAt: documentData.uploadedAt.toDate(),
        updatedAt: documentData.updatedAt.toDate(),
        tags: documentData.tags || [],
        isPublic: documentData.isPublic || false,
        downloadCount: documentData.downloadCount || 0,
        lastAccessed: documentData.lastAccessed?.toDate()
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Fehler beim Abrufen des Dokuments');
    }
  }

  /**
   * Updates document metadata
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updates: Partial<Pick<DocumentMetadata, 'description' | 'tags' | 'isPublic'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.documentsCollection, documentId);
      
      // Verify ownership before updating
      const document = await this.getDocument(documentId, userId);
      if (!document) {
        throw new Error('Dokument nicht gefunden oder keine Berechtigung');
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Fehler beim Aktualisieren des Dokuments');
    }
  }

  /**
   * Deletes a document and its file from storage
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      // Get document metadata first
      const document = await this.getDocument(documentId, userId);
      if (!document) {
        throw new Error('Dokument nicht gefunden oder keine Berechtigung');
      }

      // Delete file from Storage
      const storageRef = ref(storage, document.storagePath);
      await deleteObject(storageRef);

      // Delete metadata from Firestore
      const docRef = doc(db, this.documentsCollection, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Fehler beim Löschen des Dokuments');
    }
  }

  /**
   * Increments download count and updates last accessed
   */
  async recordDownload(documentId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.documentsCollection, documentId);
      
      // Verify ownership
      const document = await this.getDocument(documentId, userId);
      if (!document) {
        throw new Error('Dokument nicht gefunden oder keine Berechtigung');
      }

      await updateDoc(docRef, {
        downloadCount: (document.downloadCount || 0) + 1,
        lastAccessed: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error recording download:', error);
      // Don't throw error for download tracking
    }
  }

  /**
   * Searches documents by filename, description, or tags
   */
  async searchDocuments(
    userId: string,
    searchTerm: string,
    projectId?: string
  ): Promise<DocumentMetadata[]> {
    try {
      // Get all user documents and filter client-side for search
      // In production, you might want to use Algolia or similar for better search
      const documents = await this.getUserDocuments(userId, projectId, 1000);
      
      const searchLower = searchTerm.toLowerCase();
      return documents.filter(doc => 
        doc.filename.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Fehler bei der Dokumentsuche');
    }
  }

  /**
   * Gets document statistics for a user
   */
  async getUserDocumentStats(userId: string): Promise<{
    totalDocuments: number;
    totalSize: number;
    documentsByType: Record<string, number>;
    recentUploads: number;
  }> {
    try {
      const documents = await this.getUserDocuments(userId, undefined, 1000);
      
      const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
      const documentsByType = documents.reduce((acc, doc) => {
        const type = doc.fileType.split('/')[0] || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUploads = documents.filter(doc => 
        doc.uploadedAt > thirtyDaysAgo
      ).length;

      return {
        totalDocuments: documents.length,
        totalSize,
        documentsByType,
        recentUploads
      };
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error('Fehler beim Abrufen der Dokumentenstatistiken');
    }
  }
}

export default DocumentService.getInstance(); 