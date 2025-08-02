import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ArrowLeft, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProjectService, { Project } from '../../services/projectService';
import ProjectProgressOverview from './ProjectProgressOverview';

interface ProjectProgressPageProps {
  projectId?: string;
  onNavigateToDashboard?: () => void;
  onNavigateToProjectManagement?: () => void;
}

const ProjectProgressPage: React.FC<ProjectProgressPageProps> = ({ 
  projectId,
  onNavigateToDashboard,
  onNavigateToProjectManagement
}) => {
  const { currentUser, userData } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load project details
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, currentUser?.uid, userData?.tenantId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.uid || !userData || !projectId) {
        throw new Error('Benutzer nicht authentifiziert oder Projekt-ID fehlt');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      const projectData = await ProjectService.getProjectById(projectId);
      
      if (!projectData) {
        throw new Error('Projekt nicht gefunden');
      }

      setProject(projectData);
    } catch (error: any) {
      console.error('Error loading project:', error);
      setError(error.message || 'Fehler beim Laden des Projekts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Lade Projektfortschritt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Fehler beim Laden</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              {onNavigateToProjectManagement && (
                <button
                  onClick={onNavigateToProjectManagement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zurück zur Projektverwaltung
                </button>
              )}
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Zum Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Projekt nicht gefunden</h2>
            <p className="text-slate-500 mb-4">Das angeforderte Projekt konnte nicht geladen werden.</p>
            <div className="flex justify-center gap-4">
              {onNavigateToProjectManagement && (
                <button
                  onClick={onNavigateToProjectManagement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zurück zur Projektverwaltung
                </button>
              )}
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Zum Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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
                <h1 className="text-3xl font-bold text-slate-900">Projektfortschritt</h1>
                <p className="text-slate-600 mt-1">
                  {project.projectName} - Baufortschritt verfolgen
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToProjectManagement && (
                <button
                  onClick={onNavigateToProjectManagement}
                  className="px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Zurück zur Projektverwaltung
                </button>
              )}
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Zum Dashboard
                </button>
              )}
              <button
                onClick={loadProject}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Aktualisieren
              </button>
            </div>
          </div>
        </header>

        {/* Project Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Projektdetails</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium">Name:</span> {project.projectName}</p>
                <p><span className="font-medium">Status:</span> {project.status}</p>
                <p><span className="font-medium">Beschreibung:</span> {project.description || 'Keine Beschreibung verfügbar'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Zeitplan</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium">Start:</span> {project.plannedStartDate.toLocaleDateString('de-DE')}</p>
                <p><span className="font-medium">Ende:</span> {project.plannedEndDate.toLocaleDateString('de-DE')}</p>
                <p><span className="font-medium">Dauer:</span> {Math.ceil((project.plannedEndDate.getTime() - project.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24))} Tage</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Standort</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium">Adresse:</span></p>
                <p>{project.address?.street} {project.address?.houseNumber}</p>
                <p>{project.address?.postalCode} {project.address?.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Progress Overview */}
        <ProjectProgressOverview 
          projectId={project.id!}
          projectName={project.projectName}
        />
      </motion.div>
    </div>
  );
};

export default ProjectProgressPage; 