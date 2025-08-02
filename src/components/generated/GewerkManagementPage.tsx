import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, Wrench, Filter, Calendar, DollarSign,
  CheckCircle, XCircle, Clock, Users, Package
} from 'lucide-react';
import { gewerkService } from '../../services/gewerkService';
import {
  Gewerk, CreateGewerkRequest, UpdateGewerkRequest
} from '../../settings/types';
import { useAuth } from '../../contexts/AuthContext';

interface GewerkManagementPageProps {
  onNavigateToDashboard?: () => void;
}

const GewerkManagementPage: React.FC<GewerkManagementPageProps> = ({ onNavigateToDashboard }) => {
  const { currentUser } = useAuth();
  const [gewerke, setGewerke] = useState<Gewerk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategorie, setFilterKategorie] = useState<string>('alle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGewerk, setEditingGewerk] = useState<Gewerk | null>(null);
  const [formData, setFormData] = useState<CreateGewerkRequest>({
    name: '',
    beschreibung: '',
    kategorie: '',
    standardDauer: undefined,
    abhaengigkeiten: [],
    materialien: [],
    handwerker: [],
    kosten: {
      min: undefined,
      max: undefined,
      einheit: '€'
    }
  });

  const loadGewerke = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gewerkService.getAllGewerke();
      setGewerke(data);
    } catch (err) {
      setError('Fehler beim Laden der Gewerke');
      console.error('Error loading gewerke:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGewerke();
  }, [loadGewerke]);

  const filteredGewerke = gewerke.filter(gewerk => {
    const matchesSearch = gewerk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (gewerk.beschreibung && gewerk.beschreibung.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterKategorie === 'alle' || gewerk.kategorie === filterKategorie;
    return matchesSearch && matchesFilter;
  });

  const kategorien = Array.from(new Set(gewerke.map(g => g.kategorie).filter(Boolean)));

  const handleCreateGewerk = async () => {
    if (!currentUser?.uid) return;
    
    try {
      await gewerkService.createGewerk(formData, currentUser.uid);
      setShowCreateModal(false);
      setFormData({
        name: '',
        beschreibung: '',
        kategorie: '',
        standardDauer: undefined,
        abhaengigkeiten: [],
        materialien: [],
        handwerker: [],
        kosten: {
          min: undefined,
          max: undefined,
          einheit: '€'
        }
      });
      loadGewerke();
    } catch (err) {
      setError('Fehler beim Erstellen des Gewerks');
      console.error('Error creating gewerk:', err);
    }
  };

  const handleUpdateGewerk = async () => {
    if (!currentUser?.uid || !editingGewerk) return;
    
    try {
      const updateData: UpdateGewerkRequest = {
        name: formData.name,
        beschreibung: formData.beschreibung,
        kategorie: formData.kategorie,
        standardDauer: formData.standardDauer,
        abhaengigkeiten: formData.abhaengigkeiten,
        materialien: formData.materialien,
        handwerker: formData.handwerker,
        kosten: formData.kosten
      };
      
      await gewerkService.updateGewerk(editingGewerk.id, updateData, currentUser.uid);
      setShowEditModal(false);
      setEditingGewerk(null);
      setFormData({
        name: '',
        beschreibung: '',
        kategorie: '',
        standardDauer: undefined,
        abhaengigkeiten: [],
        materialien: [],
        handwerker: [],
        kosten: {
          min: undefined,
          max: undefined,
          einheit: '€'
        }
      });
      loadGewerke();
    } catch (err) {
      setError('Fehler beim Aktualisieren des Gewerks');
      console.error('Error updating gewerk:', err);
    }
  };

  const handleDeleteGewerk = async (gewerkId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Gewerk löschen möchten?')) return;
    
    try {
      await gewerkService.deleteGewerk(gewerkId);
      loadGewerke();
    } catch (err) {
      setError('Fehler beim Löschen des Gewerks');
      console.error('Error deleting gewerk:', err);
    }
  };

  const handleEditGewerk = (gewerk: Gewerk) => {
    setEditingGewerk(gewerk);
    setFormData({
      name: gewerk.name,
      beschreibung: gewerk.beschreibung || '',
      kategorie: gewerk.kategorie || '',
      standardDauer: gewerk.standardDauer,
      abhaengigkeiten: gewerk.abhaengigkeiten || [],
      materialien: gewerk.materialien || [],
      handwerker: gewerk.handwerker || [],
      kosten: gewerk.kosten || {
        min: undefined,
        max: undefined,
        einheit: '€'
      }
    });
    setShowEditModal(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKostenChange = (field: string, value: number | undefined) => {
    setFormData(prev => ({
      ...prev,
      kosten: {
        ...prev.kosten,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = formData[field as keyof CreateGewerkRequest] as string[] || [];
    if (value && !array.includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...array, value]
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const array = formData[field as keyof CreateGewerkRequest] as string[] || [];
    setFormData(prev => ({
      ...prev,
      [field]: array.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'geplant': return 'bg-blue-100 text-blue-800';
      case 'in Bearbeitung': return 'bg-yellow-100 text-yellow-800';
      case 'abgeschlossen': return 'bg-green-100 text-green-800';
      case 'pausiert': return 'bg-orange-100 text-orange-800';
      case 'storniert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wrench className="h-8 w-8 text-blue-600" />
              Gewerke-Verwaltung
            </h1>
            <p className="text-gray-600 mt-2">Verwalten Sie alle verfügbaren Gewerke und deren Eigenschaften</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Neues Gewerk
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Gewerke suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={filterKategorie}
                onChange={(e) => setFilterKategorie(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="alle">Alle Kategorien</option>
                {kategorien.map(kategorie => (
                  <option key={kategorie} value={kategorie}>{kategorie}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gewerke List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gewerk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dauer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kosten
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handwerker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGewerke.map((gewerk) => (
                  <tr key={gewerk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{gewerk.name}</div>
                        {gewerk.beschreibung && (
                          <div className="text-sm text-gray-500">{gewerk.beschreibung}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {gewerk.kategorie || 'Keine Kategorie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gewerk.standardDauer ? `${gewerk.standardDauer} Tage` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gewerk.kosten ? (
                        <div>
                          {gewerk.kosten.min && gewerk.kosten.max ? (
                            <span>{gewerk.kosten.min} - {gewerk.kosten.max} {gewerk.kosten.einheit}</span>
                          ) : gewerk.kosten.min ? (
                            <span>ab {gewerk.kosten.min} {gewerk.kosten.einheit}</span>
                          ) : gewerk.kosten.max ? (
                            <span>bis {gewerk.kosten.max} {gewerk.kosten.einheit}</span>
                          ) : '-'}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gewerk.handwerker && gewerk.handwerker.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {gewerk.handwerker.slice(0, 2).map((handwerker, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {handwerker}
                            </span>
                          ))}
                          {gewerk.handwerker.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{gewerk.handwerker.length - 2}
                            </span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditGewerk(gewerk)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGewerk(gewerk.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredGewerke.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Gewerke gefunden</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterKategorie !== 'alle' 
                  ? 'Versuchen Sie andere Suchkriterien.' 
                  : 'Erstellen Sie Ihr erstes Gewerk.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Neues Gewerk erstellen</h2>
              <GewerkForm
                formData={formData}
                onFormChange={handleFormChange}
                onKostenChange={handleKostenChange}
                onArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateGewerk}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Erstellen
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingGewerk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gewerk bearbeiten</h2>
              <GewerkForm
                formData={formData}
                onFormChange={handleFormChange}
                onKostenChange={handleKostenChange}
                onArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleUpdateGewerk}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Speichern
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

interface GewerkFormProps {
  formData: CreateGewerkRequest;
  onFormChange: (field: string, value: any) => void;
  onKostenChange: (field: string, value: number | undefined) => void;
  onArrayChange: (field: string, value: string) => void;
  removeArrayItem: (field: string, index: number) => void;
}

const GewerkForm: React.FC<GewerkFormProps> = ({
  formData,
  onFormChange,
  onKostenChange,
  onArrayChange,
  removeArrayItem
}) => {
  const [newMaterial, setNewMaterial] = useState('');
  const [newHandwerker, setNewHandwerker] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beschreibung
        </label>
        <textarea
          value={formData.beschreibung}
          onChange={(e) => onFormChange('beschreibung', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategorie
        </label>
        <input
          type="text"
          value={formData.kategorie}
          onChange={(e) => onFormChange('kategorie', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Standard-Dauer (Tage)
        </label>
        <input
          type="number"
          value={formData.standardDauer || ''}
          onChange={(e) => onFormChange('standardDauer', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kosten
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={formData.kosten?.min || ''}
            onChange={(e) => onKostenChange('min', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={formData.kosten?.max || ''}
            onChange={(e) => onKostenChange('max', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Einheit"
            value={formData.kosten?.einheit || ''}
            onChange={(e) => onKostenChange('einheit', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Materialien
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
            placeholder="Material hinzufügen"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onArrayChange('materialien', newMaterial);
                setNewMaterial('');
              }
            }}
          />
          <button
            onClick={() => {
              onArrayChange('materialien', newMaterial);
              setNewMaterial('');
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.materialien?.map((material, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {material}
              <button
                onClick={() => removeArrayItem('materialien', index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Handwerker
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newHandwerker}
            onChange={(e) => setNewHandwerker(e.target.value)}
            placeholder="Handwerker hinzufügen"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onArrayChange('handwerker', newHandwerker);
                setNewHandwerker('');
              }
            }}
          />
          <button
            onClick={() => {
              onArrayChange('handwerker', newHandwerker);
              setNewHandwerker('');
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.handwerker?.map((handwerker, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {handwerker}
              <button
                onClick={() => removeArrayItem('handwerker', index)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GewerkManagementPage; 