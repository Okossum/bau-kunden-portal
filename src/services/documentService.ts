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
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  StorageReference
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// Interfaces
export interface Document {
  id?: string;
  projectId: string;
  folder: string;
  filename: string;
  originalFilename: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  mandantId: string;
  version: number;
  type: string;
  size: number;
  tags?: string[];
  meta?: Record<string, any>;
}

export interface DocumentUpload {
  file: File;
  projectId: string;
  folder: string;
  tags?: string[];
  meta?: Record<string, any>;
}

export interface DocumentFolder {
  id: string;
  name: string;
  projectId: string;
  mandantId: string;
  createdAt: Timestamp;
  createdBy: string;
}

export class DocumentService {
  private static readonly COLLECTION_NAME = 'documents';
  private static readonly FOLDERS_COLLECTION = 'documentFolders';

  /**
   * Upload a document to Firebase Storage and create a document record
   */
  static async uploadDocument(
    upload: DocumentUpload, 
    mandantId: string, 
    uploadedBy: string
  ): Promise<Document> {
    try {
      // Check if file with same name exists in the same folder
      const existingDoc = await this.getDocumentByFilename(
        upload.projectId, 
        upload.folder, 
        upload.file.name
      );

      const version = existingDoc ? existingDoc.version + 1 : 1;
      
      // Create storage path
      const storagePath = `mandanten/${mandantId}/projekte/${upload.projectId}/${upload.folder}/${upload.file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, upload.file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Create document record in Firestore
      const documentData: Omit<Document, 'id'> = {
        projectId: upload.projectId,
        folder: upload.folder,
        filename: upload.file.name,
        originalFilename: upload.file.name,
        downloadUrl,
        uploadedBy,
        uploadedAt: serverTimestamp() as Timestamp,
        mandantId,
        version,
        type: upload.file.type,
        size: upload.file.size,
        tags: upload.tags || [],
        meta: upload.meta || {}
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), documentData);
      
      return {
        id: docRef.id,
        ...documentData
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Fehler beim Hochladen des Dokuments');
    }
  }

  /**
   * Get documents for a specific project and mandant
   */
  static async getDocumentsByProject(
    projectId: string, 
    mandantId: string
  ): Promise<Document[]> {
    try {
      // Temporäre Lösung ohne Index - nur nach projectId und mandantId filtern
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('projectId', '==', projectId),
        where('mandantId', '==', mandantId)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      // Manuell nach uploadedAt sortieren
      return documents.sort((a, b) => {
        const dateA = a.uploadedAt instanceof Timestamp ? a.uploadedAt.toDate() : new Date(a.uploadedAt);
        const dateB = b.uploadedAt instanceof Timestamp ? b.uploadedAt.toDate() : new Date(b.uploadedAt);
        return dateB.getTime() - dateA.getTime(); // Descending
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Fehler beim Abrufen der Dokumente');
    }
  }

  /**
   * Get documents by mandant (for admin view)
   */
  static async getDocumentsByMandant(mandantId: string): Promise<Document[]> {
    try {
      // Temporäre Lösung ohne Index - nur nach mandantId filtern
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('mandantId', '==', mandantId)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      // Manuell nach uploadedAt sortieren
      return documents.sort((a, b) => {
        const dateA = a.uploadedAt instanceof Timestamp ? a.uploadedAt.toDate() : new Date(a.uploadedAt);
        const dateB = b.uploadedAt instanceof Timestamp ? b.uploadedAt.toDate() : new Date(b.uploadedAt);
        return dateB.getTime() - dateA.getTime(); // Descending
      });
    } catch (error) {
      console.error('Error fetching documents by mandant:', error);
      throw new Error('Fehler beim Abrufen der Dokumente');
    }
  }

  /**
   * Get document by filename in specific folder
   */
  static async getDocumentByFilename(
    projectId: string, 
    folder: string, 
    filename: string
  ): Promise<Document | null> {
    try {
      // Temporäre Lösung ohne Index - nur nach Feldern filtern
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('projectId', '==', projectId),
        where('folder', '==', folder),
        where('filename', '==', filename)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      // Manuell nach version und uploadedAt sortieren
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      const sortedDocs = documents.sort((a, b) => {
        // Erst nach Version sortieren
        if (a.version !== b.version) {
          return b.version - a.version; // Descending
        }
        // Dann nach uploadedAt
        const dateA = a.uploadedAt instanceof Timestamp ? a.uploadedAt.toDate() : new Date(a.uploadedAt);
        const dateB = b.uploadedAt instanceof Timestamp ? b.uploadedAt.toDate() : new Date(b.uploadedAt);
        return dateB.getTime() - dateA.getTime(); // Descending
      });
      
      return sortedDocs[0];
    } catch (error) {
      console.error('Error fetching document by filename:', error);
      return null;
    }
  }

  /**
   * Get document versions
   */
  static async getDocumentVersions(
    projectId: string, 
    folder: string, 
    filename: string
  ): Promise<Document[]> {
    try {
      // Temporäre Lösung ohne Index - nur nach Feldern filtern
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('projectId', '==', projectId),
        where('folder', '==', folder),
        where('filename', '==', filename)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      // Manuell nach version sortieren
      return documents.sort((a, b) => b.version - a.version); // Descending
    } catch (error) {
      console.error('Error fetching document versions:', error);
      throw new Error('Fehler beim Abrufen der Dokumentversionen');
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Dokument nicht gefunden');
      }

      const documentData = docSnap.data() as Document;
      
      // Delete from Firebase Storage
      const storageRef = ref(storage, documentData.downloadUrl);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Fehler beim Löschen des Dokuments');
    }
  }

  /**
   * Create a new folder
   */
  static async createFolder(
    name: string, 
    projectId: string, 
    mandantId: string, 
    createdBy: string
  ): Promise<DocumentFolder> {
    try {
      const folderData: Omit<DocumentFolder, 'id'> = {
        name,
        projectId,
        mandantId,
        createdAt: serverTimestamp() as Timestamp,
        createdBy
      };

      const docRef = await addDoc(collection(db, this.FOLDERS_COLLECTION), folderData);
      
      return {
        id: docRef.id,
        ...folderData
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Fehler beim Erstellen des Ordners');
    }
  }

  /**
   * Get folders for a project
   */
  static async getFoldersByProject(
    projectId: string, 
    mandantId: string
  ): Promise<DocumentFolder[]> {
    try {
      const q = query(
        collection(db, this.FOLDERS_COLLECTION),
        where('projectId', '==', projectId),
        where('mandantId', '==', mandantId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DocumentFolder[];
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Fehler beim Abrufen der Ordner');
    }
  }

  /**
   * Search documents
   */
  static async searchDocuments(
    mandantId: string,
    searchTerm?: string,
    projectId?: string,
    folder?: string,
    tags?: string[]
  ): Promise<Document[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('mandantId', '==', mandantId)
      );

      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }

      if (folder) {
        q = query(q, where('folder', '==', folder));
      }

      q = query(q, orderBy('uploadedAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];

      // Filter by search term and tags
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        documents = documents.filter(doc => 
          doc.filename.toLowerCase().includes(term) ||
          doc.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      }

      if (tags && tags.length > 0) {
        documents = documents.filter(doc => 
          doc.tags?.some(tag => tags.includes(tag))
        );
      }

      return documents;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Fehler bei der Dokumentsuche');
    }
  }

  /**
   * Get document statistics
   */
  static async getDocumentStats(mandantId: string): Promise<{
    totalDocuments: number;
    totalSize: number;
    documentsByType: Record<string, number>;
  }> {
    try {
      const documents = await this.getDocumentsByMandant(mandantId);
      
      const totalDocuments = documents.length;
      const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
      
      const documentsByType: Record<string, number> = {};
      documents.forEach(doc => {
        const type = doc.type || 'unknown';
        documentsByType[type] = (documentsByType[type] || 0) + 1;
      });

      return {
        totalDocuments,
        totalSize,
        documentsByType
      };
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error('Fehler beim Abrufen der Dokumentstatistiken');
    }
  }
} 