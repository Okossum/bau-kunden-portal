import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PhaseService } from '../../services/phaseService';
import { PhaseWithTrades, TradeWithProgress } from '../../services/phaseService';
import PhaseItem from './PhaseItem';

interface ProjectProgressOverviewProps {
  projectId: string;
  projectName?: string;
}

const ProjectProgressOverview: React.FC<ProjectProgressOverviewProps> = ({ 
  projectId, 
  projectName = 'Projekt' 
}) => {
  const { currentUser, userData } = useAuth();
  const [phases, setPhases] = useState<PhaseWithTrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // Load phases and progress on component mount
  useEffect(() => {
    loadPhasesAndProgress();
  }, [projectId, currentUser?.uid, userData?.tenantId]);

  const loadPhasesAndProgress = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser?.uid || !userData) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const phaseService = new PhaseService();
      const tenantId = userData.tenantId || currentUser.uid;
      const phasesWithProgress = await phaseService.getPhasesWithProgress(projectId, tenantId);
      
      setPhases(phasesWithProgress);
      
      // Calculate overall progress
      const overall = phaseService.calculateOverallProgress(phasesWithProgress);
      setOverallProgress(overall);
      
      // Expand first phase by default
      if (phasesWithProgress.length > 0) {
        setExpandedPhases(new Set([phasesWithProgress[0].id]));
      }
      
    } catch (error: any) {
      console.error('Error loading phases and progress:', error);
      setError(error.message || 'Fehler beim Laden der Projektphasen');
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseToggle = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleTradeProgressUpdate = async (
    phaseId: string,
    tradeId: string,
    status: 'Geplant' | 'In Arbeit' | 'Fertig' | 'Abgenommen',
    progress: number
  ) => {
    try {
      if (!currentUser?.uid || !userData) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      const phaseService = new PhaseService();
      const tenantId = userData.tenantId || currentUser.uid;
      
      // Update progress in Firestore
      await phaseService.updateTradeProgress(
        projectId,
        phaseId,
        tradeId,
        status,
        progress,
        tenantId
      );

      // Reload phases and progress
      await loadPhasesAndProgress();
      
    } catch (error: any) {
      console.error('Error updating trade progress:', error);
      setError(error.message || 'Fehler beim Aktualisieren des Fortschritts');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Projektfortschritt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Fehler beim Laden des Projektfortschritts</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
              Projektfortschritt: {projectName}
            </h2>
            <p className="text-slate-600">
              Übersicht über alle Bauphasen und Gewerke
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getProgressColor(overallProgress)}`}>
                {overallProgress}%
              </div>
              <div className="text-sm text-slate-500">Gesamtfortschritt</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={getProgressBarColor(overallProgress)}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${overallProgress}, 100`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(overallProgress)}`}
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </header>

      {/* Phases List */}
      <div className="space-y-4">
        {phases.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Keine Projektphasen gefunden</p>
            <p className="text-slate-500 text-sm">Initialisieren Sie die Phasen und Gewerke in der Datenbank</p>
          </div>
        ) : (
          phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <PhaseItem
                phase={phase}
                isExpanded={expandedPhases.has(phase.id)}
                onToggle={() => handlePhaseToggle(phase.id)}
                onTradeProgressUpdate={handleTradeProgressUpdate}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Summary */}
      {phases.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {phases.length}
              </div>
              <div className="text-sm text-blue-700">Bauphasen</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {phases.reduce((sum, phase) => sum + phase.trades.length, 0)}
              </div>
              <div className="text-sm text-green-700">Gewerke</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {phases.reduce((sum, phase) => 
                  sum + phase.trades.filter(trade => trade.status === 'Fertig' || trade.status === 'Abgenommen').length, 0
                )}
              </div>
              <div className="text-sm text-purple-700">Abgeschlossen</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgressOverview;