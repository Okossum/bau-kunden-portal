import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'delayed' | 'planning';
  progress: number;
  startDate: string;
  expectedCompletion: string;
  description: string;
}
const ProjectOverviewSection: React.FC = () => {
  const projects: Project[] = [{
    id: '1',
    name: 'Einfamilienhaus Musterstraße 15',
    status: 'in-progress',
    progress: 65,
    startDate: '15.03.2024',
    expectedCompletion: '20.08.2024',
    description: 'Rohbau abgeschlossen, Innenausbau läuft'
  }, {
    id: '2',
    name: 'Garage & Carport',
    status: 'in-progress',
    progress: 30,
    startDate: '01.05.2024',
    expectedCompletion: '15.07.2024',
    description: 'Fundament gelegt, Wände im Aufbau'
  }, {
    id: '3',
    name: 'Terrassenerweiterung',
    status: 'planning',
    progress: 10,
    startDate: '01.07.2024',
    expectedCompletion: '30.09.2024',
    description: 'Planung und Genehmigung in Bearbeitung'
  }];
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'delayed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'planning':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
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
        return <Building2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'in-progress':
        return 'In Bearbeitung';
      case 'delayed':
        return 'Verzögert';
      case 'planning':
        return 'Planung';
      default:
        return 'Unbekannt';
    }
  };
  const getProgressData = (progress: number) => [{
    name: 'Completed',
    value: progress,
    color: '#3b82f6'
  }, {
    name: 'Remaining',
    value: 100 - progress,
    color: '#e2e8f0'
  }];
  return <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
      <header className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
          Aktuelle Projekte
        </h2>
        <p className="text-slate-600">
          Übersicht über Ihre laufenden Bauprojekte
        </p>
      </header>

      <div className="space-y-6">
        {projects.map((project, index) => <motion.article key={project.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: index * 0.1
      }} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
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
                      <Pie data={getProgressData(project.progress)} cx="50%" cy="50%" innerRadius={25} outerRadius={35} startAngle={90} endAngle={-270} dataKey="value">
                        {getProgressData(project.progress).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
          </motion.article>)}
      </div>
    </section>;
};
export default ProjectOverviewSection;