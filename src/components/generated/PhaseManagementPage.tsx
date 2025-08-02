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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { phaseService } from '../../services/phaseService';
import { PhaseWithTrades } from '../../services/phaseService';
import ProjectService, { Project } from '../../services/projectService';

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
                            <p className="text-sm font-medium text-slate-900">{trade.name}</p>
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
      </motion.div>
    </div>
  );
};

export default PhaseManagementPage; 