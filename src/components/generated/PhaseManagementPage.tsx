import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  History,
  Info,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { phaseService } from '../../services/phaseService';
import { PhaseWithTrades } from '../../services/phaseService';
import ProjectService, { Project } from '../../services/projectService';
import { eigenleistungService } from '../../services/eigenleistungService';

interface PhaseManagementPageProps {
  onNavigateToDashboard?: () => void;
  onNavigateToProjectManagement?: () => void;
}

const PhaseManagementPage: React.FC<PhaseManagementPageProps> = ({
  onNavigateToDashboard,
  onNavigateToProjectManagement
}) => {
  const { currentUser, userData } = useAuth();
  const [phases, setPhases] = useState<PhaseWithTrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [showHistorie, setShowHistorie] = useState(false);
  const [selectedTradeHistorie, setSelectedTradeHistorie] = useState<{
    phaseId: string;
    tradeId: string;
    tradeName: string;
    phaseName: string;
  } | null>(null);
  const [historieData, setHistorieData] = useState<Array<{
    datum: Date;
    von: string;
    wert: boolean;
    kommentar?: string;
  }>>([]);

  // Load phases on component mount
  useEffect(() => {
    loadProjects();
  }, [currentUser?.uid, userData?.tenantId]);

  useEffect(() => {
    if (selectedProject) {
      loadPhases();
    }
  }, [selectedProject, currentUser?.uid, userData?.tenantId]);

  const loadProjects = async () => {
    try {
      if (!currentUser?.uid || !userData) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      const fetchedProjects = await ProjectService.getProjectsByTenant(tenantId);
      setProjects(fetchedProjects);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      setError(error.message || 'Fehler beim Laden der Projekte');
    }
  };

  const loadPhases = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.uid || !userData || !selectedProject) {
        return;
      }

      const tenantId = userData.tenantId || currentUser.uid;
      const phasesWithProgress = await phaseService.getPhasesWithProgress(selectedProject, tenantId);
      
      // Zusätzliche Sortierung nach Reihenfolge (falls nötig)
      const sortedPhases = phasesWithProgress.sort((a, b) => a.reihenfolge - b.reihenfolge);
      
      setPhases(sortedPhases);
    } catch (error: any) {
      console.error('Error loading phases:', error);
      setError(error.message || 'Fehler beim Laden der Phasen');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  const handleCreatePhase = () => {
    // TODO: Implement phase creation
    alert('Phasen-Erstellung wird implementiert');
  };

  const handleEditPhase = (phase: PhaseWithTrades) => {
    // TODO: Implement phase editing
    alert(`Phase bearbeiten: ${phase.name}`);
  };

  const handleDeletePhase = async (phase: PhaseWithTrades) => {
    if (!confirm(`Sind Sie sicher, dass Sie die Phase "${phase.name}" löschen möchten?`)) {
      return;
    }

    try {
      if (!currentUser?.uid || !userData || !selectedProject) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      await phaseService.deletePhase(selectedProject, tenantId, phase.id);
      
      // Reload phases
      await loadPhases();
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      alert('Fehler beim Löschen der Phase: ' + error.message);
    }
  };

  const handleInitializeDefaultPhases = async () => {
    try {
      if (!currentUser?.uid || !userData || !selectedProject) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      await phaseService.initializeDefaultPhases(selectedProject, tenantId, currentUser.uid);
      
      // Reload phases
      await loadPhases();
      alert('Standard-Phasen erfolgreich initialisiert!');
    } catch (error: any) {
      console.error('Error initializing default phases:', error);
      alert('Fehler beim Initialisieren der Standard-Phasen: ' + error.message);
    }
  };

  const handleToggleEigenleistung = async (
    phaseId: string,
    tradeId: string,
    currentEigenleistung: boolean
  ) => {
    try {
      if (!currentUser?.uid || !userData || !selectedProject) {
        throw new Error('Benutzer nicht authentifiziert oder kein Projekt ausgewählt');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      const newEigenleistung = !currentEigenleistung;
      
      await phaseService.setTradeEigenleistung(
        selectedProject,
        phaseId,
        tradeId,
        tenantId,
        newEigenleistung,
        currentUser.uid,
        `Eigenleistung ${newEigenleistung ? 'aktiviert' : 'deaktiviert'}`
      );
      
      // Reload phases to show updated data
      loadPhases();
    } catch (error: any) {
      console.error('Error toggling eigenleistung:', error);
      alert('Fehler beim Ändern der Eigenleistung: ' + error.message);
    }
  };

  const handleShowHistorie = async (
    phaseId: string,
    tradeId: string,
    tradeName: string,
    phaseName: string
  ) => {
    try {
      if (!currentUser?.uid || !userData || !selectedProject) {
        throw new Error('Benutzer nicht authentifiziert oder kein Projekt ausgewählt');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      
      // Load historie data
      const historie = await eigenleistungService.getEigenleistungHistorie(
        tenantId,
        selectedProject,
        phaseId,
        tradeId
      );
      
      setHistorieData(historie);
      setSelectedTradeHistorie({ phaseId, tradeId, tradeName, phaseName });
      setShowHistorie(true);
    } catch (error: any) {
      console.error('Error loading historie:', error);
      alert('Fehler beim Laden der Historie: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv':
        return 'bg-green-100 text-green-800';
      case 'inaktiv':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aktiv':
        return <CheckCircle className="w-4 h-4" />;
      case 'inaktiv':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredPhases = phases.filter(phase => {
    if (statusFilter !== 'all' && phase.status !== statusFilter) {
      return false;
    }
    if (searchTerm && !phase.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Phasen-Verwaltung</h1>
                <p className="text-slate-600 mt-1">Projektphasen und Gewerke verwalten</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Zurück zum Dashboard
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Project Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Projekt auswählen
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Projekt auswählen...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Phasen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Status</option>
              <option value="aktiv">Aktiv</option>
              <option value="inaktiv">Inaktiv</option>
            </select>
            
            <button
              onClick={handleCreatePhase}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Neue Phase
            </button>
            
            <button
              onClick={handleInitializeDefaultPhases}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Standard-Phasen
            </button>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedProject ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Kein Projekt ausgewählt</h3>
            <p className="text-slate-600">Bitte wählen Sie ein Projekt aus, um die Phasen anzuzeigen.</p>
          </div>
        ) : filteredPhases.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Phasen gefunden</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Keine Phasen entsprechen den aktuellen Filterkriterien.'
                : 'Für dieses Projekt wurden noch keine Phasen erstellt.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleInitializeDefaultPhases}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <CheckCircle className="w-4 h-4" />
                Standard-Phasen erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPhases.map((phase) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{phase.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(phase.status || 'aktiv')}`}>
                        {getStatusIcon(phase.status || 'aktiv')}
                        {phase.status || 'aktiv'}
                      </span>
                    </div>
                    {phase.beschreibung && (
                      <p className="text-slate-600 mb-3">{phase.beschreibung}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Reihenfolge: {phase.reihenfolge}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {phase.trades.length} Gewerke
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPhase(phase)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhase(phase)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Trades */}
                {phase.trades.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Gewerke ({phase.trades.length})</h4>
                    <div className="grid gap-2">
                      {phase.trades.slice(0, 3).map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-slate-900">{trade.name}</p>
                              {/* Eigenleistung Badge */}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                trade.eigenleistung 
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {trade.eigenleistung ? 'Eigenleistung' : 'Fremdleistung'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${trade.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-500">{trade.progress || 0}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Historie Button */}
                            <button
                              onClick={() => handleShowHistorie(phase.id, trade.id, trade.name, phase.name)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Eigenleistungs-Historie anzeigen"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            {/* Eigenleistung Toggle */}
                            <button
                              onClick={() => handleToggleEigenleistung(phase.id, trade.id, trade.eigenleistung || false)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                trade.eigenleistung
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              title={trade.eigenleistung ? 'Eigenleistung deaktivieren' : 'Eigenleistung aktivieren'}
                            >
                              {trade.eigenleistung ? 'Eigenleistung' : 'Fremdleistung'}
                            </button>
                          </div>
                        </div>
                      ))}
                      {phase.trades.length > 3 && (
                        <p className="text-sm text-slate-500 text-center py-2">
                          +{phase.trades.length - 3} weitere Gewerke
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Historie Modal */}
        {showHistorie && selectedTradeHistorie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistorie(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Eigenleistungs-Historie
                      </h3>
                      <p className="text-slate-600 mt-1">
                        {selectedTradeHistorie.tradeName} - {selectedTradeHistorie.phaseName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistorie(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {historieData.length === 0 ? (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Keine Historie verfügbar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historieData.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                      >
                        <div className={`p-2 rounded-full ${
                          entry.wert ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {entry.wert ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">
                              {entry.wert ? 'Eigenleistung aktiviert' : 'Eigenleistung deaktiviert'}
                            </span>
                            <span className="text-sm text-slate-500">
                              von {entry.von}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600">
                            {entry.datum.toLocaleString('de-DE')}
                          </div>
                          {entry.kommentar && (
                            <div className="text-sm text-slate-700 mt-2 italic">
                              "{entry.kommentar}"
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PhaseManagementPage; 