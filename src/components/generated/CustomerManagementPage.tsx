"use client";

import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Building, MoreVertical, Edit, UserCheck, UserX, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerCreationModal } from './CustomerCreationModal';
interface Customer {
  id: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  customerNumber: string;
  projectAssignments: string[];
  internalNotes: string;
  status: 'Aktiv' | 'Inaktiv';
  createdDate: string;
}
const mockCustomers: Customer[] = [{
  id: '1',
  companyName: 'Mustermann Bau GmbH',
  contactFirstName: 'Max',
  contactLastName: 'Mustermann',
  email: 'max.mustermann@mustermann-bau.de',
  phone: '+49 89 123456789',
  street: 'Baustraße 123',
  postalCode: '80331',
  city: 'München',
  customerNumber: 'KD001234',
  projectAssignments: ['Bürogebäude München Zentrum', 'Wohnkomplex Hamburg Nord'],
  internalNotes: 'Langjähriger Kunde, sehr zuverlässig',
  status: 'Aktiv',
  createdDate: '2024-01-15'
}, {
  id: '2',
  companyName: 'Schmidt Immobilien AG',
  contactFirstName: 'Anna',
  contactLastName: 'Schmidt',
  email: 'anna.schmidt@schmidt-immobilien.de',
  phone: '+49 40 987654321',
  street: 'Immobilienweg 45',
  postalCode: '20095',
  city: 'Hamburg',
  customerNumber: 'KD002345',
  projectAssignments: ['Industriehalle Berlin Süd'],
  internalNotes: 'Neuer Kunde, großes Potenzial',
  status: 'Aktiv',
  createdDate: '2024-01-10'
}, {
  id: '3',
  companyName: 'Weber Konstruktion',
  contactFirstName: 'Thomas',
  contactLastName: 'Weber',
  email: 'thomas.weber@weber-konstruktion.de',
  phone: '+49 30 555666777',
  street: 'Konstruktionsplatz 7',
  postalCode: '10115',
  city: 'Berlin',
  customerNumber: 'KD003456',
  projectAssignments: [],
  internalNotes: 'Pausiert aktuell alle Projekte',
  status: 'Inaktiv',
  createdDate: '2023-12-20'
}];
export function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktiv' | 'Inaktiv'>('all');
  const [sortField, setSortField] = useState<'companyName' | 'customerNumber' | 'createdDate'>('companyName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || customer.contactFirstName.toLowerCase().includes(searchTerm.toLowerCase()) || customer.contactLastName.toLowerCase().includes(searchTerm.toLowerCase()) || customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return filtered.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      if (sortField === 'createdDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [customers, searchTerm, statusFilter, sortField, sortDirection]);
  const handleSort = (field: 'companyName' | 'customerNumber' | 'createdDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(customer => customer.id === editingCustomer.id ? {
        ...customer,
        ...customerData
      } : customer));
      setEditingCustomer(null);
    } else {
      // Create new customer
      const {
        id: _,
        createdDate: __,
        ...customerDataWithoutIdAndDate
      } = customerData as Customer;
      const newCustomer: Customer = {
        ...customerDataWithoutIdAndDate,
        id: Date.now().toString(),
        createdDate: new Date().toISOString().split('T')[0]
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    setShowCreateModal(false);
  };
  const handleToggleStatus = (customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? {
      ...c,
      status: c.status === 'Aktiv' ? 'Inaktiv' : 'Aktiv'
    } : c));
  };
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
  };
  return <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Kundenverwaltung</h1>
            </div>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Kunde anlegen</span>
            </motion.button>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Nach Firma, Name, E-Mail oder Kundennummer suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]">
                <option value="all">Alle Status</option>
                <option value="Aktiv">Aktiv</option>
                <option value="Inaktiv">Inaktiv</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedCustomers.map(customer => <motion.div key={customer.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{customer.companyName}</h3>
                    <p className="text-sm text-slate-500">#{customer.customerNumber}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {customer.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-xs">
                      {customer.contactFirstName[0]}{customer.contactLastName[0]}
                    </span>
                  </div>
                  <span>{customer.contactFirstName} {customer.contactLastName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{customer.street}, {customer.postalCode} {customer.city}</span>
                </div>
              </div>

              {/* Projects */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Projekte ({customer.projectAssignments.length})
                </p>
                {customer.projectAssignments.length > 0 ? <div className="flex flex-wrap gap-1">
                    {customer.projectAssignments.slice(0, 2).map(project => <span key={project} className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        {project.length > 20 ? `${project.substring(0, 20)}...` : project}
                      </span>)}
                    {customer.projectAssignments.length > 2 && <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        +{customer.projectAssignments.length - 2} weitere
                      </span>}
                  </div> : <p className="text-xs text-slate-500">Keine Projekte zugewiesen</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Erstellt: {new Date(customer.createdDate).toLocaleDateString('de-DE')}
                </p>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={() => {
                setEditingCustomer(customer);
                setShowCreateModal(true);
              }} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Bearbeiten">
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={() => handleToggleStatus(customer)} className={`p-1.5 rounded transition-colors ${customer.status === 'Aktiv' ? 'text-slate-600 hover:text-red-600 hover:bg-red-50' : 'text-slate-600 hover:text-green-600 hover:bg-green-50'}`} title={customer.status === 'Aktiv' ? 'Deaktivieren' : 'Aktivieren'}>
                    {customer.status === 'Aktiv' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </motion.button>
                  <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={() => handleDeleteCustomer(customer)} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Löschen">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>)}
        </div>

        {/* Empty State */}
        {filteredAndSortedCustomers.length === 0 && <div className="text-center py-12">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Keine Kunden gefunden</p>
            <p className="text-slate-500 text-sm">Versuchen Sie, Ihre Suchkriterien anzupassen</p>
          </div>}
      </div>

      {/* Customer Creation Modal */}
      <CustomerCreationModal isOpen={showCreateModal} onClose={() => {
      setShowCreateModal(false);
      setEditingCustomer(null);
    }} onSave={handleSaveCustomer} customer={editingCustomer} />
    </div>;
}