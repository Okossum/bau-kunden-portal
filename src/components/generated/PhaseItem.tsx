import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { PhaseWithTrades, TradeWithProgress } from '../../services/phaseService';
import TradeItem from './TradeItem';

interface PhaseItemProps {
  phase: PhaseWithTrades;
  isExpanded: boolean;
  onToggle: () => void;
  onTradeProgressUpdate: (
    phaseId: string,
    tradeId: string,
    status: 'Geplant' | 'In Arbeit' | 'Fertig' | 'Abgenommen',
    progress: number
  ) => void;
}

const PhaseItem: React.FC<PhaseItemProps> = ({
  phase,
  isExpanded,
  onToggle,
  onTradeProgressUpdate
}) => {
  // Calculate phase progress
  const phaseProgress = phase.trades.length > 0 
    ? Math.round(phase.trades.reduce((sum, trade) => sum + trade.progress, 0) / phase.trades.length)
    : 0;

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

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-100 text-green-800 border-green-200';
    if (progress >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (progress >= 25) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = (progress: number) => {
    if (progress >= 100) return 'Abgeschlossen';
    if (progress >= 75) return 'Fast fertig';
    if (progress >= 50) return 'In Arbeit';
    if (progress >= 25) return 'Gestartet';
    return 'Geplant';
  };

  const completedTrades = phase.trades.filter(trade => 
    trade.status === 'Fertig' || trade.status === 'Abgenommen'
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Phase Header */}
      <button 
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              )}
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {phase.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>{phase.trades.length} Gewerke</span>
                <span>•</span>
                <span>{completedTrades} abgeschlossen</span>
                <span>•</span>
                <span className={getProgressColor(phaseProgress)}>
                  {phaseProgress}% Fortschritt
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(phaseProgress)}`}>
              {getStatusText(phaseProgress)}
            </span>

            {/* Progress Display */}
            <div className="text-right">
              <div className={`text-xl font-bold ${getProgressColor(phaseProgress)}`}>
                {phaseProgress}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(phaseProgress)}`}
              initial={{ width: 0 }}
              animate={{ width: `${phaseProgress}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
        </div>
      </button>

      {/* Trades List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-3 border-t border-slate-100">
              {phase.trades.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">Keine Gewerke in dieser Phase</p>
                </div>
              ) : (
                phase.trades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TradeItem
                      trade={trade}
                      onProgressUpdate={(status, progress) => 
                        onTradeProgressUpdate(phase.id, trade.id, status, progress)
                      }
                    />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhaseItem;