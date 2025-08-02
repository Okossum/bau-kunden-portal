import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Download, 
  Calendar,
  User,
  Building2,
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { eigenleistungService } from '../../services/eigenleistungService';
import ProjectService, { Project } from '../../services/projectService';
import { phaseService } from '../../services/phaseService';

interface EigenleistungReportPageProps {
  onNavigateToDashboard?: () => void;
  onNavigateToPhaseManagement?: () => void;
}

const EigenleistungReportPage: React.FC<EigenleistungReportPageProps> = ({
  onNavigateToDashboard,
  onNavigateToPhaseManagement
}) => {
  const { currentUser, userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [currentUser?.uid, userData?.tenantId]);

  useEffect(() => {
    if (selectedProject) {
      loadReportData();
    }
  }, [selectedProject]);

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

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.uid || !userData || !selectedProject) {
        return;
      }

      const tenantId = userData.tenantId || currentUser.uid;
      
      // Load comprehensive report
      const report = await eigenleistungService.generateEigenleistungReport(tenantId, selectedProject);
      setReportData(report);
      
      // Load stats
      const projectStats = await eigenleistungService.getEigenleistungStats(tenantId, selectedProject);
      setStats(projectStats);
    } catch (error: any) {
      console.error('Error loading report data:', error);
      setError(error.message || 'Fehler beim Laden der Report-Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;
    
    // Create CSV content
    const csvContent = generateCSVContent(reportData);
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eigenleistung-report-${selectedProject}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = (data: any): string => {
    let csv = 'Projekt,Phase,Gewerk,Eigenleistung,Zuletzt geändert,Von\n';
    
    data.phases.forEach((phase: any) => {
      phase.trades.forEach((trade: any) => {
        csv += `"${data.projectId}","${phase.phaseName}","${trade.tradeName}","${trade.eigenleistung ? 'Ja' : 'Nein'}","${trade.lastChanged.toLocaleDateString('de-DE')}","${trade.changedBy}"\n`;
      });
    });
    
    return csv;
  };

  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.projectName || projectId;
  };

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
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Eigenleistungs-Report</h1>
                <p className="text-slate-600 mt-1">Detaillierte Analyse der Eigenleistungen</p>
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Lade Report-Daten...</p>
          </div>
        )}

        {/* Report Content */}
        {!loading && selectedProject && reportData && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Gesamt Gewerke</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalTrades}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Eigenleistung</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.eigenleistungTrades}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Fremdleistung</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.unternehmerTrades}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Eigenleistung %</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.eigenleistungPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExportReport}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Report exportieren (CSV)
              </button>
            </div>

            {/* Detailed Report */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Detaillierter Report: {getProjectName(selectedProject)}
                </h3>
                <p className="text-slate-600 mt-1">
                  Erstellt am {reportData.generatedAt.toLocaleDateString('de-DE')} um {reportData.generatedAt.toLocaleTimeString('de-DE')}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Phase
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Gewerk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Eigenleistung
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Zuletzt geändert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Von
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {reportData.phases.map((phase: any) =>
                      phase.trades.map((trade: any, index: number) => (
                        <tr key={`${phase.phaseId}-${trade.tradeId}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {phase.phaseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {trade.tradeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trade.eigenleistung 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {trade.eigenleistung ? 'Ja' : 'Nein'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {trade.lastChanged.toLocaleDateString('de-DE')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {trade.changedBy}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && selectedProject && !reportData && (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Keine Report-Daten verfügbar</p>
          </div>
        )}

        {/* No Project Selected */}
        {!selectedProject && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Bitte wählen Sie ein Projekt aus, um den Report zu generieren</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EigenleistungReportPage; 