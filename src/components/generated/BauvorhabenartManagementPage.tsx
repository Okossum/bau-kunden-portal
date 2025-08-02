import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Building,
  Calendar,
  Tag,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bauvorhabenartService } from '../../services/bauvorhabenartService';
import { 
  Bauvorhabenart, 
  CreateBauvorhabenartRequest, 
  UpdateBauvorhabenartRequest 
} from '../../settings/types';

interface BauvorhabenartManagementPageProps {
  // Props für Navigation falls benötigt
}

const BauvorhabenartManagementPage: React.FC<BauvorhabenartManagementPageProps> = () => {
  const { currentUser } = useAuth();
  const [bauvorhabenarten, setBauvorhabenarten] = useState<Bauvorhabenart[]>([]);
  const [filteredBauvorhabenarten, setFilteredBauvorhabenarten] = useState<Bauvorhabenart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategorie, setSelectedKategorie] = useState<string>('alle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBauvorhabenart, setSelectedBauvorhabenart] = useState<Bauvorhabenart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formular-Zustände
  const [formData, setFormData] = useState<CreateBauvorhabenartRequest>({
    name: '',
    beschreibung: '',
    kategorie: '',
    status: 'aktiv',
    standardDauer: 0,
    phasen: [],
  });

  const tenantId = currentUser?.tenantId || 'default-tenant';

  // Alle Bauvorhabenarten laden
  const loadBauvorhabenarten = async () => {
    try {
      setLoading(true);
      console.log('BauvorhabenartManagementPage: Loading bauvorhabenarten for tenant:', tenantId);
      
      const data = await bauvorhabenartService.getBauvorhabenartenByTenant(tenantId);
      setBauvorhabenarten(data);
      setFilteredBauvorhabenarten(data);
      
      console.log('BauvorhabenartManagementPage: Loaded bauvorhabenarten:', data.length);
    } catch (error) {
      console.error('BauvorhabenartManagementPage: Error loading bauvorhabenarten:', error);
      setError('Fehler beim Laden der Bauvorhabenarten');
    } finally {
      setLoading(false);
    }
  };

  // Bauvorhabenarten filtern
  const filterBauvorhabenarten = () => {
    let filtered = bauvorhabenarten;

    // Nach Suchbegriff filtern
    if (searchTerm) {
      filtered = filtered.filter(bauvorhabenart =>
        bauvorhabenart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bauvorhabenart.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bauvorhabenart.kategorie?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Nach Kategorie filtern
    if (selectedKategorie !== 'alle') {
      filtered = filtered.filter(bauvorhabenart => bauvorhabenart.kategorie === selectedKategorie);
    }

    setFilteredBauvorhabenarten(filtered);
  };

  // Standard-Bauvorhabenarten initialisieren
  const handleInitializeDefaults = async () => {
    try {
      if (!currentUser?.uid) {
        setError('Benutzer nicht authentifiziert');
        return;
      }

      await bauvorhabenartService.initializeDefaultBauvorhabenarten(tenantId, currentUser.uid);
      setSuccess('Standard-Bauvorhabenarten erfolgreich erstellt');
      loadBauvorhabenarten();
    } catch (error) {
      console.error('BauvorhabenartManagementPage: Error initializing defaults:', error);
      setError('Fehler beim Erstellen der Standard-Bauvorhabenarten');
    }
  };

  // Neue Bauvorhabenart erstellen
  const handleCreateBauvorhabenart = async () => {
    try {
      if (!currentUser?.uid) {
        setError('Benutzer nicht authentifiziert');
        return;
      }

      await bauvorhabenartService.createBauvorhabenart(tenantId, formData, currentUser.uid);
      setSuccess('Bauvorhabenart erfolgreich erstellt');
      setShowCreateModal(false);
      setFormData({
        name: '',
        beschreibung: '',
        kategorie: '',
        status: 'aktiv',
        standardDauer: 0,
        phasen: [],
      });
      loadBauvorhabenarten();
    } catch (error) {
      console.error('BauvorhabenartManagementPage: Error creating bauvorhabenart:', error);
      setError('Fehler beim Erstellen der Bauvorhabenart');
    }
  };

  // Bauvorhabenart bearbeiten
  const handleEditBauvorhabenart = async () => {
    try {
      if (!currentUser?.uid || !selectedBauvorhabenart) {
        setError('Benutzer nicht authentifiziert oder Bauvorhabenart nicht ausgewählt');
        return;
      }

      const updateData: UpdateBauvorhabenartRequest = {
        name: formData.name || undefined,
        beschreibung: formData.beschreibung || undefined,
        kategorie: formData.kategorie || undefined,
        status: formData.status || undefined,
        standardDauer: formData.standardDauer || undefined,
        phasen: formData.phasen || undefined,
      };

      await bauvorhabenartService.updateBauvorhabenart(
        tenantId,
        selectedBauvorhabenart.id,
        updateData,
        currentUser.uid
      );
      
      setSuccess('Bauvorhabenart erfolgreich aktualisiert');
      setShowEditModal(false);
      setSelectedBauvorhabenart(null);
      setFormData({
        name: '',
        beschreibung: '',
        kategorie: '',
        status: 'aktiv',
        standardDauer: 0,
        phasen: [],
      });
      loadBauvorhabenarten();
    } catch (error) {
      console.error('BauvorhabenartManagementPage: Error updating bauvorhabenart:', error);
      setError('Fehler beim Aktualisieren der Bauvorhabenart');
    }
  };

  // Bauvorhabenart löschen
  const handleDeleteBauvorhabenart = async (bauvorhabenartId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Bauvorhabenart löschen möchten?')) {
      return;
    }

    try {
      await bauvorhabenartService.deleteBauvorhabenart(tenantId, bauvorhabenartId);
      setSuccess('Bauvorhabenart erfolgreich gelöscht');
      loadBauvorhabenarten();
    } catch (error) {
      console.error('BauvorhabenartManagementPage: Error deleting bauvorhabenart:', error);
      setError('Fehler beim Löschen der Bauvorhabenart');
    }
  };

  // Edit-Modal öffnen
  const openEditModal = (bauvorhabenart: Bauvorhabenart) => {
    setSelectedBauvorhabenart(bauvorhabenart);
    setFormData({
      name: bauvorhabenart.name,
      beschreibung: bauvorhabenart.beschreibung || '',
      kategorie: bauvorhabenart.kategorie || '',
      status: bauvorhabenart.status || 'aktiv',
      standardDauer: bauvorhabenart.standardDauer || 0,
      phasen: bauvorhabenart.phasen || [],
    });
    setShowEditModal(true);
  };

  // Kategorien extrahieren
  const kategorien = ['alle', ...Array.from(new Set(bauvorhabenarten.map(b => b.kategorie).filter(Boolean)))];

  // Effekte
  useEffect(() => {
    loadBauvorhabenarten();
  }, [tenantId]);

  useEffect(() => {
    filterBauvorhabenarten();
  }, [searchTerm, selectedKategorie, bauvorhabenarten]);

  // Fehler und Erfolg zurücksetzen
  useEffect(() => {
    if (error) {
      setTimeout(() => setError(null), 5000);
    }
    if (success) {
      setTimeout(() => setSuccess(null), 5000);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bauvorhabenarten-Verwaltung</h1>
                <p className="text-gray-600">Verwalten Sie mandantenspezifische Bauvorhabenarten</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleInitializeDefaults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                Standard erstellen
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neue Bauvorhabenart
              </button>
            </div>
          </div>
        </div>

        {/* Fehler und Erfolg */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
          >
            <div className="flex">
              <div className="text-red-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-md p-4 mb-6"
          >
            <div className="flex">
              <div className="text-green-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter und Suche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bauvorhabenarten suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedKategorie}
                onChange={(e) => setSelectedKategorie(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {kategorien.map((kategorie) => (
                  <option key={kategorie} value={kategorie}>
                    {kategorie === 'alle' ? 'Alle Kategorien' : kategorie}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bauvorhabenarten Liste */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredBauvorhabenarten.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Bauvorhabenarten gefunden</h3>
              <p className="mt-1 text-sm text-gray-500">
                {bauvorhabenarten.length === 0 
                  ? 'Erstellen Sie Ihre erste Bauvorhabenart oder initialisieren Sie Standard-Bauvorhabenarten.'
                  : 'Versuchen Sie andere Suchbegriffe oder Filter.'
                }
              </p>
              {bauvorhabenarten.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleInitializeDefaults}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Standard-Bauvorhabenarten erstellen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dauer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phasen
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
                  {filteredBauvorhabenarten.map((bauvorhabenart) => (
                    <motion.tr
                      key={bauvorhabenart.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bauvorhabenart.name}</div>
                          {bauvorhabenart.beschreibung && (
                            <div className="text-sm text-gray-500">{bauvorhabenart.beschreibung}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {bauvorhabenart.kategorie || 'Keine Kategorie'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bauvorhabenart.standardDauer ? `${bauvorhabenart.standardDauer} Tage` : 'Nicht definiert'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bauvorhabenart.status === 'aktiv' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bauvorhabenart.status === 'aktiv' ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bauvorhabenart.phasen.length} Phasen
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bauvorhabenart.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(bauvorhabenart)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBauvorhabenart(bauvorhabenart.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Bauvorhabenart erstellen</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateBauvorhabenart(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                      <textarea
                        value={formData.beschreibung}
                        onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                      <input
                        type="text"
                        value={formData.kategorie}
                        onChange={(e) => setFormData({ ...formData, kategorie: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Standard-Dauer (Tage)</label>
                      <input
                        type="number"
                        value={formData.standardDauer}
                        onChange={(e) => setFormData({ ...formData, standardDauer: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktiv' | 'inaktiv' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="aktiv">Aktiv</option>
                        <option value="inaktiv">Inaktiv</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Erstellen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedBauvorhabenart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bauvorhabenart bearbeiten</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleEditBauvorhabenart(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                      <textarea
                        value={formData.beschreibung}
                        onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                      <input
                        type="text"
                        value={formData.kategorie}
                        onChange={(e) => setFormData({ ...formData, kategorie: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Standard-Dauer (Tage)</label>
                      <input
                        type="number"
                        value={formData.standardDauer}
                        onChange={(e) => setFormData({ ...formData, standardDauer: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktiv' | 'inaktiv' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="aktiv">Aktiv</option>
                        <option value="inaktiv">Inaktiv</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Speichern
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BauvorhabenartManagementPage; 