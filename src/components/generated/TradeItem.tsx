import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp,
  Clock, 
  Play, 
  CheckCircle, 
  Award,
  Settings
} from 'lucide-react';
import { TradeWithProgress } from '../../services/phaseService';

interface TradeItemProps {
  trade: TradeWithProgress;
  onProgressUpdate: (
    status: 'Geplant' | 'In Arbeit' | 'Fertig' | 'Abgenommen',
    progress: number
  ) => void;
}

const TradeItem: React.FC<TradeItemProps> = ({ trade, onProgressUpdate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProgressSliderOpen, setIsProgressSliderOpen] = useState(false);

  const statusOptions = [
    { value: 'Geplant', label: 'Geplant', icon: Clock, color: 'text-slate-600', bgColor: 'bg-slate-100' },
    { value: 'In Arbeit', label: 'In Arbeit', icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'Fertig', label: 'Fertig', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'Abgenommen', label: 'Abgenommen', icon: Award, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  const currentStatus = statusOptions.find(option => option.value === trade.status) || statusOptions[0];

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

  const handleStatusChange = (status: 'Geplant' | 'In Arbeit' | 'Fertig' | 'Abgenommen') => {
    let progress = trade.progress;
    
    // Auto-adjust progress based on status
    switch (status) {
      case 'Geplant':
        progress = 0;
        break;
      case 'In Arbeit':
        progress = Math.max(progress, 25);
        break;
      case 'Fertig':
        progress = Math.max(progress, 75);
        break;
      case 'Abgenommen':
        progress = 100;
        break;
    }
    
    onProgressUpdate(status, progress);
    setIsDropdownOpen(false);
  };

  const handleProgressChange = (newProgress: number) => {
    let status = trade.status;
    
    // Auto-adjust status based on progress
    if (newProgress >= 100) {
      status = 'Abgenommen';
    } else if (newProgress >= 75) {
      status = 'Fertig';
    } else if (newProgress >= 25) {
      status = 'In Arbeit';
    } else {
      status = 'Geplant';
    }
    
    onProgressUpdate(status, newProgress);
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 hover:bg-slate-100 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 truncate">
            {trade.name}
          </h4>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {/* Progress Display */}
          <div className="text-right">
            <div className={`text-sm font-bold ${getProgressColor(trade.progress)}`}>
              {trade.progress}%
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-white transition-colors ${currentStatus.bgColor} ${currentStatus.color} border-slate-200`}
            >
              <currentStatus.icon className="w-3 h-3" />
              <span>{currentStatus.label}</span>
              {isDropdownOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10"
                >
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value as any)}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2 first:rounded-t-md last:rounded-b-md ${
                          trade.status === option.value ? 'bg-slate-100 font-medium' : ''
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {option.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Slider Toggle */}
          <button
            onClick={() => setIsProgressSliderOpen(!isProgressSliderOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors"
            title="Fortschritt anpassen"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
        <motion.div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(trade.progress)}`}
          initial={{ width: 0 }}
          animate={{ width: `${trade.progress}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      </div>

      {/* Progress Slider */}
      <AnimatePresence>
        {isProgressSliderOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 min-w-[2rem]">0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trade.progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-slate-600 min-w-[3rem]">100%</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-xs text-slate-600">
                  Aktueller Fortschritt: {trade.progress}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TradeItem;