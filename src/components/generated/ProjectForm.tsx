import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Info,
  Upload,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProjectService, { Project, ProjectFormData, ProjectAddress, Client } from '../../services/projectService';
import { UserManagementService } from '../../services/userManagementService';
import { bauvorhabenartService } from '../../services/bauvorhabenartService';
import { Bauvorhabenart } from '../../settings/types';

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const CONSTRUCTION_TYPES = [
  { value: 'Neubau', label: 'Neubau' },
  { value: 'Sanierung', label: 'Sanierung' },
  { value: 'Trockenbau', label: 'Trockenbau' },
  { value: 'Fassadenbau', label: 'Fassadenbau' },
  { value: 'Akustikbau', label: 'Akustikbau' }
];

const PROJECT_STATUSES = [
  { value: 'geplant', label: 'Geplant' },
  { value: 'in Bau', label: 'In Bau' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' },
  { value: 'pausiert', label: 'Pausiert' },
  { value: 'storniert', label: 'Storniert' }
];

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  project, 
  onSave, 
  onCancel, 
  mode 
}) => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [availableBauvorhabenarten, setAvailableBauvorhabenarten] = useState<Bauvorhabenart[]>([]);
  const [customerType, setCustomerType] = useState<'private' | 'commercial'>('private');

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    projectId: '',
    constructionTypes: [],
    bauvorhabenarten: [],
    status: 'geplant',
    description: '',
    clientId: '',
    address: {
      street: '',
      zipCode: '',
      city: '',
      state: '',
      country: 'Deutschland'
    },
    plannedStartDate: '',
    plannedEndDate: '',
    actualEndDate: '',
    client: {
      name: '',
      contactPerson: '',
      phone: '',
      email: ''
    },
    responsibleUserId: '',
    notes: ''
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter clients when customer type changes
  useEffect(() => {
    filterClientsByType();
  }, [customerType, availableUsers]);

  // Load form data if editing
  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        projectName: project.projectName,
        projectId: project.projectId,
        constructionTypes: project.constructionTypes,
        bauvorhabenarten: project.bauvorhabenarten || [],
        status: project.status,
        description: project.description || '',
        clientId: project.clientId,
        address: project.address,
        plannedStartDate: project.plannedStartDate.toISOString().split('T')[0],
        plannedEndDate: project.plannedEndDate.toISOString().split('T')[0],
        actualEndDate: project.actualEndDate?.toISOString().split('T')[0] || '',
        client: project.client,
        responsibleUserId: project.responsibleUserId,
        notes: project.notes || ''
      });
    }
  }, [project, mode]);

  const loadInitialData = async () => {
    try {
      // Load users for responsible person dropdown and client selection
      const users = await UserManagementService.getAllUsers();
      const activeUsers = users?.filter(user => user.status === 'Aktiv') || [];
      setAvailableUsers(activeUsers);

      // Load bauvorhabenarten for the current tenant
      const tenantId = currentUser?.tenantId || 'default-tenant';
      const bauvorhabenarten = await bauvorhabenartService.getBauvorhabenartenByTenant(tenantId);
      setAvailableBauvorhabenarten(bauvorhabenarten);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Ensure arrays are always defined even on error
      setAvailableUsers([]);
      setAvailableClients([]);
      setAvailableBauvorhabenarten([]);
    }
  };

  const filterClientsByType = () => {
    if (!availableUsers || availableUsers.length === 0) {
      setAvailableClients([]);
      return;
    }

    const filteredClients = availableUsers.filter(user => {
      // Exclude inactive users
      if (user.status === 'Inaktiv') {
        return false;
      }

      if (customerType === 'commercial') {
        // Commercial customers: users with company name
        return user.company && user.company.trim() !== '';
      } else {
        // Private customers: users without company name
        return !user.company || user.company.trim() === '';
      }
    });

    setAvailableClients(filteredClients);
    
    // Clear client selection if current selection is not in filtered list
    if (formData.clientId && !filteredClients.find(client => client.id === formData.clientId)) {
      handleInputChange('clientId', '');
    }
  };

  // Get internal employees for responsible person selection
  const getInternalEmployees = () => {
    if (!availableUsers || availableUsers.length === 0) {
      return [];
    }

    return availableUsers.filter(user => {
      // Only include active users
      if (user.status === 'Inaktiv') {
        return false;
      }
      
      // Only include internal employees (Admin, Employee roles)
      return user.role === 'Admin' || user.role === 'Employee';
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Projektname ist erforderlich';
    }

    if (!formData.projectId.trim()) {
      newErrors.projectId = 'Projekt-ID ist erforderlich';
    }

    if (formData.constructionTypes.length === 0) {
      newErrors.constructionTypes = 'Mindestens eine Bauart muss ausgewählt werden';
    }

    if (!customerType) {
      newErrors.customerType = 'Kundentyp muss ausgewählt werden';
    }

    if (!formData.clientId) {
      newErrors.clientId = customerType === 'private' 
        ? 'Privatkunde ist erforderlich' 
        : 'Geschäftskunde ist erforderlich';
    }

    if (!formData.plannedStartDate) {
      newErrors.plannedStartDate = 'Geplanter Baubeginn ist erforderlich';
    }

    if (!formData.plannedEndDate) {
      newErrors.plannedEndDate = 'Geplantes Bauende ist erforderlich';
    }

    if (!formData.responsibleUserId) {
      newErrors.responsibleUserId = 'Projektverantwortlicher ist erforderlich';
    }

    // Date validation
    if (formData.plannedStartDate && formData.plannedEndDate) {
      const startDate = new Date(formData.plannedStartDate);
      const endDate = new Date(formData.plannedEndDate);
      
      if (startDate >= endDate) {
        newErrors.plannedEndDate = 'Bauende muss nach Baubeginn liegen';
      }
    }

    // Email validation
    if (formData.client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client.email)) {
      newErrors.clientEmail = 'Ungültige E-Mail-Adresse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: keyof ProjectAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleClientChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value
      }
    }));

    // Clear client email error when user starts typing
    if (field === 'email' && errors.clientEmail) {
      setErrors(prev => ({
        ...prev,
        clientEmail: ''
      }));
    }
  };

  const handleConstructionTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      constructionTypes: prev.constructionTypes.includes(type)
        ? prev.constructionTypes.filter(t => t !== type)
        : [...prev.constructionTypes, type]
    }));

    // Clear error when user makes selection
    if (errors.constructionTypes) {
      setErrors(prev => ({
        ...prev,
        constructionTypes: ''
      }));
    }
  };

  const handleBauvorhabenartToggle = (bauvorhabenartId: string) => {
    setFormData(prev => ({
      ...prev,
      bauvorhabenarten: prev.bauvorhabenarten.includes(bauvorhabenartId)
        ? prev.bauvorhabenarten.filter(id => id !== bauvorhabenartId)
        : [...prev.bauvorhabenarten, bauvorhabenartId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentUser?.uid || !userData) {
      setError('Benutzer nicht authentifiziert');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if project ID is unique
      const isUnique = await ProjectService.isProjectIdUnique(
        formData.projectId,
        userData.tenantId || currentUser.uid,
        project?.id
      );

      if (!isUnique) {
        setError('Projekt-ID ist bereits vergeben');
        setLoading(false);
        return;
      }

      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        projectName: formData.projectName,
        projectId: formData.projectId,
        constructionTypes: formData.constructionTypes,
        bauvorhabenarten: formData.bauvorhabenarten,
        status: formData.status,
        description: formData.description,
        tenantId: userData.tenantId || currentUser.uid,
        clientId: formData.clientId,
        address: formData.address,
        plannedStartDate: new Date(formData.plannedStartDate),
        plannedEndDate: new Date(formData.plannedEndDate),
        actualEndDate: formData.actualEndDate ? new Date(formData.actualEndDate) : undefined,
        client: formData.client,
        responsibleUserId: formData.responsibleUserId,
        notes: formData.notes
      };

      if (mode === 'create') {
        const newProjectId = await ProjectService.createProject(projectData);
        const newProject = await ProjectService.getProjectById(newProjectId);
        if (newProject) {
          onSave(newProject);
          setSuccess('Projekt erfolgreich erstellt');
        }
      } else if (project?.id) {
        await ProjectService.updateProject(project.id, projectData, currentUser.uid);
        const updatedProject = await ProjectService.getProjectById(project.id);
        if (updatedProject) {
          onSave(updatedProject);
          setSuccess('Projekt erfolgreich aktualisiert');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Fehler beim Speichern des Projekts');
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = availableClients.find(c => c.id === formData.clientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200"
    >
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {mode === 'create' ? 'Neues Projekt erstellen' : 'Projekt bearbeiten'}
              </h2>
              <p className="text-slate-600 mt-1">
                {mode === 'create' ? 'Erfassen Sie die Details für ein neues Bauprojekt' : 'Bearbeiten Sie die Projektdetails'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Error and Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
            {mode === 'create' && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Zurück zur Projektliste
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess('');
                    setFormData({
                      projectName: '',
                      projectId: '',
                      constructionTypes: [],
                      bauvorhabenarten: [],
                      status: 'geplant',
                      description: '',
                      clientId: '',
                      address: {
                        street: '',
                        zipCode: '',
                        city: '',
                        state: '',
                        country: 'Deutschland'
                      },
                      plannedStartDate: '',
                      plannedEndDate: '',
                      actualEndDate: '',
                      client: {
                        name: '',
                        contactPerson: '',
                        phone: '',
                        email: ''
                      },
                      responsibleUserId: '',
                      notes: ''
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Weiteres Projekt erstellen
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Basic Project Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Grundinformationen
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projektname / Titel *
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.projectName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="z.B. Wohnquartier Musterstadt"
              />
              {errors.projectName && (
                <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
              )}
            </div>

            {/* Project ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projekt-ID *
              </label>
              <input
                type="text"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.projectId ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="z.B. P-2025-001"
              />
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
              )}
            </div>
          </div>

          {/* Construction Types */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bauvorhaben / Bauart * (Mehrfachauswahl)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CONSTRUCTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.constructionTypes.includes(type.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.constructionTypes.includes(type.value)}
                    onChange={() => handleConstructionTypeToggle(type.value)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
            {errors.constructionTypes && (
              <p className="mt-1 text-sm text-red-600">{errors.constructionTypes}</p>
            )}
          </div>

          {/* Bauvorhabenarten */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bauvorhabenarten (Mehrfachauswahl)
            </label>
            {availableBauvorhabenarten.length === 0 ? (
              <div className="p-4 border border-slate-300 rounded-lg bg-slate-50">
                <p className="text-sm text-slate-600">
                  Keine Bauvorhabenarten verfügbar. Erstellen Sie zuerst Bauvorhabenarten in der Bauvorhabenarten-Verwaltung.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableBauvorhabenarten.map((bauvorhabenart) => (
                  <label
                    key={bauvorhabenart.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.bauvorhabenarten.includes(bauvorhabenart.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.bauvorhabenarten.includes(bauvorhabenart.id)}
                      onChange={() => handleBauvorhabenartToggle(bauvorhabenart.id)}
                      className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium">{bauvorhabenart.name}</span>
                      {bauvorhabenart.kategorie && (
                        <div className="text-xs text-slate-500">{bauvorhabenart.kategorie}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Projektbeschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Kurzbeschreibung oder Details zum Projekt..."
            />
          </div>
        </div>

        {/* Client and Responsible Person */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Kunde und Verantwortliche
          </h3>

          {/* Customer Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Kundentyp *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                customerType === 'private'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}>
                <input
                  type="radio"
                  name="customerType"
                  value="private"
                  checked={customerType === 'private'}
                  onChange={(e) => setCustomerType(e.target.value as 'private' | 'commercial')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-slate-900">Privatkunde</div>
                  <div className="text-sm text-slate-600">Einzelpersonen ohne Firmenname</div>
                </div>
              </label>
              
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                customerType === 'commercial'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}>
                <input
                  type="radio"
                  name="customerType"
                  value="commercial"
                  checked={customerType === 'commercial'}
                  onChange={(e) => setCustomerType(e.target.value as 'private' | 'commercial')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-slate-900">Geschäftskunde</div>
                  <div className="text-sm text-slate-600">Firmen und Unternehmen</div>
                </div>
              </label>
            </div>
            {errors.customerType && (
              <p className="mt-1 text-sm text-red-600">{errors.customerType}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {customerType === 'private' ? 'Privatkunde' : 'Geschäftskunde'} auswählen *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.clientId ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">
                  {customerType === 'private' ? 'Privatkunde auswählen...' : 'Geschäftskunde auswählen...'}
                </option>
                {(availableClients || []).map((client) => (
                  <option key={client.id} value={client.id}>
                    {customerType === 'commercial' 
                      ? `${client.company} - ${`${client.firstName} ${client.lastName}`.trim() || client.email}`
                      : `${`${client.firstName} ${client.lastName}`.trim() || client.email}`
                    }
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
              )}
              {availableClients.length === 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  {customerType === 'private' 
                    ? 'Keine Privatkunden verfügbar. Erstellen Sie zuerst einen Benutzer ohne Firmenname.'
                    : 'Keine Geschäftskunden verfügbar. Erstellen Sie zuerst einen Benutzer mit Firmenname.'
                  }
                </p>
              )}
            </div>

            {/* Responsible Person */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projektverantwortlicher intern *
              </label>
              <select
                value={formData.responsibleUserId}
                onChange={(e) => handleInputChange('responsibleUserId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.responsibleUserId ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Verantwortlichen auswählen...</option>
                {(getInternalEmployees() || []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`.trim() || user.email}
                  </option>
                ))}
              </select>
              {errors.responsibleUserId && (
                <p className="mt-1 text-sm text-red-600">{errors.responsibleUserId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Project Address */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Projektadresse / Standort
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Straße
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Musterstraße 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                PLZ
              </label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ort
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Musterstadt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bundesland
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Bayern"
              />
            </div>
          </div>
        </div>

        {/* Project Dates */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Projektzeitplan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Geplanter Baubeginn *
              </label>
              <input
                type="date"
                value={formData.plannedStartDate}
                onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.plannedStartDate ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.plannedStartDate && (
                <p className="mt-1 text-sm text-red-600">{errors.plannedStartDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Geplantes Bauende *
              </label>
              <input
                type="date"
                value={formData.plannedEndDate}
                onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.plannedEndDate ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.plannedEndDate && (
                <p className="mt-1 text-sm text-red-600">{errors.plannedEndDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Aktuelles Bauende
              </label>
              <input
                type="date"
                value={formData.actualEndDate}
                onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Bauherr / Auftraggeber Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Name des Bauherrn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kontaktperson
              </label>
              <input
                type="text"
                value={formData.client.contactPerson}
                onChange={(e) => handleClientChange('contactPerson', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ansprechpartner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefonnummer
              </label>
              <input
                type="tel"
                value={formData.client.phone}
                onChange={(e) => handleClientChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.client.email}
                onChange={(e) => handleClientChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.clientEmail ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="kontakt@beispiel.de"
              />
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notizen / Kommentare
          </h3>

          <div>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Zusätzliche Notizen oder Kommentare zum Projekt..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Projekt erstellen' : 'Änderungen speichern'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProjectForm; 