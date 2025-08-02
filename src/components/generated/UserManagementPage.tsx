import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, Users, MoreVertical, Edit, Key, UserCheck, UserX, Trash2, Loader2, AlertCircle, ArrowLeft, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserModalDialog } from './UserModalDialog';
import { UserManagementService, UserManagementUser } from '../../services/userManagementService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  role: 'Admin' | 'Kunde' | 'Employee' | 'Partner';
  status: 'Aktiv' | 'Inaktiv';
  // Adressdaten
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  // Kontaktdaten
  phoneLandline?: string;
  phoneMobile?: string;
  // Systemdaten
  lastLogin: string;
  projects?: string[];
  tenantId?: string;
}

interface UserManagementPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToDocuments: () => void;
  onNavigateToProjectManagement: () => void;
}

export function UserManagementPage({ 
  onNavigateToDashboard, 
  onNavigateToDocuments, 
  onNavigateToProjectManagement 
}: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminCompany, setAdminCompany] = useState<string>('MH Bau GmbH');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'Kunde'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktiv' | 'Inaktiv'>('all');
  const [sortField, setSortField] = useState<'name' | 'email' | 'lastLogin'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    type: 'delete' | 'reset' | 'toggle';
    user: User | null;
  }>({
    show: false,
    type: 'delete',
    user: null
  });

  // Load users from database on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await UserManagementService.getAllUsers();
      console.log('Loaded users from database:', usersData);
      setUsers(usersData);
      
      // Find admin company for Employee role auto-fill
      // First try to find by role 'Admin', then by name 'Administrator'
      let adminUser = usersData.find(user => user.role === 'Admin');
      if (!adminUser) {
        adminUser = usersData.find(user => `${user.firstName} ${user.lastName}` === 'Administrator');
      }
      console.log('All users:', usersData);
      console.log('Admin user found:', adminUser);
      if (adminUser && adminUser.company) {
        console.log('Found admin company:', adminUser.company);
        setAdminCompany(adminUser.company);
      } else {
        console.log('No admin user found or admin has no company, using default');
        console.log('Admin user details:', adminUser);
        setAdminCompany('MH Bau GmbH');
      }
      
      // If no users found, show a helpful message instead of error
      if (usersData.length === 0) {
        console.log('No users found in database');
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
    return filtered.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      if (sortField === 'lastLogin') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);
  const handleSort = (field: 'name' | 'email' | 'lastLogin') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
    console.log('🔄 handleSaveUser called with userData:', userData);
    try {
      if (editingUser) {
        console.log('📝 Updating existing user:', editingUser.id);
        // Update existing user
        const updatedUser = await UserManagementService.updateUser(editingUser.id, userData);
        console.log('✅ User updated successfully:', updatedUser);
        setUsers(prev => prev.map(user => user.id === editingUser.id ? updatedUser : user));
        setEditingUser(null);
      } else {
        console.log('🆕 Creating new user');
        // Create new user
        const newUser = await UserManagementService.createUser(userData as any);
        console.log('✅ User created successfully:', newUser);
        setUsers(prev => [newUser, ...prev]);
        setShowCreateModal(false);
        
        // Show success message
        alert('Benutzer erfolgreich erstellt! Eine Registrierungs-E-Mail wird an den Benutzer gesendet.');
      }
    } catch (error: any) {
      console.error('❌ Error saving user:', error);
      throw new Error(error.message || 'Fehler beim Speichern des Benutzers');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleOpenCreateModal = () => {
    // Update admin company before opening modal
    console.log('Opening create modal, current users:', users);
    // First try to find by role 'Admin', then by name 'Administrator'
    let adminUser = users.find(user => user.role === 'Admin');
    if (!adminUser) {
      adminUser = users.find(user => `${user.firstName} ${user.lastName}` === 'Administrator');
    }
    console.log('Admin user for modal:', adminUser);
    if (adminUser && adminUser.company) {
      console.log('Setting admin company for modal:', adminUser.company);
      setAdminCompany(adminUser.company);
    } else {
      console.log('No admin user found for modal, using default');
    }
    setShowCreateModal(true);
  };

  const handleCreateTestData = async () => {
    try {
      setLoading(true);
      await UserManagementService.createTestData();
      alert('Testdaten erfolgreich erstellt! 20 Benutzer wurden zur Datenbank hinzugefügt.');
      // Reload users to show the new test data
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating test data:', error);
      alert(`Fehler beim Erstellen der Testdaten: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const updatedUser = await UserManagementService.toggleUserStatus(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setShowConfirmDialog({ show: false, type: 'toggle', user: null });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      setError(error.message || 'Fehler beim Ändern des Benutzerstatus');
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await UserManagementService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setShowConfirmDialog({ show: false, type: 'delete', user: null });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Fehler beim Löschen des Benutzers');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await UserManagementService.resetUserPassword(user.email);
      setShowConfirmDialog({ show: false, type: 'reset', user: null });
      // Show success message
      console.log('Password reset email sent successfully');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Fehler beim Zurücksetzen des Passworts');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Lade Benutzer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={onNavigateToDashboard}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Zurück zum Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Benutzerverwaltung</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={handleCreateTestData} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                <Database className="w-4 h-4" />
                <span>Testdaten erstellen</span>
              </motion.button>
              <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={handleOpenCreateModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Benutzer anlegen</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Nach Name, E-Mail oder Firma suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]">
                <option value="all">Alle Rollen</option>
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
                <option value="Partner">Partner</option>
                <option value="Kunde">Kunde</option>
              </select>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]">
                <option value="all">Alle Status</option>
                <option value="Aktiv">Aktiv</option>
                <option value="Inaktiv">Inaktiv</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Name
                      {sortField === 'name' && <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Rolle</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Firma</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-2">
                      E-Mail
                      {sortField === 'email' && <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('lastLogin')}>
                    <div className="flex items-center gap-2">
                      Letztes Login
                      {sortField === 'lastLogin' && <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedUsers.map(user => <motion.tr key={user.id} initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unbekannter Benutzer'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 
                        user.role === 'Employee' ? 'bg-green-100 text-green-800' : 
                        user.role === 'Partner' ? 'bg-purple-100 text-purple-800' : 
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.company || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(user.lastLogin).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={() => handleEditUser(user)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Bearbeiten">
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={() => setShowConfirmDialog({
                      show: true,
                      type: 'reset',
                      user
                    })} className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Passwort zurücksetzen">
                          <Key className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={() => setShowConfirmDialog({
                      show: true,
                      type: 'toggle',
                      user
                    })} className={`p-1.5 rounded transition-colors ${user.status === 'Aktiv' ? 'text-slate-600 hover:text-red-600 hover:bg-red-50' : 'text-slate-600 hover:text-green-600 hover:bg-green-50'}`} title={user.status === 'Aktiv' ? 'Deaktivieren' : 'Aktivieren'}>
                          {user.status === 'Aktiv' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </motion.button>
                        <motion.button whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={() => setShowConfirmDialog({
                      show: true,
                      type: 'delete',
                      user
                    })} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Löschen">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>)}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedUsers.length === 0 && <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Keine Benutzer gefunden</p>
              <p className="text-slate-500 text-sm">Versuchen Sie, Ihre Suchkriterien anzupassen</p>
            </div>}
        </div>
      </div>

      {/* User Modal Dialog */}
      <UserModalDialog
        isOpen={showCreateModal || !!editingUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
        availableProjects={['Projekt Alpha', 'Projekt Beta', 'Projekt Gamma', 'Projekt Delta', 'Projekt Epsilon', 'Bürogebäude München', 'Wohnkomplex Hamburg', 'Industriehalle Berlin']}
        adminCompany={adminCompany}
      />

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog.show && showConfirmDialog.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDialog({ show: false, type: 'delete', user: null })}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {showConfirmDialog.type === 'delete' && 'Benutzer löschen'}
                {showConfirmDialog.type === 'reset' && 'Passwort zurücksetzen'}
                {showConfirmDialog.type === 'toggle' && `Benutzer ${showConfirmDialog.user.status === 'Aktiv' ? 'deaktivieren' : 'aktivieren'}`}
              </h3>
              <p className="text-slate-600 mb-6">
                {showConfirmDialog.type === 'delete' && `Sind Sie sicher, dass Sie "${showConfirmDialog.user.firstName} ${showConfirmDialog.user.lastName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
                {showConfirmDialog.type === 'reset' && `Möchten Sie das Passwort für "${showConfirmDialog.user.firstName} ${showConfirmDialog.user.lastName}" zurücksetzen? Eine E-Mail mit Anweisungen wird gesendet.`}
                {showConfirmDialog.type === 'toggle' && `Möchten Sie "${showConfirmDialog.user.firstName} ${showConfirmDialog.user.lastName}" ${showConfirmDialog.user.status === 'Aktiv' ? 'deaktivieren' : 'aktivieren'}?`}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmDialog({ show: false, type: 'delete', user: null })}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    if (showConfirmDialog.type === 'delete') {
                      handleDeleteUser(showConfirmDialog.user!);
                    } else if (showConfirmDialog.type === 'reset') {
                      handleResetPassword(showConfirmDialog.user!);
                    } else if (showConfirmDialog.type === 'toggle') {
                      handleToggleUserStatus(showConfirmDialog.user!);
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                    showConfirmDialog.type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : showConfirmDialog.type === 'reset'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {showConfirmDialog.type === 'delete' && 'Löschen'}
                  {showConfirmDialog.type === 'reset' && 'Zurücksetzen'}
                  {showConfirmDialog.type === 'toggle' && 'Bestätigen'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>;
}