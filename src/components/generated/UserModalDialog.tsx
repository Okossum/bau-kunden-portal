import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Eye, EyeOff, Building, Save, UserPlus, Building2 } from 'lucide-react';
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
  tenantId?: string; // Mandant-ID für mandantenfähige Verwaltung
}
interface UserModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User> & {
    password?: string;
  }) => void;
  user?: User | null;
  availableProjects?: string[];
  adminCompany?: string; // Firma des Admins für Employee-Rollen
}
const availableProjectsList = ['Projekt Alpha', 'Projekt Beta', 'Projekt Gamma', 'Projekt Delta', 'Projekt Epsilon', 'Bürogebäude München', 'Wohnkomplex Hamburg', 'Industriehalle Berlin'];

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
  console.log(`🔍 UserModalDialog InputField render: ${name}, value: "${value}", error: "${error}"`);
  
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
            console.log(`📝 UserModalDialog InputField onChange: ${name}, new value: "${e.target.value}"`);
            onChange(e.target.value);
          }}
          onFocus={() => console.log(`🎯 UserModalDialog InputField focus: ${name}`)}
          onBlur={() => console.log(`❌ UserModalDialog InputField blur: ${name}`)}
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

export function UserModalDialog({
  isOpen,
  onClose,
  onSave,
  user = null,
  availableProjects = availableProjectsList,
  adminCompany = 'MH Bau GmbH'
}: UserModalDialogProps) {
  console.log('UserModalDialog rendered with adminCompany:', adminCompany);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    role: 'Kunde' as 'Admin' | 'Kunde' | 'Employee' | 'Partner',
    status: 'Aktiv' as 'Aktiv' | 'Inaktiv',
    // Adressdaten
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    // Kontaktdaten
    phoneLandline: '',
    phoneMobile: '',
    // Systemdaten
    projects: [] as string[],
    tenantId: 'default-tenant' // Standard-Mandant-ID
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!user;
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          company: user.company || '',
          password: '',
          role: user.role,
          status: user.status,
          street: user.street || '',
          houseNumber: user.houseNumber || '',
          postalCode: user.postalCode || '',
          city: user.city || '',
          phoneLandline: user.phoneLandline || '',
          phoneMobile: user.phoneMobile || '',
          projects: user.projects || [],
          tenantId: user.tenantId || 'default-tenant'
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          password: '',
          role: 'Kunde',
          status: 'Aktiv',
          street: '',
          houseNumber: '',
          postalCode: '',
          city: '',
          phoneLandline: '',
          phoneMobile: '',
          projects: [],
          tenantId: 'default-tenant'
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, user]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Pflichtfelder validieren
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
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
    
    // Passwort validieren
    // Passwort validieren (optional, nur bei Bearbeitung)
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
    }
    
    // Telefonnummern validieren (optional)
    if (formData.phoneLandline && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneLandline)) {
      newErrors.phoneLandline = 'Ungültige Festnetznummer';
    }
    if (formData.phoneMobile && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneMobile)) {
      newErrors.phoneMobile = 'Ungültige Mobilnummer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 handleSubmit called, formData:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    console.log('✅ Form validation passed');
    setIsSubmitting(true);
    
    try {
      const userData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        role: formData.role,
        status: formData.status,
        street: formData.street.trim(),
        houseNumber: formData.houseNumber.trim(),
        postalCode: formData.postalCode.trim(),
        city: formData.city.trim(),
        phoneLandline: formData.phoneLandline.trim(),
        phoneMobile: formData.phoneMobile.trim(),
        projects: formData.projects,
        tenantId: formData.tenantId
      };
      
      if (formData.password) {
        userData.password = formData.password;
      }
      
      if (isEditing) {
        userData.id = user.id;
      }
      
      console.log('📤 Calling onSave with userData:', userData);
      await onSave(userData);
      console.log('✅ onSave completed successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleProjectToggle = useCallback((project: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.includes(project) ? prev.projects.filter(p => p !== project) : [...prev.projects, project]
    }));
  }, []);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    console.log(`🔄 UserModalDialog handleInputChange called: ${field} = "${value}"`);
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

  const handleRoleChange = useCallback((value: string) => {
    console.log(`🔄 UserModalDialog handleRoleChange called: role = "${value}"`);
    setFormData(prev => {
      let newCompany = prev.company;
      if (value === 'Employee' || value === 'Admin') {
        newCompany = adminCompany;
        console.log(`Setting company to admin company (${adminCompany}) for role: ${value}`);
        console.log('Current adminCompany prop:', adminCompany);
      }
      return {
        ...prev,
        role: value as 'Admin' | 'Kunde' | 'Employee' | 'Partner',
        company: newCompany
      };
    });
  }, [adminCompany]);

  const handleStatusChange = useCallback((value: string) => {
    console.log(`🔄 UserModalDialog handleStatusChange called: status = "${value}"`);
    setFormData(prev => ({
      ...prev,
      status: value as 'Aktiv' | 'Inaktiv'
    }));
  }, []);
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
      }} className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {isEditing ? <User className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {isEditing ? 'Benutzer bearbeiten' : 'Neuen Benutzer anlegen'}
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
              <div className="p-6 space-y-6">
                {/* Role and Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Rolle & Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Rolle</label>
                      <select 
                        value={formData.role} 
                        onChange={e => handleRoleChange(e.target.value)} 
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Admin">Admin - Vollzugriff auf alle Funktionen</option>
                        <option value="Employee">Employee - Erweiterte Berechtigungen</option>
                        <option value="Partner">Partner - Externe Partner mit eingeschränktem Zugriff</option>
                        <option value="Kunde">Kunde - Zugriff auf zugewiesene Projekte</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Status</label>
                      <select value={formData.status} onChange={e => handleStatusChange(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="Aktiv">Aktiv</option>
                        <option value="Inaktiv">Inaktiv</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Grundinformationen</h3>
                  
                  <InputField label="Vorname" name="firstName" icon={User} placeholder="z.B. Max" required value={formData.firstName} onChange={value => handleInputChange('firstName', value)} error={errors.firstName} />
                  <InputField label="Nachname" name="lastName" icon={User} placeholder="z.B. Mustermann" required value={formData.lastName} onChange={value => handleInputChange('lastName', value)} error={errors.lastName} />

                  <InputField label="E-Mail-Adresse" name="email" type="email" icon={Mail} placeholder="z.B. max.mustermann@example.com" required value={formData.email} onChange={value => handleInputChange('email', value)} error={errors.email} />

                  <InputField label="Firmenname" name="company" icon={Building2} placeholder="z.B. Mustermann GmbH" value={formData.company} onChange={value => handleInputChange('company', value)} error={errors.company} />

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Passwort (optional)
                      {isEditing && <span className="text-slate-500 text-xs">(leer lassen, um unverändert zu lassen)</span>}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={formData.password} 
                        onChange={e => {
                          console.log(`📝 Password onChange: "${e.target.value}"`);
                          setFormData(prev => ({
                            ...prev,
                            password: e.target.value
                          }));
                        }}
                        onFocus={() => console.log(`🎯 Password focus`)}
                        onBlur={() => console.log(`❌ Password blur`)}
                        placeholder="Passwort eingeben (optional)..." 
                        className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'}`} 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>

                {/* Adressdaten */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Adressdaten</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Straße" name="street" icon={Building} placeholder="z.B. Musterstraße" required value={formData.street} onChange={value => handleInputChange('street', value)} error={errors.street} />
                    <InputField label="Hausnummer" name="houseNumber" icon={Building} placeholder="z.B. 123" required value={formData.houseNumber} onChange={value => handleInputChange('houseNumber', value)} error={errors.houseNumber} />
                    <InputField label="Postleitzahl" name="postalCode" icon={Building} placeholder="z.B. 12345" required value={formData.postalCode} onChange={value => handleInputChange('postalCode', value)} error={errors.postalCode} />
                  </div>
                  <InputField label="Stadt" name="city" icon={Building} placeholder="z.B. München" required value={formData.city} onChange={value => handleInputChange('city', value)} error={errors.city} />
                </div>

                {/* Kontaktdaten */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Kontaktdaten</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Telefon (Festnetz)" name="phoneLandline" icon={Mail} placeholder="z.B. 089 123456" value={formData.phoneLandline} onChange={value => handleInputChange('phoneLandline', value)} error={errors.phoneLandline} />
                    <InputField label="Telefon (Mobil)" name="phoneMobile" icon={Mail} placeholder="z.B. 0170 123456" value={formData.phoneMobile} onChange={value => handleInputChange('phoneMobile', value)} error={errors.phoneMobile} />
                  </div>
                </div>

                {/* Project Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-900">Projektzuweisungen</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4">
                    {availableProjects.map(project => <label key={project} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                        <input type="checkbox" checked={formData.projects.includes(project)} onChange={() => handleProjectToggle(project)} className="text-blue-600 focus:ring-blue-500 rounded" />
                        <span className="text-sm text-slate-700">{project}</span>
                      </label>)}
                  </div>
                  
                  {formData.projects.length > 0 && <div className="text-sm text-slate-600">
                      {formData.projects.length} Projekt{formData.projects.length !== 1 ? 'e' : ''} ausgewählt
                    </div>}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="button" onClick={onClose} className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                  Abbrechen
                </motion.button>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Speichern...' : 'Speichern'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>}
    </AnimatePresence>;
}