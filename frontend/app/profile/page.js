'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const router = useRouter();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsEditingProfile(true);
    const success = await updateProfile(profileData);
    setIsEditingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
        setPasswordError('Las contraseñas no coinciden');
        return;
    }
    if (passwordData.new_password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    setIsChangingPassword(true);
    const success = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
    });
    
    if (success) {
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    }
    setIsChangingPassword(false);
  };

  if (loading) return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">


      <div className="w-full mx-auto px-4 py-8 max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Column: Profile Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <i className="fa fa-user-circle text-blue-600"></i> Información Personal
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleProfileSubmit}>
                            <div className="mb-8 text-left">
                                <label className="block text-gray-700 text-sm font-bold ml-1 mb-2">Usuario</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa fa-lock text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={user?.username || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed shadow-inner"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                                <div className="flex flex-col gap-2">
                                    <label className="block text-gray-700 text-sm font-bold text-left ml-1">Nombre</label>
                                    <input 
                                        type="text" 
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="block text-gray-700 text-sm font-bold text-left ml-1">Apellido</label>
                                    <input 
                                        type="text" 
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Tu apellido"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-gray-700 text-sm font-bold mb-3">Correo Electrónico</label>
                                <div className="relative">
                                    <i className="fa fa-envelope absolute left-4 top-4 text-gray-400"></i>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition outline-none text-gray-800 shadow-sm"
                                        placeholder="ejemplo@milla7.com"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-end pt-6 border-t border-gray-100 mt-12" style={{ marginTop: '3.5rem' }}>
                                <button 
                                    type="submit" 
                                    disabled={isEditingProfile}
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {isEditingProfile ? (
                                        <><i className="fa fa-spinner fa-spin"></i> Guardando...</>
                                    ) : (
                                        <><i className="fa fa-save"></i> Guardar Cambios</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Column: Security */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 bg-red-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                            <i className="fa fa-shield-alt"></i> Seguridad
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handlePasswordSubmit}>
                            {passwordError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                                    <i className="fa fa-exclamation-circle mt-0.5"></i>
                                    <span>{passwordError}</span>
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide mb-2">Contraseña Actual</label>
                                <input 
                                    type="password" 
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 transition outline-none"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide mb-2">Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 transition outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide mb-2">Confirmar</label>
                                <input 
                                    type="password" 
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 transition outline-none"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isChangingPassword}
                                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isChangingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Session Info (Optional) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                     <div>
                         <h3 className="text-sm font-semibold text-gray-800">Rol de Usuario</h3>
                         <p className="text-xs text-gray-500 mt-1">{user?.role_name || user?.role || 'Estándar'}</p>
                     </div>
                     <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold uppercase">
                         Activo
                     </div>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
}
