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
  Calendar, 
  MapPin, 
  User, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  X,
  Database,
  Grid3X3,
  List,
  ArrowLeft,
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProjectService, { Project } from '../../services/projectService';
import ProjectForm from './ProjectForm';


interface ProjectManagementPageProps {
  onNavigateToDashboard?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToProjectProgress?: (projectId: string) => void;
}

const ProjectManagementPage: React.FC<ProjectManagementPageProps> = ({
  onNavigateToDashboard,
  onNavigateToUserManagement,
  onNavigateToProjectProgress
}) => {
  const { currentUser, userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [currentUser?.uid, userData?.tenantId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading projects...');
      console.log('Current user:', currentUser?.uid);
      console.log('User data:', userData);
      
      if (!currentUser?.uid || !userData) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      console.log('Using tenantId:', tenantId);
      
      const fetchedProjects = await ProjectService.getProjectsByTenant(tenantId);
      console.log('Fetched projects:', fetchedProjects);
      
      setProjects(fetchedProjects);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      setError(error.message || 'Fehler beim Laden der Projekte');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.uid || !userData) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      const searchResults = await ProjectService.searchProjects(tenantId, searchTerm);
      setProjects(searchResults);
    } catch (error: any) {
      console.error('Error searching projects:', error);
      setError(error.message || 'Fehler bei der Projektsuche');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(undefined);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Sind Sie sicher, dass Sie das Projekt "${project.projectName}" löschen möchten?`)) {
      return;
    }

    try {
      if (project.id) {
        await ProjectService.deleteProject(project.id);
        setProjects(prev => prev.filter(p => p.id !== project.id));
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(error.message || 'Fehler beim Löschen des Projekts');
    }
  };

  const handleSaveProject = (savedProject: Project) => {
    if (formMode === 'create') {
      setProjects(prev => [savedProject, ...prev]);
    } else {
      setProjects(prev => prev.map(p => p.id === savedProject.id ? savedProject : p));
    }
    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleCreateTestData = async () => {
    try {
      setLoading(true);
      await ProjectService.createTestData();
      alert('Projekt-Testdaten erfolgreich erstellt! 15 Projekte wurden zur Datenbank hinzugefügt.');
      // Reload projects to show the new test data
      await loadProjects();
    } catch (error: any) {
      console.error('Error creating project test data:', error);
      alert(`Fehler beim Erstellen der Projekt-Testdaten: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      setLoading(true);
      await ProjectService.createProjectsCollection();
      alert('Projekte Collection erfolgreich erstellt!');
      // Reload projects to show the new collection
      await loadProjects();
    } catch (error: any) {
      console.error('Error creating projects collection:', error);
      alert(`Fehler beim Erstellen der Projekte Collection: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePhasesAndTrades = async () => {
    try {
      setLoading(true);
      // TODO: Implement Phase 2 initialization when ready
      alert('Phase 2 Initialisierung wird in Kürze implementiert!');
    } catch (error: any) {
      console.error('Error initializing phases and trades:', error);
      alert('Fehler beim Initialisieren der Phasen und Gewerke: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'geplant':
        return 'bg-blue-100 text-blue-800';
      case 'in Bau':
        return 'bg-green-100 text-green-800';
      case 'abgeschlossen':
        return 'bg-gray-100 text-gray-800';
      case 'pausiert':
        return 'bg-yellow-100 text-yellow-800';
      case 'storniert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'geplant':
        return <Clock className="w-4 h-4" />;
      case 'in Bau':
        return <CheckCircle className="w-4 h-4" />;
      case 'abgeschlossen':
        return <CheckCircle className="w-4 h-4" />;
      case 'pausiert':
        return <Pause className="w-4 h-4" />;
      case 'storniert':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }
    return true;
  });

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject}
        onSave={handleSaveProject}
        onCancel={handleCancelForm}
        mode={formMode}
      />
    );
  }

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
                <h1 className="text-3xl font-bold text-slate-900">Projektverwaltung</h1>
                <p className="text-slate-600 mt-1">Bauprojekte verwalten und überwachen</p>
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
              <button
                onClick={handleCreateCollection}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Database className="w-5 h-5" />
                Collection erstellen
              </button>
              <button
                onClick={handleInitializePhasesAndTrades}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Layers className="w-5 h-5" />
                Phasen & Gewerke
              </button>
              <button
                onClick={handleCreateTestData}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Database className="w-5 h-5" />
                Testdaten erstellen
              </button>
              <button
                onClick={handleCreateProject}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Neues Projekt
              </button>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Projekte suchen..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">Alle Status</option>
                <option value="geplant">Geplant</option>
                <option value="in Bau">In Bau</option>
                <option value="abgeschlossen">Abgeschlossen</option>
                <option value="pausiert">Pausiert</option>
                <option value="storniert">Storniert</option>
              </select>
              <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                  Liste
                </button>
              </div>
              <button
                onClick={loadProjects}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Lade Projekte...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏗️</div>
            <p className="text-slate-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Keine Projekte gefunden.'
                : 'Noch keine Projekte vorhanden.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleCreateProject}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Erstes Projekt erstellen
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {project.projectName}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {project.projectId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            {project.status}
                          </span>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="space-y-3 mb-4">
                        {project.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Construction Types */}
                        <div className="flex flex-wrap gap-1">
                          {project.constructionTypes.map((type) => (
                            <span
                              key={type}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                            >
                              {type}
                            </span>
                          ))}
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {project.address.street && `${project.address.street}, `}
                            {project.address.zipCode} {project.address.city}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(project.plannedStartDate)} - {formatDate(project.plannedEndDate)}
                          </span>
                        </div>

                        {/* Client */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4" />
                          <span className="truncate">{project.client.name}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                        {onNavigateToProjectProgress && (
                          <button
                            onClick={() => onNavigateToProjectProgress(project.id!)}
                            className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                            title="Fortschritt anzeigen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Projekt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Adresse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Zeitraum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Kunde
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredProjects.map((project) => (
                        <motion.tr
                          key={project.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {project.projectName}
                              </div>
                              <div className="text-sm text-slate-500">
                                {project.projectId}
                              </div>
                              {project.description && (
                                <div className="text-sm text-slate-600 mt-1 line-clamp-1">
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {project.address.street && `${project.address.street}, `}
                                {project.address.zipCode} {project.address.city}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(project.plannedStartDate)} - {formatDate(project.plannedEndDate)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{project.client.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {onNavigateToProjectProgress && (
                                <button
                                  onClick={() => onNavigateToProjectProgress(project.id!)}
                                  className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                                  title="Fortschritt anzeigen"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditProject(project)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Bearbeiten"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                title="Löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Project Count */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500">
            {filteredProjects.length} Projekt{filteredProjects.length !== 1 ? 'e' : ''} gefunden
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectManagementPage; 