import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building2, 
  User, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { mandantService } from '../../services/mandantService';
import { 
  Mandant, 
  CreateMandantRequest, 
  UpdateMandantRequest, 
  MandantTyp,
  MandantAdresse,
  MandantFirmenDaten
} from '../../settings/types';

interface MandantManagementPageProps {
  onNavigateToDashboard?: () => void;
}

const MandantManagementPage: React.FC<MandantManagementPageProps> = ({
  onNavigateToDashboard
}) => {
  const [mandanten, setMandanten] = useState<Mandant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MandantTyp | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMandant, setSelectedMandant] = useState<Mandant | null>(null);
  const [formData, setFormData] = useState<CreateMandantRequest>({
    name: '',
    typ: 'firma',
    adresse: {},
    firmenDaten: {},
    aktive: true
  });

  // Load mandanten
  const loadMandanten = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await mandantService.getAllMandanten();
      setMandanten(data);
    } catch (err) {
      console.error('Error loading mandanten:', err);
      setError('Fehler beim Laden der Mandanten');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadMandanten();
  }, [loadMandanten]);

  // Filter and search mandanten
  const filteredMandanten = mandanten.filter(mandant => {
    const matchesSearch = mandant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || mandant.typ === filterType;
    return matchesSearch && matchesType;
  });

  // Handle create mandant
  const handleCreateMandant = async () => {
    try {
      await mandantService.createMandant(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        typ: 'firma',
        adresse: {},
        firmenDaten: {},
        aktive: true
      });
      await loadMandanten();
    } catch (err) {
      console.error('Error creating mandant:', err);
      setError('Fehler beim Erstellen des Mandanten');
    }
  };

  // Handle update mandant
  const handleUpdateMandant = async () => {
    if (!selectedMandant) return;
    
    try {
      const updateData: UpdateMandantRequest = {
        name: formData.name,
        typ: formData.typ,
        adresse: formData.adresse,
        firmenDaten: formData.firmenDaten,
        aktive: formData.aktive
      };
      
      await mandantService.updateMandant(selectedMandant.mandantId, updateData);
      setShowEditModal(false);
      setSelectedMandant(null);
      setFormData({
        name: '',
        typ: 'firma',
        adresse: {},
        firmenDaten: {},
        aktive: true
      });
      await loadMandanten();
    } catch (err) {
      console.error('Error updating mandant:', err);
      setError('Fehler beim Aktualisieren des Mandanten');
    }
  };

  // Handle delete mandant
  const handleDeleteMandant = async (mandantId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Mandanten löschen möchten?')) {
      return;
    }
    
    try {
      await mandantService.deleteMandant(mandantId);
      await loadMandanten();
    } catch (err) {
      console.error('Error deleting mandant:', err);
      setError('Fehler beim Löschen des Mandanten');
    }
  };

  // Handle edit mandant
  const handleEditMandant = (mandant: Mandant) => {
    setSelectedMandant(mandant);
    setFormData({
      name: mandant.name,
      typ: mandant.typ,
      adresse: mandant.adresse || {},
      firmenDaten: mandant.firmenDaten || {},
      aktive: mandant.aktive !== undefined ? mandant.aktive : true
    });
    setShowEditModal(true);
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle address field changes
  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      adresse: {
        ...prev.adresse,
        [field]: value
      }
    }));
  };

  // Handle company data field changes
  const handleCompanyDataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      firmenDaten: {
        ...prev.firmenDaten,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mandanten-Verwaltung</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Firmen und Privatpersonen</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Neuer Mandant
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Mandanten suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MandantTyp | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Typen</option>
              <option value="firma">Firmen</option>
              <option value="privat">Privatpersonen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mandanten List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMandanten.map((mandant) => (
                <motion.tr
                  key={mandant.mandantId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {mandant.typ === 'firma' ? (
                        <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                      ) : (
                        <User className="h-5 w-5 text-green-600 mr-3" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mandant.name}</div>
                        <div className="text-sm text-gray-500">ID: {mandant.mandantId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mandant.typ === 'firma' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {mandant.typ === 'firma' ? 'Firma' : 'Privat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mandant.adresse ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span>
                          {mandant.adresse.straße && `${mandant.adresse.straße}, `}
                          {mandant.adresse.plz && mandant.adresse.ort 
                            ? `${mandant.adresse.plz} ${mandant.adresse.ort}` 
                            : 'Keine Adresse'
                          }
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Keine Adresse</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {mandant.aktive ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inaktiv
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {mandant.createdAt.toLocaleDateString('de-DE')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditMandant(mandant)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMandant(mandant.mandantId)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMandanten.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm || filterType !== 'all' ? (
                <Filter className="h-12 w-12 mx-auto" />
              ) : (
                <Building2 className="h-12 w-12 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'Keine Mandanten gefunden' : 'Keine Mandanten vorhanden'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Versuchen Sie andere Suchbegriffe oder Filter.' 
                : 'Erstellen Sie Ihren ersten Mandanten.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Neuer Mandant</h2>
            <MandantForm
              formData={formData}
              onFormChange={handleFormChange}
              onAddressChange={handleAddressChange}
              onCompanyDataChange={handleCompanyDataChange}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateMandant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMandant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Mandant bearbeiten</h2>
            <MandantForm
              formData={formData}
              onFormChange={handleFormChange}
              onAddressChange={handleAddressChange}
              onCompanyDataChange={handleCompanyDataChange}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUpdateMandant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mandant Form Component
interface MandantFormProps {
  formData: CreateMandantRequest;
  onFormChange: (field: string, value: any) => void;
  onAddressChange: (field: string, value: string) => void;
  onCompanyDataChange: (field: string, value: string) => void;
}

const MandantForm: React.FC<MandantFormProps> = ({
  formData,
  onFormChange,
  onAddressChange,
  onCompanyDataChange
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Grundinformationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Firmenname oder vollständiger Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ *
            </label>
            <select
              value={formData.typ}
              onChange={(e) => onFormChange('typ', e.target.value as MandantTyp)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="firma">Firma</option>
              <option value="privat">Privatperson</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium mb-4">Adresse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Straße
            </label>
            <input
              type="text"
              value={formData.adresse?.straße || ''}
              onChange={(e) => onAddressChange('straße', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Musterstraße 123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PLZ
            </label>
            <input
              type="text"
              value={formData.adresse?.plz || ''}
              onChange={(e) => onAddressChange('plz', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ort
            </label>
            <input
              type="text"
              value={formData.adresse?.ort || ''}
              onChange={(e) => onAddressChange('ort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Musterstadt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Land
            </label>
            <input
              type="text"
              value={formData.adresse?.land || ''}
              onChange={(e) => onAddressChange('land', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Deutschland"
            />
          </div>
        </div>
      </div>

      {/* Company Data (only for firms) */}
      {formData.typ === 'firma' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Firmendaten</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USt-IdNr.
              </label>
              <input
                type="text"
                value={formData.firmenDaten?.ustIdNr || ''}
                onChange={(e) => onCompanyDataChange('ustIdNr', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="DE123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Steuernummer
              </label>
              <input
                type="text"
                value={formData.firmenDaten?.steuernummer || ''}
                onChange={(e) => onCompanyDataChange('steuernummer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123/456/78901"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handelsregister
              </label>
              <input
                type="text"
                value={formData.firmenDaten?.handelsregister || ''}
                onChange={(e) => onCompanyDataChange('handelsregister', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="HRB 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.firmenDaten?.telefon || ''}
                onChange={(e) => onCompanyDataChange('telefon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+49 123 456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.firmenDaten?.email || ''}
                onChange={(e) => onCompanyDataChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="info@firma.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.firmenDaten?.website || ''}
                onChange={(e) => onCompanyDataChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.firma.de"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.aktive}
            onChange={(e) => onFormChange('aktive', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Mandant ist aktiv</span>
        </label>
      </div>
    </div>
  );
};

export default MandantManagementPage; 