"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, User, Mail, Phone, MapPin, Hash, FileText, CheckCircle, Save, Plus } from 'lucide-react';
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
}
interface CustomerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
  customer?: Customer | null;
  availableProjects?: string[];
}
const availableConstructionProjects = ['Bürogebäude München Zentrum', 'Wohnkomplex Hamburg Nord', 'Industriehalle Berlin Süd', 'Einkaufszentrum Frankfurt', 'Logistikzentrum Köln', 'Krankenhaus Düsseldorf', 'Schule Stuttgart West', 'Parkhaus Hannover', 'Brücke Bremen', 'Tunnel Leipzig'];

// InputField component defined outside to prevent re-creation on every render
const InputField = React.memo(({
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
}) => {
  console.log(`🔍 InputField render: ${name}, value: "${value}", error: "${error}"`);
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type={type} 
          value={value} 
          onChange={e => {
            console.log(`📝 InputField onChange: ${name}, new value: "${e.target.value}"`);
            onChange(e.target.value);
          }}
          onFocus={() => console.log(`🎯 InputField focus: ${name}`)}
          onBlur={() => console.log(`❌ InputField blur: ${name}`)}
          placeholder={placeholder} 
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-slate-300'}`} 
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
});

export function CustomerCreationModal({
  isOpen,
  onClose,
  onSave,
  customer = null,
  availableProjects = availableConstructionProjects
}: CustomerCreationModalProps) {
  console.log('🚀 CustomerCreationModal render, isOpen:', isOpen, 'customer:', customer);
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    phone: '',
    street: '',
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
    const prefix = 'KD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };
  useEffect(() => {
    console.log('🔄 useEffect triggered, isOpen:', isOpen, 'customer:', customer);
    if (isOpen) {
      if (customer) {
        console.log('📝 Setting form data from existing customer:', customer);
        setFormData({
          companyName: customer.companyName,
          contactFirstName: customer.contactFirstName,
          contactLastName: customer.contactLastName,
          email: customer.email,
          phone: customer.phone,
          street: customer.street,
          postalCode: customer.postalCode,
          city: customer.city,
          customerNumber: customer.customerNumber,
          projectAssignments: customer.projectAssignments || [],
          internalNotes: customer.internalNotes,
          status: customer.status
        });
      } else {
        console.log('📝 Setting form data for new customer');
        setFormData({
          companyName: '',
          contactFirstName: '',
          contactLastName: '',
          email: '',
          phone: '',
          street: '',
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
      console.log('✅ Form reset complete');
    }
  }, [isOpen, customer]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Firmenname ist erforderlich';
    }
    if (!formData.contactFirstName.trim()) {
      newErrors.contactFirstName = 'Vorname ist erforderlich';
    }
    if (!formData.contactLastName.trim()) {
      newErrors.contactLastName = 'Nachname ist erforderlich';
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
        companyName: formData.companyName.trim(),
        contactFirstName: formData.contactFirstName.trim(),
        contactLastName: formData.contactLastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        street: formData.street.trim(),
        postalCode: formData.postalCode.trim(),
        city: formData.city.trim(),
        customerNumber: formData.customerNumber.trim(),
        projectAssignments: formData.projectAssignments,
        internalNotes: formData.internalNotes.trim(),
        status: formData.status
      };
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
  const handleProjectToggle = useCallback((project: string) => {
    setFormData(prev => ({
      ...prev,
      projectAssignments: prev.projectAssignments.includes(project) ? prev.projectAssignments.filter(p => p !== project) : [...prev.projectAssignments, project]
    }));
  }, []);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    console.log(`🔄 handleInputChange called: ${field} = "${value}"`);
    setFormData(prev => {
      console.log(`📊 Previous formData:`, prev);
      const newData = {
        ...prev,
        [field]: value
      };
      console.log(`📊 New formData:`, newData);
      return newData;
    });
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    console.log(`🔄 handleStatusChange called: status = "${value}"`);
    setFormData(prev => ({
      ...prev,
      status: value as 'Aktiv' | 'Inaktiv'
    }));
  }, []);

  const handleNotesChange = useCallback((value: string) => {
    console.log(`🔄 handleNotesChange called: internalNotes = "${value}"`);
    setFormData(prev => ({
      ...prev,
      internalNotes: value
    }));
  }, []);
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
              Der Kunde wurde erfolgreich im System {isEditing ? 'aktualisiert' : 'angelegt'}.
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
      }} className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {isEditing ? <Building className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-8">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Firmeninformationen
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <InputField label="Firmenname" name="companyName" icon={Building} placeholder="z.B. Mustermann Bau GmbH" required value={formData.companyName} onChange={value => handleInputChange('companyName', value)} error={errors.companyName} />
                    </div>
                    
                    <InputField label="Kundennummer" name="customerNumber" icon={Hash} placeholder="z.B. KD123456" required value={formData.customerNumber} onChange={value => handleInputChange('customerNumber', value)} error={errors.customerNumber} />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select value={formData.status} onChange={e => handleStatusChange(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="Aktiv">Aktiv</option>
                        <option value="Inaktiv">Inaktiv</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Ansprechpartner
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Vorname" name="contactFirstName" icon={User} placeholder="z.B. Max" required value={formData.contactFirstName} onChange={value => handleInputChange('contactFirstName', value)} error={errors.contactFirstName} />

                    <InputField label="Nachname" name="contactLastName" icon={User} placeholder="z.B. Mustermann" required value={formData.contactLastName} onChange={value => handleInputChange('contactLastName', value)} error={errors.contactLastName} />

                    <InputField label="E-Mail-Adresse" name="email" type="email" icon={Mail} placeholder="z.B. max.mustermann@firma.de" required value={formData.email} onChange={value => handleInputChange('email', value)} error={errors.email} />

                    <InputField label="Telefonnummer" name="phone" type="tel" icon={Phone} placeholder="z.B. +49 123 456789" required value={formData.phone} onChange={value => handleInputChange('phone', value)} error={errors.phone} />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Adresse
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <InputField label="Straße und Hausnummer" name="street" icon={MapPin} placeholder="z.B. Musterstraße 123" required value={formData.street} onChange={value => handleInputChange('street', value)} error={errors.street} />
                    </div>

                    <InputField label="Postleitzahl" name="postalCode" icon={Hash} placeholder="z.B. 12345" required value={formData.postalCode} onChange={value => handleInputChange('postalCode', value)} error={errors.postalCode} />

                    <div className="md:col-span-3">
                      <InputField label="Stadt" name="city" icon={MapPin} placeholder="z.B. München" required value={formData.city} onChange={value => handleInputChange('city', value)} error={errors.city} />
                    </div>
                  </div>
                </div>

                {/* Project Assignments */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Projektzuweisungen
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
                    {availableProjects.map(project => <label key={project} className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-slate-200">
                        <input type="checkbox" checked={formData.projectAssignments.includes(project)} onChange={() => handleProjectToggle(project)} className="text-blue-600 focus:ring-blue-500 rounded" />
                        <span className="text-sm text-slate-700 font-medium">{project}</span>
                      </label>)}
                  </div>
                  
                  {formData.projectAssignments.length > 0 && <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      {formData.projectAssignments.length} Projekt{formData.projectAssignments.length !== 1 ? 'e' : ''} ausgewählt
                    </div>}
                </div>

                {/* Internal Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Interne Notizen
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Notizen (optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      <textarea 
                      value={formData.internalNotes} 
                      onChange={e => {
                        console.log(`📝 Textarea onChange: internalNotes = "${e.target.value}"`);
                        handleNotesChange(e.target.value);
                      }}
                      onFocus={() => console.log(`🎯 Textarea focus: internalNotes`)}
                      onBlur={() => console.log(`❌ Textarea blur: internalNotes`)}
                      placeholder="Interne Notizen zum Kunden..." 
                      rows={4} 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                    />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="button" onClick={onClose} className="px-6 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                  Abbrechen
                </motion.button>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Speichern...' : 'Kunde speichern'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>}
    </AnimatePresence>;
}