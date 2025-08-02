"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, User, Mail, Phone, MapPin, Hash, FileText, CheckCircle, Save, Users, Building2, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
interface Customer {
  id: string;
  customerType: 'Privatperson' | 'Unternehmen';
  // Privatperson fields
  firstName?: string;
  lastName?: string;
  // Unternehmen fields
  companyName?: string;
  legalForm?: string;
  contactFirstName?: string;
  contactLastName?: string;
  taxId?: string;
  // Common fields
  email: string;
  phone: string;
  street: string;
  houseNumber?: string;
  postalCode: string;
  city: string;
  customerNumber: string;
  projectAssignments: string[];
  internalNotes: string;
  status: 'Aktiv' | 'Inaktiv';
}
interface EnhancedCustomerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
  customer?: Customer | null;
  availableProjects?: string[];
}
const availableConstructionProjects = ['Bürogebäude München Zentrum', 'Wohnkomplex Hamburg Nord', 'Industriehalle Berlin Süd', 'Einkaufszentrum Frankfurt', 'Logistikzentrum Köln', 'Krankenhaus Düsseldorf', 'Schule Stuttgart West', 'Parkhaus Hannover', 'Brücke Bremen', 'Tunnel Leipzig'];
const legalForms = ['GmbH', 'AG', 'GbR', 'e.K.', 'KG', 'OHG', 'UG (haftungsbeschränkt)', 'Einzelunternehmen', 'Freiberufler'];
export function EnhancedCustomerCreationModal({
  isOpen,
  onClose,
  onSave,
  customer = null,
  availableProjects = availableConstructionProjects
}: EnhancedCustomerCreationModalProps) {
  const [customerType, setCustomerType] = useState<'Privatperson' | 'Unternehmen'>('Privatperson');
  const [formData, setFormData] = useState({
    // Privatperson fields
    firstName: '',
    lastName: '',
    // Unternehmen fields
    companyName: '',
    legalForm: '',
    contactFirstName: '',
    contactLastName: '',
    taxId: '',
    // Common fields
    email: '',
    phone: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    customerNumber: '',
    projectAssignments: [] as string[],
    internalNotes: '',
    status: 'Aktiv' as 'Aktiv' | 'Inaktiv'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isEditing = !!customer;

  // Auto-generate customer number
  const generateCustomerNumber = () => {
    const prefix = customerType === 'Privatperson' ? 'KP' : 'KU';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setCustomerType(customer.customerType || 'Privatperson');
        setFormData({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          companyName: customer.companyName || '',
          legalForm: customer.legalForm || '',
          contactFirstName: customer.contactFirstName || '',
          contactLastName: customer.contactLastName || '',
          taxId: customer.taxId || '',
          email: customer.email,
          phone: customer.phone,
          street: customer.street,
          houseNumber: customer.houseNumber || '',
          postalCode: customer.postalCode,
          city: customer.city,
          customerNumber: customer.customerNumber,
          projectAssignments: customer.projectAssignments || [],
          internalNotes: customer.internalNotes,
          status: customer.status
        });
      } else {
        setCustomerType('Privatperson');
        setFormData({
          firstName: '',
          lastName: '',
          companyName: '',
          legalForm: '',
          contactFirstName: '',
          contactLastName: '',
          taxId: '',
          email: '',
          phone: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          city: '',
          customerNumber: generateCustomerNumber(),
          projectAssignments: [],
          internalNotes: '',
          status: 'Aktiv'
        });
      }
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen, customer, customerType]);

  // Update customer number when type changes
  useEffect(() => {
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        customerNumber: generateCustomerNumber()
      }));
    }
  }, [customerType, isEditing]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (customerType === 'Privatperson') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Vorname ist erforderlich';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Nachname ist erforderlich';
      }
    } else {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Firmenname ist erforderlich';
      }
      if (!formData.legalForm.trim()) {
        newErrors.legalForm = 'Gesellschaftsform ist erforderlich';
      }
      if (!formData.contactFirstName.trim()) {
        newErrors.contactFirstName = 'Ansprechpartner Vorname ist erforderlich';
      }
      if (!formData.contactLastName.trim()) {
        newErrors.contactLastName = 'Ansprechpartner Nachname ist erforderlich';
      }
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Straße ist erforderlich';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postleitzahl ist erforderlich';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postleitzahl muss 5 Ziffern haben';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Stadt ist erforderlich';
    }
    if (!formData.customerNumber.trim()) {
      newErrors.customerNumber = 'Kundennummer ist erforderlich';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const customerData: any = {
        customerType,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        street: formData.street.trim(),
        houseNumber: formData.houseNumber.trim(),
        postalCode: formData.postalCode.trim(),
        city: formData.city.trim(),
        customerNumber: formData.customerNumber.trim(),
        projectAssignments: formData.projectAssignments,
        internalNotes: formData.internalNotes.trim(),
        status: formData.status
      };
      if (customerType === 'Privatperson') {
        customerData.firstName = formData.firstName.trim();
        customerData.lastName = formData.lastName.trim();
      } else {
        customerData.companyName = formData.companyName.trim();
        customerData.legalForm = formData.legalForm.trim();
        customerData.contactFirstName = formData.contactFirstName.trim();
        customerData.contactLastName = formData.contactLastName.trim();
        customerData.taxId = formData.taxId.trim();
      }
      if (isEditing) {
        customerData.id = customer.id;
      }
      await onSave(customerData);
      setShowSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleProjectToggle = (project: string) => {
    setFormData(prev => ({
      ...prev,
      projectAssignments: prev.projectAssignments.includes(project) ? prev.projectAssignments.filter(p => p !== project) : [...prev.projectAssignments, project]
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
    onChange
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
  }) => <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`} />
      </div>
      {errors[name] && <p className="text-sm text-red-600 flex items-center gap-1">
          {errors[name]}
        </p>}
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
              Kunde erfolgreich {isEditing ? 'aktualisiert' : 'erstellt'}!
            </h3>
            <p className="text-slate-600">
              Der {customerType} wurde erfolgreich im System {isEditing ? 'aktualisiert' : 'angelegt'}.
            </p>
          </motion.div>
        </div>
      </AnimatePresence>;
  }
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
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
      }} className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {isEditing ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}
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

            {/* Customer Type Toggle */}
            {!isEditing && <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Kundentyp auswählen</h3>
                <div className="flex gap-4">
                  <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setCustomerType('Privatperson')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${customerType === 'Privatperson' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                    <div className="flex items-center justify-center gap-3">
                      <User className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Privatperson</div>
                        <div className="text-sm opacity-75">Einzelkunde</div>
                      </div>
                    </div>
                  </motion.button>
                  
                  <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setCustomerType('Unternehmen')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${customerType === 'Unternehmen' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                    <div className="flex items-center justify-center gap-3">
                      <Building2 className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Unternehmen</div>
                        <div className="text-sm opacity-75">Firmenkunde</div>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="p-6 space-y-8">
                {/* Customer Information */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.1
            }} className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    {customerType === 'Privatperson' ? <User className="w-5 h-5 text-blue-600" /> : <Building className="w-5 h-5 text-blue-600" />}
                    {customerType === 'Privatperson' ? 'Persönliche Daten' : 'Firmeninformationen'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerType === 'Privatperson' ? <>
                        <InputField label="Vorname" name="firstName" icon={User} placeholder="z.B. Max" required value={formData.firstName} onChange={value => setFormData(prev => ({
                    ...prev,
                    firstName: value
                  }))} />
                        <InputField label="Nachname" name="lastName" icon={User} placeholder="z.B. Mustermann" required value={formData.lastName} onChange={value => setFormData(prev => ({
                    ...prev,
                    lastName: value
                  }))} />
                      </> : <>
                        <div className="md:col-span-2">
                          <InputField label="Firmenname" name="companyName" icon={Building} placeholder="z.B. Mustermann Bau GmbH" required value={formData.companyName} onChange={value => setFormData(prev => ({
                      ...prev,
                      companyName: value
                    }))} />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Gesellschaftsform <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select value={formData.legalForm} onChange={e => setFormData(prev => ({
                        ...prev,
                        legalForm: e.target.value
                      }))} className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base appearance-none ${errors.legalForm ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}>
                              <option value="">Gesellschaftsform wählen</option>
                              {legalForms.map(form => <option key={form} value={form}>{form}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                          </div>
                          {errors.legalForm && <p className="text-sm text-red-600">{errors.legalForm}</p>}
                        </div>

                        <InputField label="USt-ID (optional)" name="taxId" icon={Hash} placeholder="z.B. DE123456789" value={formData.taxId} onChange={value => setFormData(prev => ({
                    ...prev,
                    taxId: value
                  }))} />
                      </>}

                    <InputField label="Kundennummer" name="customerNumber" icon={Hash} placeholder={`z.B. ${customerType === 'Privatperson' ? 'KP' : 'KU'}123456`} required value={formData.customerNumber} onChange={value => setFormData(prev => ({
                  ...prev,
                  customerNumber: value
                }))} />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select value={formData.status} onChange={e => setFormData(prev => ({
                    ...prev,
                    status: e.target.value as any
                  }))} className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base">
                        <option value="Aktiv">Aktiv</option>
                        <option value="Inaktiv">Inaktiv</option>
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Person for Company */}
                {customerType === 'Unternehmen' && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Ansprechpartner
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Vorname" name="contactFirstName" icon={User} placeholder="z.B. Max" required value={formData.contactFirstName} onChange={value => setFormData(prev => ({
                  ...prev,
                  contactFirstName: value
                }))} />
                      <InputField label="Nachname" name="contactLastName" icon={User} placeholder="z.B. Mustermann" required value={formData.contactLastName} onChange={value => setFormData(prev => ({
                  ...prev,
                  contactLastName: value
                }))} />
                    </div>
                  </motion.div>}

                {/* Contact Information */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Kontaktdaten
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="E-Mail-Adresse" name="email" type="email" icon={Mail} placeholder="z.B. max.mustermann@email.de" required value={formData.email} onChange={value => setFormData(prev => ({
                  ...prev,
                  email: value
                }))} />
                    <InputField label="Telefonnummer" name="phone" type="tel" icon={Phone} placeholder="z.B. +49 123 456789" required value={formData.phone} onChange={value => setFormData(prev => ({
                  ...prev,
                  phone: value
                }))} />
                  </div>
                </motion.div>

                {/* Address */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4
            }} className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Adresse
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <InputField label="Straße" name="street" icon={MapPin} placeholder="z.B. Musterstraße" required value={formData.street} onChange={value => setFormData(prev => ({
                    ...prev,
                    street: value
                  }))} />
                    </div>
                    <InputField label="Hausnummer" name="houseNumber" icon={Hash} placeholder="z.B. 123" value={formData.houseNumber} onChange={value => setFormData(prev => ({
                  ...prev,
                  houseNumber: value
                }))} />
                    <InputField label="PLZ" name="postalCode" icon={Hash} placeholder="z.B. 12345" required value={formData.postalCode} onChange={value => setFormData(prev => ({
                  ...prev,
                  postalCode: value
                }))} />
                    <div className="md:col-span-4">
                      <InputField label="Ort" name="city" icon={MapPin} placeholder="z.B. München" required value={formData.city} onChange={value => setFormData(prev => ({
                    ...prev,
                    city: value
                  }))} />
                    </div>
                  </div>
                </motion.div>

                {/* Project Assignments - Only for Company */}
                {customerType === 'Unternehmen' && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.5
            }} className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      Projektzuordnung
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
                      {availableProjects.map(project => <label key={project} className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-slate-200">
                          <input type="checkbox" checked={formData.projectAssignments.includes(project)} onChange={() => handleProjectToggle(project)} className="text-blue-600 focus:ring-blue-500 rounded w-4 h-4" />
                          <span className="text-sm text-slate-700 font-medium">{project}</span>
                        </label>)}
                    </div>
                    
                    {formData.projectAssignments.length > 0 && <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        {formData.projectAssignments.length} Projekt{formData.projectAssignments.length !== 1 ? 'e' : ''} ausgewählt
                      </div>}
                  </motion.div>}

                {/* Internal Notes */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6
            }} className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Notizen
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Interne Notizen (optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      <textarea value={formData.internalNotes} onChange={e => setFormData(prev => ({
                    ...prev,
                    internalNotes: e.target.value
                  }))} placeholder="Interne Notizen zum Kunden..." rows={4} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-base" />
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
            }} type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Speichern...' : 'Kunde speichern'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>}
    </AnimatePresence>;
}