import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import ProjectService, { Project as FirebaseProject } from '../../services/projectService';


interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'delayed' | 'planning';
  progress: number;
  startDate: string;
  expectedCompletion: string;
  description: string;
}

interface ProjectOverviewSectionProps {
  onNavigateToDashboard?: () => void;
  onNavigateToProjectManagement?: () => void;
  onNavigateToProjectProgress?: (projectId: string) => void;
}

const ProjectOverviewSection: React.FC<ProjectOverviewSectionProps> = ({ 
  onNavigateToDashboard, 
  onNavigateToProjectManagement,
  onNavigateToProjectProgress
}) => {
  const { currentUser, userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load projects from Firebase
  useEffect(() => {
    loadProjects();
  }, [currentUser?.uid, userData?.tenantId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.uid || !userData) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const tenantId = userData.tenantId || currentUser.uid;
      const firebaseProjects = await ProjectService.getProjectsByTenant(tenantId);
      
      // Load progress data for each project
      const projectsWithProgress = await Promise.all(
        firebaseProjects.map(async (project) => {
          // For now, use calculated progress until Phase 2 is fully integrated
          return {
            id: project.id || '',
            name: project.projectName,
            status: mapFirebaseStatusToDashboard(project.status),
            progress: calculateProgress(project),
            startDate: formatDate(project.plannedStartDate),
            expectedCompletion: formatDate(project.plannedEndDate),
            description: project.description || 'Keine Beschreibung verfügbar'
          };
        })
      );

      setProjects(projectsWithProgress);
    } catch (error: any) {
      console.error('Error loading projects for dashboard:', error);
      setError(error.message || 'Fehler beim Laden der Projekte');
      // Fallback to empty array instead of mock data
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Map Firebase status to dashboard status
  const mapFirebaseStatusToDashboard = (firebaseStatus: string): Project['status'] => {
    switch (firebaseStatus) {
      case 'abgeschlossen':
        return 'completed';
      case 'in Bau':
        return 'in-progress';
      case 'pausiert':
      case 'storniert':
        return 'delayed';
      case 'geplant':
      default:
        return 'planning';
    }
  };

  // Calculate progress based on dates and status (fallback)
  const calculateProgress = (project: FirebaseProject): number => {
    const now = new Date();
    const startDate = project.plannedStartDate;
    const endDate = project.plannedEndDate;
    
    if (project.status === 'abgeschlossen') return 100;
    if (project.status === 'storniert') return 0;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (totalDuration <= 0) return 0;
    
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    return Math.round(progress);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE');
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'delayed':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'planning':
      default:
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4" />;
      case 'planning':
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'in-progress':
        return 'In Bau';
      case 'delayed':
        return 'Verzögert';
      case 'planning':
      default:
        return 'Planung';
    }
  };

  const getProgressData = (progress: number) => [{
    value: progress,
    color: progress === 100 ? '#10b981' : '#3b82f6'
  }, {
    value: 100 - progress,
    color: '#f1f5f9'
  }];

  const handleProjectClick = (projectId: string) => {
    if (onNavigateToProjectProgress) {
      onNavigateToProjectProgress(projectId);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Aktuelle Projekte
            </h2>
            <p className="text-slate-600">
              Übersicht über Ihre laufenden Bauprojekte
            </p>
          </div>
          <div className="flex gap-3">
            {onNavigateToProjectManagement && (
              <button
                onClick={onNavigateToProjectManagement}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <Building2 className="w-4 h-4" />
                Zur Projektverwaltung
              </button>
            )}
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Lade Projekte...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Fehler beim Laden der Projekte</p>
            <p className="text-slate-600 text-sm">{error}</p>
          </div>
        )}
        
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Keine Projekte gefunden</p>
            <p className="text-slate-500 text-sm">Erstellen Sie Ihr erstes Projekt in der Projektverwaltung</p>
          </div>
        )}
        
        {!loading && !error && projects.length > 0 && projects.map((project, index) => (
          <motion.article 
            key={project.id} 
            initial={{
              opacity: 0,
              y: 20
            }} 
            animate={{
              opacity: 1,
              y: 0
            }} 
            transition={{
              duration: 0.5,
              delay: index * 0.1
            }} 
            className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Project Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </h3>
                  <span className={`
                    inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border
                    ${getStatusColor(project.status)}
                  `}>
                    {getStatusIcon(project.status)}
                    {getStatusText(project.status)}
                  </span>
                </div>
                
                <p className="text-slate-600 mb-3">
                  {project.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-500">
                  <span>
                    <strong>Start:</strong> {project.startDate}
                  </span>
                  <span>
                    <strong>Fertigstellung:</strong> {project.expectedCompletion}
                  </span>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={getProgressData(project.progress)} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={25} 
                        outerRadius={35} 
                        startAngle={90} 
                        endAngle={-270} 
                        dataKey="value"
                      >
                        {getProgressData(project.progress).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {project.progress}%
                  </div>
                  <div className="text-sm text-slate-500">
                    Fortschritt
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default ProjectOverviewSection;