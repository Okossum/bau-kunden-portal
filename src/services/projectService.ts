import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';

export interface ProjectAddress {
  street: string;
  zipCode: string;
  city: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Client {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Project {
  id?: string;
  projectName: string;
  projectId: string; // Unique project identifier
  constructionTypes: string[]; // Multiple selection
  status: 'geplant' | 'in Bau' | 'abgeschlossen' | 'pausiert' | 'storniert';
  description?: string;
  tenantId: string; // Mandantenfähigkeit
  clientId: string; // Reference to client
  address: ProjectAddress;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualEndDate?: Date;
  client: Client;
  responsibleUserId: string; // Internal project manager
  notes?: string;
  attachments?: string[]; // Firebase Storage URLs
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ProjectFormData {
  projectName: string;
  projectId: string;
  constructionTypes: string[];
  status: 'geplant' | 'in Bau' | 'abgeschlossen' | 'pausiert' | 'storniert';
  description: string;
  clientId: string;
  address: ProjectAddress;
  plannedStartDate: string; // ISO date string for form
  plannedEndDate: string;
  actualEndDate: string;
  client: Client;
  responsibleUserId: string;
  notes: string;
}

class ProjectService {
  private projectsCollection = 'projekte';

  /**
   * Get all projects for a specific tenant
   */
  async getProjectsByTenant(tenantId: string): Promise<Project[]> {
    try {
      console.log('ProjectService: Fetching projects for tenantId:', tenantId);
      console.log('ProjectService: Collection name:', this.projectsCollection);
      
      // First, let's get ALL projects to see what's in the database
      console.log('ProjectService: Getting ALL projects first to debug...');
      const allProjectsQuery = query(collection(db, this.projectsCollection));
      const allProjectsSnapshot = await getDocs(allProjectsQuery);
      console.log('ProjectService: Total projects in database:', allProjectsSnapshot.size);
      
      allProjectsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('ProjectService: All projects - Document ID:', doc.id, 'tenantId:', data.tenantId, 'projectName:', data.projectName);
      });
      
      // Now get projects for specific tenant
      const q = query(
        collection(db, this.projectsCollection),
        where('tenantId', '==', tenantId)
        // Temporarily removed orderBy to test if that's causing the issue
        // orderBy('createdAt', 'desc')
      );

      console.log('ProjectService: Executing query for tenantId:', tenantId);
      const querySnapshot = await getDocs(q);
      console.log('ProjectService: Query result - documents found:', querySnapshot.size);
      
      // Debug: Log all documents to see what's in the collection
      console.log('ProjectService: All documents in collection:');
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Document ID:', doc.id, 'Data:', data);
      });
      
      const projects: Project[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        console.log('ProjectService: Processing document:', doc.id, data);
        
        try {
          projects.push({
            id: doc.id,
            projectName: data.projectName,
            projectId: data.projectId,
            constructionTypes: data.constructionTypes || [],
            status: data.status,
            description: data.description,
            tenantId: data.tenantId,
            clientId: data.clientId,
            address: data.address,
            plannedStartDate: data.plannedStartDate.toDate(),
            plannedEndDate: data.plannedEndDate.toDate(),
            actualEndDate: data.actualEndDate?.toDate(),
            client: data.client,
            responsibleUserId: data.responsibleUserId,
            notes: data.notes,
            attachments: data.attachments || [],
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            createdBy: data.createdBy,
            updatedBy: data.updatedBy
          });
        } catch (error) {
          console.error('ProjectService: Error processing document:', doc.id, error);
        }
      });

      console.log('ProjectService: Returning projects:', projects);
      
      // If no projects found for tenant, try to get all projects (fallback)
      if (projects.length === 0) {
        console.log('ProjectService: No projects found for tenant, trying to get all projects...');
        const allProjects = await this.getAllProjects();
        console.log('ProjectService: All projects found:', allProjects.length);
        return allProjects;
      }
      
      return projects;
    } catch (error) {
      console.error('ProjectService: Error fetching projects:', error);
      throw new Error('Fehler beim Abrufen der Projekte');
    }
  }

  /**
   * Get all projects (without tenant filter)
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      console.log('ProjectService: Getting all projects...');
      
      const q = query(collection(db, this.projectsCollection));
      const querySnapshot = await getDocs(q);
      
      const projects: Project[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        try {
          projects.push({
            id: doc.id,
            projectName: data.projectName,
            projectId: data.projectId,
            constructionTypes: data.constructionTypes || [],
            status: data.status,
            description: data.description,
            tenantId: data.tenantId || 'default-tenant',
            clientId: data.clientId,
            address: data.address,
            plannedStartDate: data.plannedStartDate?.toDate() || new Date(),
            plannedEndDate: data.plannedEndDate?.toDate() || new Date(),
            actualEndDate: data.actualEndDate?.toDate(),
            client: data.client,
            responsibleUserId: data.responsibleUserId,
            notes: data.notes,
            attachments: data.attachments || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdBy: data.createdBy || 'unknown',
            updatedBy: data.updatedBy || 'unknown'
          });
        } catch (error) {
          console.error('ProjectService: Error processing document:', doc.id, error);
        }
      });
      
      console.log('ProjectService: Returning all projects:', projects.length);
      return projects;
    } catch (error) {
      console.error('ProjectService: Error fetching all projects:', error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const docRef = doc(db, this.projectsCollection, projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          projectName: data.projectName,
          projectId: data.projectId,
          constructionTypes: data.constructionTypes || [],
          status: data.status,
          description: data.description,
          tenantId: data.tenantId,
          clientId: data.clientId,
          address: data.address,
          plannedStartDate: data.plannedStartDate.toDate(),
          plannedEndDate: data.plannedEndDate.toDate(),
          actualEndDate: data.actualEndDate?.toDate(),
          client: data.client,
          responsibleUserId: data.responsibleUserId,
          notes: data.notes,
          attachments: data.attachments || [],
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Fehler beim Abrufen des Projekts');
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    try {
      const now = new Date();
      
      console.log('Creating project with data:', projectData);
      console.log('TenantId:', projectData.tenantId);
      
      // Filter out undefined values from projectData
      const filteredProjectData = Object.fromEntries(
        Object.entries(projectData).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Filtered project data:', filteredProjectData);
      
      const projectDoc = {
        ...filteredProjectData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        createdBy: projectData.tenantId, // Using tenantId as createdBy for now
        updatedBy: projectData.tenantId
      };

      console.log('Final project document:', projectDoc);

      const docRef = await addDoc(collection(db, this.projectsCollection), projectDoc);
      console.log('Project created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Fehler beim Erstellen des Projekts');
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, projectData: Partial<Project>, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.projectsCollection, projectId);
      
      // Filter out undefined values from projectData
      const filteredProjectData = Object.fromEntries(
        Object.entries(projectData).filter(([_, value]) => value !== undefined)
      );
      
      const updateData = {
        ...filteredProjectData,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Fehler beim Aktualisieren des Projekts');
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, this.projectsCollection, projectId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Fehler beim Löschen des Projekts');
    }
  }

  /**
   * Check if project ID is unique within tenant
   */
  async isProjectIdUnique(projectId: string, tenantId: string, excludeProjectId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.projectsCollection),
        where('tenantId', '==', tenantId),
        where('projectId', '==', projectId)
      );

      const querySnapshot = await getDocs(q);
      
      if (excludeProjectId) {
        // For updates, exclude the current project
        return querySnapshot.empty || 
               querySnapshot.docs.every(doc => doc.id === excludeProjectId);
      }
      
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking project ID uniqueness:', error);
      throw new Error('Fehler beim Prüfen der Projekt-ID');
    }
  }

  /**
   * Search projects by name or description
   */
  async searchProjects(tenantId: string, searchTerm: string): Promise<Project[]> {
    try {
      const projects = await this.getProjectsByTenant(tenantId);
      
      if (!searchTerm.trim()) {
        return projects;
      }

      const lowerSearchTerm = searchTerm.toLowerCase();
      return projects.filter(project => 
        project.projectName.toLowerCase().includes(lowerSearchTerm) ||
        project.projectId.toLowerCase().includes(lowerSearchTerm) ||
        project.description?.toLowerCase().includes(lowerSearchTerm) ||
        project.client.name.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching projects:', error);
      throw new Error('Fehler bei der Projektsuche');
    }
  }

  /**
   * Create test data for development purposes
   * Creates 15 test projects using existing user data
   */
  async createTestData(): Promise<void> {
    try {
      console.log('🚀 Starting project test data creation...');
      
      // Get existing users to use as clients and responsible users
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      console.log('Found users for test data:', users.length);
      
      // Filter users by role
      const privateCustomers = users.filter(user => user.role === 'customer' && !user.companyName);
      const businessCustomers = users.filter(user => user.role === 'customer' && user.companyName);
      const employees = users.filter(user => user.role === 'employee');
      
      console.log('Private customers:', privateCustomers.length);
      console.log('Business customers:', businessCustomers.length);
      console.log('Employees:', employees.length);
      
      // Get current user's tenantId from auth context
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      // Try to get tenantId from user data first, then fallback to uid
      let tenantId = 'default-tenant';
      if (currentUser) {
        // Get user document to find tenantId
        const userQuery = query(collection(db, 'users'), where('authUid', '==', currentUser.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          tenantId = userData.tenantId || currentUser.uid;
          console.log('Found user document, using tenantId:', tenantId);
        } else {
          // If no user document found, try to find admin user by displayName
          const adminQuery = query(collection(db, 'users'), where('displayName', '==', 'Administrator'));
          const adminSnapshot = await getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            tenantId = adminData.tenantId || 'mathi-hoffer';
            console.log('Found admin user, using tenantId:', tenantId);
          } else {
            tenantId = 'mathi-hoffer'; // Fallback to known tenantId
            console.log('No user found, using fallback tenantId:', tenantId);
          }
        }
      }
      console.log('Final tenantId for test data:', tenantId);
      
      const testProjects = [
        // Private Customer Projects
        {
          projectName: 'Hausbau Familie Meyer',
          projectId: 'PRIV-001',
          constructionTypes: ['Neubau'],
          status: 'in Bau' as const,
          description: 'Einfamilienhaus mit 4 Zimmern und Garten',
          clientId: privateCustomers[0]?.id || 'test-client-1',
          address: {
            street: 'Musterstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-01-15'),
          plannedEndDate: new Date('2024-12-15'),
          client: {
            name: privateCustomers[0]?.firstName + ' ' + privateCustomers[0]?.lastName || 'Erika Meyer',
            contactPerson: privateCustomers[0]?.firstName + ' ' + privateCustomers[0]?.lastName || 'Erika Meyer',
            phone: privateCustomers[0]?.phoneLandline || '089-666666',
            email: privateCustomers[0]?.email || 'erika.meyer@privat.de'
          },
          responsibleUserId: employees[0]?.id || 'test-employee-1',
          notes: 'Kunde wünscht energieeffizientes Haus mit Solaranlage',
          tenantId: tenantId
        },
        {
          projectName: 'Wohnungsrenovierung Schulz',
          projectId: 'PRIV-002',
          constructionTypes: ['Sanierung'],
          status: 'geplant' as const,
          description: 'Komplette Renovierung einer 3-Zimmer-Wohnung',
          clientId: privateCustomers[1]?.id || 'test-client-2',
          address: {
            street: 'Hausweg',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-03-01'),
          plannedEndDate: new Date('2024-06-30'),
          client: {
            name: privateCustomers[1]?.firstName + ' ' + privateCustomers[1]?.lastName || 'Wolfgang Schulz',
            contactPerson: privateCustomers[1]?.firstName + ' ' + privateCustomers[1]?.lastName || 'Wolfgang Schulz',
            phone: privateCustomers[1]?.phoneLandline || '089-777777',
            email: privateCustomers[1]?.email || 'wolfgang.schulz@privat.de'
          },
          responsibleUserId: employees[1]?.id || 'test-employee-2',
          notes: 'Badezimmer und Küche komplett neu',
          tenantId: tenantId
        },
        {
          projectName: 'Gartenhaus Hoffmann',
          projectId: 'PRIV-003',
          constructionTypes: ['Neubau'],
          status: 'abgeschlossen' as const,
          description: 'Gartenhaus mit Terrasse und Carport',
          clientId: privateCustomers[2]?.id || 'test-client-3',
          address: {
            street: 'Wohnstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2023-05-01'),
          plannedEndDate: new Date('2023-08-31'),
          actualEndDate: new Date('2023-08-15'),
          client: {
            name: privateCustomers[2]?.firstName + ' ' + privateCustomers[2]?.lastName || 'Gertrud Hoffmann',
            contactPerson: privateCustomers[2]?.firstName + ' ' + privateCustomers[2]?.lastName || 'Gertrud Hoffmann',
            phone: privateCustomers[2]?.phoneLandline || '089-888888',
            email: privateCustomers[2]?.email || 'gertrud.hoffmann@privat.de'
          },
          responsibleUserId: employees[2]?.id || 'test-employee-3',
          notes: 'Projekt erfolgreich abgeschlossen, Kunde sehr zufrieden',
          tenantId: tenantId
        },
        {
          projectName: 'Kellerausbau Koch',
          projectId: 'PRIV-004',
          constructionTypes: ['Trockenbau'],
          status: 'pausiert' as const,
          description: 'Ausbau des Kellers zu Wohnraum',
          clientId: privateCustomers[3]?.id || 'test-client-4',
          address: {
            street: 'Familienweg',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-02-01'),
          plannedEndDate: new Date('2024-05-31'),
          client: {
            name: privateCustomers[3]?.firstName + ' ' + privateCustomers[3]?.lastName || 'Dieter Koch',
            contactPerson: privateCustomers[3]?.firstName + ' ' + privateCustomers[3]?.lastName || 'Dieter Koch',
            phone: privateCustomers[3]?.phoneLandline || '089-999999',
            email: privateCustomers[3]?.email || 'dieter.koch@privat.de'
          },
          responsibleUserId: employees[3]?.id || 'test-employee-4',
          notes: 'Projekt pausiert wegen fehlender Baugenehmigung',
          tenantId: tenantId
        },
        {
          projectName: 'Dachbodenausbau Richter',
          projectId: 'PRIV-005',
          constructionTypes: ['Sanierung'],
          status: 'geplant' as const,
          description: 'Ausbau des Dachbodens zu 2 zusätzlichen Zimmern',
          clientId: privateCustomers[4]?.id || 'test-client-5',
          address: {
            street: 'Privatplatz',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-04-01'),
          plannedEndDate: new Date('2024-07-31'),
          client: {
            name: privateCustomers[4]?.firstName + ' ' + privateCustomers[4]?.lastName || 'Helga Richter',
            contactPerson: privateCustomers[4]?.firstName + ' ' + privateCustomers[4]?.lastName || 'Helga Richter',
            phone: privateCustomers[4]?.phoneLandline || '089-000000',
            email: privateCustomers[4]?.email || 'helga.richter@privat.de'
          },
          responsibleUserId: employees[4]?.id || 'test-employee-5',
          notes: 'Dachstuhl muss verstärkt werden',
          tenantId: tenantId
        },
        
        // Business Customer Projects
        {
          projectName: 'Bürogebäude Wagner GmbH',
          projectId: 'BUS-001',
          constructionTypes: ['Neubau'],
          status: 'in Bau' as const,
          description: '4-stöckiges Bürogebäude mit 20 Büros und Konferenzräumen',
          clientId: businessCustomers[0]?.id || 'test-business-1',
          address: {
            street: 'Geschäftsstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2023-09-01'),
          plannedEndDate: new Date('2024-12-31'),
          client: {
            name: businessCustomers[0]?.companyName || 'Wagner & Co. GmbH',
            contactPerson: businessCustomers[0]?.firstName + ' ' + businessCustomers[0]?.lastName || 'Dr. Franz Wagner',
            phone: businessCustomers[0]?.phoneLandline || '089-1111111',
            email: businessCustomers[0]?.email || 'franz.wagner@firma1.de'
          },
          responsibleUserId: employees[0]?.id || 'test-employee-1',
          notes: 'Hochmodernes Gebäude mit nachhaltiger Bauweise',
          tenantId: tenantId
        },
        {
          projectName: 'Produktionshalle Becker Industries',
          projectId: 'BUS-002',
          constructionTypes: ['Neubau'],
          status: 'geplant' as const,
          description: 'Neue Produktionshalle mit 2000m² Fläche',
          clientId: businessCustomers[1]?.id || 'test-business-2',
          address: {
            street: 'Industrieweg',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-06-01'),
          plannedEndDate: new Date('2025-03-31'),
          client: {
            name: businessCustomers[1]?.companyName || 'Becker Industries AG',
            contactPerson: businessCustomers[1]?.firstName + ' ' + businessCustomers[1]?.lastName || 'Dr. Petra Becker',
            phone: businessCustomers[1]?.phoneLandline || '089-2222222',
            email: businessCustomers[1]?.email || 'petra.becker@firma2.de'
          },
          responsibleUserId: employees[1]?.id || 'test-employee-2',
          notes: 'Spezielle Anforderungen für Maschinenfundamente',
          tenantId: tenantId
        },
        {
          projectName: 'Technologiezentrum Hoffmann',
          projectId: 'BUS-003',
          constructionTypes: ['Neubau'],
          status: 'abgeschlossen' as const,
          description: 'Innovationszentrum mit Laboren und Büros',
          clientId: businessCustomers[2]?.id || 'test-business-3',
          address: {
            street: 'Technologiepark',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2022-03-01'),
          plannedEndDate: new Date('2023-11-30'),
          actualEndDate: new Date('2023-10-15'),
          client: {
            name: businessCustomers[2]?.companyName || 'Hoffmann Technologies',
            contactPerson: businessCustomers[2]?.firstName + ' ' + businessCustomers[2]?.lastName || 'Prof. Dr. Karl Hoffmann',
            phone: businessCustomers[2]?.phoneLandline || '089-3333333',
            email: businessCustomers[2]?.email || 'karl.hoffmann@firma3.de'
          },
          responsibleUserId: employees[2]?.id || 'test-employee-3',
          notes: 'Projekt erfolgreich abgeschlossen, alle Anforderungen erfüllt',
          tenantId: tenantId
        },
        {
          projectName: 'Systemhaus Schäfer',
          projectId: 'BUS-004',
          constructionTypes: ['Sanierung'],
          status: 'in Bau' as const,
          description: 'Umbau eines bestehenden Gebäudes zu einem modernen Systemhaus',
          clientId: businessCustomers[3]?.id || 'test-business-4',
          address: {
            street: 'Systemstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-01-01'),
          plannedEndDate: new Date('2024-08-31'),
          client: {
            name: businessCustomers[3]?.companyName || 'Schäfer Systems',
            contactPerson: businessCustomers[3]?.firstName + ' ' + businessCustomers[3]?.lastName || 'Dr. Ing. Monika Schäfer',
            phone: businessCustomers[3]?.phoneLandline || '089-4444444',
            email: businessCustomers[3]?.email || 'monika.schaefer@firma4.de'
          },
          responsibleUserId: employees[3]?.id || 'test-employee-4',
          notes: 'Komplexe IT-Infrastruktur-Installation erforderlich',
          tenantId: tenantId
        },
        {
          projectName: 'Lösungszentrum Meyer',
          projectId: 'BUS-005',
          constructionTypes: ['Neubau'],
          status: 'geplant' as const,
          description: 'Kundenzentrum mit Showroom und Beratungsräumen',
          clientId: businessCustomers[4]?.id || 'test-business-5',
          address: {
            street: 'Lösungsstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-09-01'),
          plannedEndDate: new Date('2025-02-28'),
          client: {
            name: businessCustomers[4]?.companyName || 'Meyer Solutions GmbH',
            contactPerson: businessCustomers[4]?.firstName + ' ' + businessCustomers[4]?.lastName || 'Dipl.-Ing. Stefan Meyer',
            phone: businessCustomers[4]?.phoneLandline || '089-5555555',
            email: businessCustomers[4]?.email || 'stefan.meyer@firma5.de'
          },
          responsibleUserId: employees[4]?.id || 'test-employee-5',
          notes: 'Moderne Architektur mit großzügigen Schaufenstern',
          tenantId: tenantId
        },
        
        // Mixed Projects
        {
          projectName: 'Wohnanlage "Grüner Hügel"',
          projectId: 'MIX-001',
          constructionTypes: ['Neubau'],
          status: 'in Bau' as const,
          description: 'Wohnanlage mit 12 Einheiten und Gemeinschaftsgarten',
          clientId: privateCustomers[0]?.id || 'test-client-1',
          address: {
            street: 'Grüner Hügel',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2023-11-01'),
          plannedEndDate: new Date('2024-10-31'),
          client: {
            name: 'Wohnungsgenossenschaft München',
            contactPerson: privateCustomers[0]?.firstName + ' ' + privateCustomers[0]?.lastName || 'Erika Meyer',
            phone: privateCustomers[0]?.phoneLandline || '089-666666',
            email: privateCustomers[0]?.email || 'erika.meyer@privat.de'
          },
          responsibleUserId: employees[0]?.id || 'test-employee-1',
          notes: 'Nachhaltige Bauweise mit Solaranlagen auf allen Dächern',
          tenantId: tenantId
        },
        {
          projectName: 'Klinik-Erweiterung',
          projectId: 'MIX-002',
          constructionTypes: ['Fassadenbau'],
          status: 'geplant' as const,
          description: 'Erweiterung der chirurgischen Abteilung',
          clientId: businessCustomers[1]?.id || 'test-business-2',
          address: {
            street: 'Klinikstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-07-01'),
          plannedEndDate: new Date('2025-06-30'),
          client: {
            name: 'Städtisches Klinikum München',
            contactPerson: businessCustomers[1]?.firstName + ' ' + businessCustomers[1]?.lastName || 'Dr. Petra Becker',
            phone: businessCustomers[1]?.phoneLandline || '089-2222222',
            email: businessCustomers[1]?.email || 'petra.becker@firma2.de'
          },
          responsibleUserId: employees[1]?.id || 'test-employee-2',
          notes: 'Höchste Anforderungen an Hygiene und Sicherheit',
          tenantId: tenantId
        },
        {
          projectName: 'Schul-Sanierung',
          projectId: 'MIX-003',
          constructionTypes: ['Sanierung'],
          status: 'abgeschlossen' as const,
          description: 'Komplette Sanierung der Grundschule',
          clientId: businessCustomers[2]?.id || 'test-business-3',
          address: {
            street: 'Schulweg',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2023-04-01'),
          plannedEndDate: new Date('2023-12-31'),
          actualEndDate: new Date('2023-12-15'),
          client: {
            name: 'Stadt München - Schulverwaltung',
            contactPerson: businessCustomers[2]?.firstName + ' ' + businessCustomers[2]?.lastName || 'Prof. Dr. Karl Hoffmann',
            phone: businessCustomers[2]?.phoneLandline || '089-3333333',
            email: businessCustomers[2]?.email || 'karl.hoffmann@firma3.de'
          },
          responsibleUserId: employees[2]?.id || 'test-employee-3',
          notes: 'Projekt erfolgreich abgeschlossen, Schule kann wieder genutzt werden',
          tenantId: tenantId
        },
        {
          projectName: 'Hotel-Renovierung',
          projectId: 'MIX-004',
          constructionTypes: ['Akustikbau'],
          status: 'pausiert' as const,
          description: 'Renovierung von 50 Hotelzimmern und Lobby',
          clientId: businessCustomers[3]?.id || 'test-business-4',
          address: {
            street: 'Hotelstraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-02-01'),
          plannedEndDate: new Date('2024-08-31'),
          client: {
            name: 'Hotel München GmbH',
            contactPerson: businessCustomers[3]?.firstName + ' ' + businessCustomers[3]?.lastName || 'Dr. Ing. Monika Schäfer',
            phone: businessCustomers[3]?.phoneLandline || '089-4444444',
            email: businessCustomers[3]?.email || 'monika.schaefer@firma4.de'
          },
          responsibleUserId: employees[3]?.id || 'test-employee-4',
          notes: 'Projekt pausiert wegen Saison - wird im Herbst fortgesetzt',
          tenantId: tenantId
        },
        {
          projectName: 'Sportzentrum',
          projectId: 'MIX-005',
          constructionTypes: ['Neubau'],
          status: 'geplant' as const,
          description: 'Multifunktionales Sportzentrum mit Hallenbad',
          clientId: businessCustomers[4]?.id || 'test-business-5',
          address: {
            street: 'Sportplatz',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-10-01'),
          plannedEndDate: new Date('2025-09-30'),
          client: {
            name: 'Sportverein München e.V.',
            contactPerson: businessCustomers[4]?.firstName + ' ' + businessCustomers[4]?.lastName || 'Dipl.-Ing. Stefan Meyer',
            phone: businessCustomers[4]?.phoneLandline || '089-5555555',
            email: businessCustomers[4]?.email || 'stefan.meyer@firma5.de'
          },
          responsibleUserId: employees[4]?.id || 'test-employee-5',
          notes: 'Komplexe Technik für Hallenbad und Sportanlagen',
          tenantId: tenantId
        }
      ];

      let createdCount = 0;
      
      for (const projectData of testProjects) {
        try {
          const projectDoc = {
            ...projectData,
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
            createdBy: 'test-admin',
            updatedBy: 'test-admin'
          };

          await addDoc(collection(db, this.projectsCollection), projectDoc);
          createdCount++;
          console.log(`✅ Created test project ${createdCount}/15: ${projectData.projectName} (${projectData.status})`);
        } catch (error) {
          console.error(`❌ Failed to create test project ${projectData.projectName}:`, error);
        }
      }
      
      console.log(`🎉 Project test data creation completed! Created ${createdCount}/15 projects.`);
      
    } catch (error) {
      console.error('❌ Error creating project test data:', error);
      throw new Error('Fehler beim Erstellen der Projekt-Testdaten');
    }
  }

  /**
   * Create the projects collection with test data
   */
  async createProjectsCollection(): Promise<void> {
    try {
      console.log('🚀 Creating projects collection with test data...');
      
      // First, create some basic test projects to establish the collection
      const basicProjects = [
        {
          projectName: 'Test Projekt 1',
          projectId: 'TEST-001',
          constructionTypes: ['Neubau'],
          status: 'geplant' as const,
          description: 'Ein Testprojekt zur Erstellung der Collection',
          clientId: 'test-client',
          address: {
            street: 'Teststraße',
            zipCode: '80331',
            city: 'München',
            state: 'Bayern',
            country: 'Deutschland'
          },
          plannedStartDate: new Date('2024-01-01'),
          plannedEndDate: new Date('2024-12-31'),
          client: {
            name: 'Test Kunde',
            contactPerson: 'Test Kontakt',
            phone: '089-123456',
            email: 'test@example.com'
          },
          responsibleUserId: 'test-employee',
          notes: 'Testprojekt',
          tenantId: 'mathi-hoffer'
        }
      ];

      for (const projectData of basicProjects) {
        const projectDoc = {
          ...projectData,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          createdBy: 'admin',
          updatedBy: 'admin'
        };

        await addDoc(collection(db, this.projectsCollection), projectDoc);
        console.log(`✅ Created basic project: ${projectData.projectName}`);
      }
      
      console.log('🎉 Projects collection created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating projects collection:', error);
      throw new Error('Fehler beim Erstellen der Projekte Collection');
    }
  }
}

export default new ProjectService(); 