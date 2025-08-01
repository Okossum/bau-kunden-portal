import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Bell, Calendar, AlertTriangle } from 'lucide-react';
interface Notification {
  id: string;
  type: 'document' | 'alert' | 'appointment' | 'update';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}
const NotificationPanel: React.FC = () => {
  const notifications: Notification[] = [{
    id: '1',
    type: 'document',
    title: 'Neues Dokument hochgeladen',
    description: 'Bauplan_EG_final.pdf',
    timestamp: 'vor 2 Stunden',
    read: false
  }, {
    id: '2',
    type: 'alert',
    title: 'Wichtige Mitteilung',
    description: 'Materiallieferung verzögert sich um 2 Tage.',
    timestamp: 'gestern',
    read: false
  }, {
    id: '3',
    type: 'appointment',
    title: 'Neuer Termin',
    description: 'Baubesprechung vor Ort',
    timestamp: 'in 3 Tagen',
    read: true
  }, {
    id: '4',
    type: 'update',
    title: 'Projekt-Update',
    description: 'Der Rohbau wurde erfolgreich abgenommen.',
    timestamp: 'vor 4 Tagen',
    read: true
  }];
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'update':
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };
  const getIconBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100';
      case 'alert':
        return 'bg-red-100';
      case 'appointment':
        return 'bg-green-100';
      case 'update':
        return 'bg-slate-100';
    }
  };
  return <aside className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 h-full">
      <header className="mb-6 flex justify-between items-center">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
          Mitteilungen
        </h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Alle ansehen
        </button>
      </header>

      <div className="space-y-4">
        {notifications.map((notification, index) => <motion.div key={notification.id} initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.5,
        delay: index * 0.15
      }} className={`
              flex items-start gap-4 p-4 rounded-xl transition-colors duration-200
              ${!notification.read ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}
            `}>
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${getIconBgColor(notification.type)}
            `}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-base">
                {notification.title}
              </h3>
              <p className="text-slate-600 text-sm mb-1">
                {notification.description}
              </p>
              <p className="text-xs text-slate-400">
                {notification.timestamp}
              </p>
            </div>
            {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0" />}
          </motion.div>)}
      </div>
    </aside>;
};
export default NotificationPanel;