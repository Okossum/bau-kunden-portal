import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Key, UserCheck, UserX, Trash2, Users } from 'lucide-react';
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Kunde';
  status: 'Aktiv' | 'Inaktiv';
  lastLogin: string;
  projects?: string[];
}
interface UserListTableProps {
  users: User[];
  sortField: 'name' | 'email' | 'lastLogin';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'name' | 'email' | 'lastLogin') => void;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}
export function UserListTable({
  users,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete
}: UserListTableProps) {
  const SortableHeader = ({
    field,
    children,
    className = ""
  }: {
    field: 'name' | 'email' | 'lastLogin';
    children: React.ReactNode;
    className?: string;
  }) => <th className={`text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors ${className}`} onClick={() => onSort(field)}>
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && <span className="text-blue-600 text-sm">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>}
      </div>
    </th>;
  const ActionButton = ({
    onClick,
    icon: Icon,
    title,
    hoverColor
  }: {
    onClick: () => void;
    icon: React.ComponentType<{
      className?: string;
    }>;
    title: string;
    hoverColor: string;
  }) => <motion.button whileHover={{
    scale: 1.05
  }} whileTap={{
    scale: 0.95
  }} onClick={onClick} className={`p-1.5 text-slate-600 rounded transition-colors ${hoverColor}`} title={title}>
      <Icon className="w-4 h-4" />
    </motion.button>;
  const UserAvatar = ({
    name
  }: {
    name: string;
  }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-blue-600 font-medium text-sm">
          {initials}
        </span>
      </div>;
  };
  const RoleBadge = ({
    role
  }: {
    role: 'Admin' | 'Kunde';
  }) => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
      {role}
    </span>;
  const StatusBadge = ({
    status
  }: {
    status: 'Aktiv' | 'Inaktiv';
  }) => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {status}
    </span>;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  if (users.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Benutzer gefunden</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Versuchen Sie, Ihre Suchkriterien anzupassen oder erstellen Sie einen neuen Benutzer.
          </p>
        </div>
      </div>;
  }
  return <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <SortableHeader field="name">Name</SortableHeader>
              <th className="text-left px-6 py-4 font-semibold text-slate-700">Rolle</th>
              <SortableHeader field="email">E-Mail</SortableHeader>
              <th className="text-left px-6 py-4 font-semibold text-slate-700">Status</th>
              <SortableHeader field="lastLogin">Letztes Login</SortableHeader>
              <th className="text-left px-6 py-4 font-semibold text-slate-700 w-32">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user, index) => <motion.tr key={user.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name} />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{user.name}</p>
                      {user.projects && user.projects.length > 0 && <p className="text-xs text-slate-500 truncate">
                          {user.projects.length} Projekt{user.projects.length !== 1 ? 'e' : ''}
                        </p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 truncate block max-w-[200px]" title={user.email}>
                    {user.email}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 text-sm">
                    {formatDate(user.lastLogin)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <ActionButton onClick={() => onEdit(user)} icon={Edit} title="Bearbeiten" hoverColor="hover:text-blue-600 hover:bg-blue-50" />
                    <ActionButton onClick={() => onResetPassword(user)} icon={Key} title="Passwort zurücksetzen" hoverColor="hover:text-orange-600 hover:bg-orange-50" />
                    <ActionButton onClick={() => onToggleStatus(user)} icon={user.status === 'Aktiv' ? UserX : UserCheck} title={user.status === 'Aktiv' ? 'Deaktivieren' : 'Aktivieren'} hoverColor={user.status === 'Aktiv' ? 'hover:text-red-600 hover:bg-red-50' : 'hover:text-green-600 hover:bg-green-50'} />
                    <ActionButton onClick={() => onDelete(user)} icon={Trash2} title="Löschen" hoverColor="hover:text-red-600 hover:bg-red-50" />
                  </div>
                </td>
              </motion.tr>)}
          </tbody>
        </table>
      </div>
      
      {/* Mobile-friendly summary */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
        {users.length} Benutzer{users.length !== 1 ? '' : ''} angezeigt
      </div>
    </div>;
}