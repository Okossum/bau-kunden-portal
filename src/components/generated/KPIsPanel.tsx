import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Euro, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
interface KPI {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{
    className?: string;
  }>;
  color: string;
}
const KPIsPanel: React.FC = () => {
  const kpis: KPI[] = [{
    id: '1',
    title: 'Projektfortschritt',
    value: '68%',
    change: '+12% diese Woche',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-green-600'
  }, {
    id: '2',
    title: 'Verbleibende Zeit',
    value: '45 Tage',
    change: 'Im Zeitplan',
    trend: 'neutral',
    icon: Clock,
    color: 'text-blue-600'
  }, {
    id: '3',
    title: 'Budget Status',
    value: '€ 285.000',
    change: '92% verwendet',
    trend: 'up',
    icon: Euro,
    color: 'text-amber-600'
  }, {
    id: '4',
    title: 'Nächste Termine',
    value: '3',
    change: 'Diese Woche',
    trend: 'neutral',
    icon: Calendar,
    color: 'text-purple-600'
  }];
  const progressData = [{
    name: 'Jan',
    value: 20
  }, {
    name: 'Feb',
    value: 35
  }, {
    name: 'Mär',
    value: 45
  }, {
    name: 'Apr',
    value: 55
  }, {
    name: 'Mai',
    value: 68
  }] as any[];
  const budgetData = [{
    name: 'Planung',
    value: 15000
  }, {
    name: 'Material',
    value: 120000
  }, {
    name: 'Arbeit',
    value: 95000
  }, {
    name: 'Sonstiges',
    value: 25000
  }, {
    name: 'Reserve',
    value: 30000
  }] as any[];
  const getTrendIcon = (trend: KPI['trend']) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };
  const getTrendColor = (trend: KPI['trend']) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-600';
  };
  return <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8" style={{
    display: "none"
  }}>
      <header className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
          Projekt-Kennzahlen
        </h2>
        <p className="text-slate-600">
          Wichtige Metriken auf einen Blick
        </p>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return <motion.div key={kpi.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${kpi.color}`} />
                <span className={`text-sm ${getTrendColor(kpi.trend)}`}>
                  {getTrendIcon(kpi.trend)}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900">
                  {kpi.value}
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {kpi.title}
                </p>
                <p className={`text-xs ${getTrendColor(kpi.trend)}`}>
                  {kpi.change}
                </p>
              </div>
            </motion.div>;
      })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.6,
        delay: 0.4
      }} className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Fortschritt über Zeit
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fontSize: 12,
                fill: '#64748b'
              }} />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{
                fill: '#3b82f6',
                strokeWidth: 2,
                r: 4
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budget Breakdown */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.6,
        delay: 0.5
      }} className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Budget-Verteilung
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fontSize: 10,
                fill: '#64748b'
              }} />
                <YAxis hide />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default KPIsPanel;