"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, User, Mail, Phone, MapPin, Hash, FileText, CheckCircle, Save, Plus, Trash2, Users, Info, ChevronDown, UserPlus } from 'lucide-react';
interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Firmen-Admin' | 'Bauleiter' | 'Buchhaltung' | 'Mitarbeiter';
  phone: string;
  status: 'Aktiv' | 'Inaktiv';
}
interface CompanyCustomerData {
  companyName: string;
  legalForm: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  vatId?: string;
  customerNumber: string;
  status: 'Aktiv' | 'Inaktiv';
  notes?: string;
  users: CompanyUser[];
}
interface CompanyCustomerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: CompanyCustomerData) => void;
  isLoading?: boolean;
}
const legalForms = ['GmbH', 'AG', 'GbR', 'e.K.', 'KG', 'OHG', 'UG (haftungsbeschränkt)', 'Einzelunternehmen', 'Freiberufler'];
const userRoles = ['Firmen-Admin', 'Bauleiter', 'Buchhaltung', 'Mitarbeiter'];
export function CompanyCustomerCreationModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: CompanyCustomerCreationModalProps) {
  const [formData, setFormData] = useState<CompanyCustomerData>({
    companyName: '',
    legalForm: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    vatId: '',
    customerNumber: '',
    status: 'Aktiv',
    notes: '',
    users: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-generate customer number
  const generateCustomerNumber = () => {
    const prefix = 'FU';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };

  // Generate user ID
  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  useEffect(() => {
    if (isOpen) {
      const initialUser: CompanyUser = {
        id: generateUserId(),
        firstName: '',
        lastName: '',
        email: '',
        role: 'Firmen-Admin',
        phone: '',
        status: 'Aktiv'
      };
      setFormData({
        companyName: '',
        legalForm: '',
        street: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        vatId: '',
        customerNumber: generateCustomerNumber(),
        status: 'Aktiv',
        notes: '',
        users: [initialUser]
      });
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Company validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Firmenname ist erforderlich';
    }
    if (!formData.legalForm.trim()) {
      newErrors.legalForm = 'Rechtsform ist erforderlich';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Straße ist erforderlich';
    }
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'Hausnummer ist erforderlich';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postleitzahl ist erforderlich';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postleitzahl muss 5 Ziffern haben';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Stadt ist erforderlich';
    }

    // Users validation
    formData.users.forEach((user, index) => {
      if (!user.firstName.trim()) {
        newErrors[`user_${index}_firstName`] = 'Vorname ist erforderlich';
      }
      if (!user.lastName.trim()) {
        newErrors[`user_${index}_lastName`] = 'Nachname ist erforderlich';
      }
      if (!user.email.trim()) {
        newErrors[`user_${index}_email`] = 'E-Mail ist erforderlich';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        newErrors[`user_${index}_email`] = 'Ungültige E-Mail-Adresse';
      }
      if (!user.phone.trim()) {
        newErrors[`user_${index}_phone`] = 'Telefonnummer ist erforderlich';
      }
    });

    // Check for duplicate emails
    const emails = formData.users.map(u => u.email.toLowerCase()).filter(e => e);
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicateEmails.length > 0) {
      formData.users.forEach((user, index) => {
        if (duplicateEmails.includes(user.email.toLowerCase())) {
          newErrors[`user_${index}_email`] = 'E-Mail-Adresse bereits verwendet';
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const addUser = () => {
    const newUser: CompanyUser = {
      id: generateUserId(),
      firstName: '',
      lastName: '',
      email: '',
      role: 'Mitarbeiter',
      phone: '',
      status: 'Aktiv'
    };
    setFormData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };
  const removeUser = (userId: string) => {
    if (formData.users.length <= 1) return; // Keep at least one user

    setFormData(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }));
  };
  const updateUser = (userId: string, field: keyof CompanyUser, value: string) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.map(user => user.id === userId ? {
        ...user,
        [field]: value
      } : user)
    }));
  };
  const InputField = ({
    label,
    name,
    type = 'text',
    icon: Icon,
    placeholder,
    required = false,
    value,
    onChange,
    error
  }: {
    label: string;
    name: string;
    type?: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
    placeholder: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${error ? 'border-red-300 bg-red-50' : 'border-slate-300'}`} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>;
  if (showSuccess) {
    return <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} className="relative bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }} className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Firmenkunde erfolgreich erstellt!
            </h3>
            <p className="text-slate-600">
              Das Unternehmen und die Benutzer wurden erfolgreich im System angelegt.
            </p>
          </motion.div>
        </div>
      </AnimatePresence>;
  }
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Firmenkunde anlegen
                </h2>
              </div>
              <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="p-6 space-y-8">
                {/* Company Information */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.1
            }} className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Building className="w-5 h-5 text-blue-600" />
                    Firmeninformationen
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Firmenname" name="companyName" icon={Building} placeholder="z.B. Mustermann Bau GmbH" required value={formData.companyName} onChange={value => setFormData(prev => ({
                    ...prev,
                    companyName: value
                  }))} error={errors.companyName} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Rechtsform <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select value={formData.legalForm} onChange={e => setFormData(prev => ({
                      ...prev,
                      legalForm: e.target.value
                    }))} className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base appearance-none ${errors.legalForm ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}>
                          <option value="">Rechtsform wählen</option>
                          {legalForms.map(form => <option key={form} value={form}>{form}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      </div>
                      {errors.legalForm && <p className="text-sm text-red-600">{errors.legalForm}</p>}
                    </div>

                    <InputField label="Straße" name="street" icon={MapPin} placeholder="z.B. Musterstraße" required value={formData.street} onChange={value => setFormData(prev => ({
                  ...prev,
                  street: value
                }))} error={errors.street} />

                    <InputField label="Hausnummer" name="houseNumber" icon={Hash} placeholder="z.B. 123" required value={formData.houseNumber} onChange={value => setFormData(prev => ({
                  ...prev,
                  houseNumber: value
                }))} error={errors.houseNumber} />

                    <InputField label="Postleitzahl" name="postalCode" icon={Hash} placeholder="z.B. 12345" required value={formData.postalCode} onChange={value => setFormData(prev => ({
                  ...prev,
                  postalCode: value
                }))} error={errors.postalCode} />

                    <InputField label="Stadt" name="city" icon={MapPin} placeholder="z.B. München" required value={formData.city} onChange={value => setFormData(prev => ({
                  ...prev,
                  city: value
                }))} error={errors.city} />

                    <InputField label="USt-ID (optional)" name="vatId" icon={Hash} placeholder="z.B. DE123456789" value={formData.vatId || ''} onChange={value => setFormData(prev => ({
                  ...prev,
                  vatId: value
                }))} />

                    <InputField label="Kundennummer" name="customerNumber" icon={Hash} placeholder="z.B. FU123456" required value={formData.customerNumber} onChange={value => setFormData(prev => ({
                  ...prev,
                  customerNumber: value
                }))} error={errors.customerNumber} />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select value={formData.status} onChange={e => setFormData(prev => ({
                    ...prev,
                    status: e.target.value as 'Aktiv' | 'Inaktiv'
                  }))} className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base">
                        <option value="Aktiv">Aktiv</option>
                        <option value="Inaktiv">Inaktiv</option>
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* User Management Section */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200 flex-1">
                      <Users className="w-5 h-5 text-blue-600" />
                      Benutzer verwalten
                    </h3>
                    <motion.button type="button" whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} onClick={addUser} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm ml-4">
                      <UserPlus className="w-4 h-4" />
                      Benutzer hinzufügen
                    </motion.button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Self-Service Benutzerverwaltung</p>
                        <p>Der erste Benutzer erhält automatisch die Rolle "Firmen-Admin" und kann später weitere Benutzer für das Unternehmen verwalten. Alle Benutzer erhalten Zugang zum Firmenportal.</p>
                      </div>
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="space-y-4">
                    {formData.users.map((user, index) => <motion.div key={user.id} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.1 * index
                }} className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-600" />
                            Benutzer {index + 1}
                            {index === 0 && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Firmen-Admin
                              </span>}
                          </h4>
                          {formData.users.length > 1 && <motion.button type="button" whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }} onClick={() => removeUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InputField label="Vorname" name={`user_${index}_firstName`} icon={User} placeholder="z.B. Max" required value={user.firstName} onChange={value => updateUser(user.id, 'firstName', value)} error={errors[`user_${index}_firstName`]} />

                          <InputField label="Nachname" name={`user_${index}_lastName`} icon={User} placeholder="z.B. Mustermann" required value={user.lastName} onChange={value => updateUser(user.id, 'lastName', value)} error={errors[`user_${index}_lastName`]} />

                          <InputField label="E-Mail" name={`user_${index}_email`} type="email" icon={Mail} placeholder="z.B. max@firma.de" required value={user.email} onChange={value => updateUser(user.id, 'email', value)} error={errors[`user_${index}_email`]} />

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Rolle <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <select value={user.role} onChange={e => updateUser(user.id, 'role', e.target.value)} disabled={index === 0} // First user is always admin
                        className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base appearance-none disabled:bg-slate-100 disabled:text-slate-500">
                                {userRoles.map(role => <option key={role} value={role}>{role}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            </div>
                          </div>

                          <InputField label="Telefon" name={`user_${index}_phone`} type="tel" icon={Phone} placeholder="z.B. +49 123 456789" required value={user.phone} onChange={value => updateUser(user.id, 'phone', value)} error={errors[`user_${index}_phone`]} />

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Status <span className="text-red-500">*</span>
                            </label>
                            <select value={user.status} onChange={e => updateUser(user.id, 'status', e.target.value)} className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base">
                              <option value="Aktiv">Aktiv</option>
                              <option value="Inaktiv">Inaktiv</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>)}
                  </div>
                </motion.div>

                {/* Internal Notes */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Interne Notizen
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Notizen (optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      <textarea value={formData.notes || ''} onChange={e => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))} placeholder="Interne Notizen zum Firmenkunden..." rows={4} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-base" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="button" onClick={onClose} className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                  Abbrechen
                </motion.button>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="submit" disabled={isSubmitting || isLoading} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Speichern...' : 'Firmenkunde erstellen'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>}
    </AnimatePresence>;
}