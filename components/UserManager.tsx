
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getUsers, saveUser, deleteUser, StoredUser } from '../utils/storage';
import { Plus, Trash2, UserPlus, Users, Shield, User as UserIcon, Lock, X, Check } from 'lucide-react';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'brigadista' as UserRole
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;

    setLoading(true);
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role
    };

    await saveUser(newUser);
    await loadUsers();
    setIsAdding(false);
    setFormData({ name: '', username: '', password: '', role: 'brigadista' });
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o usuário ${name}?`)) {
      await deleteUser(id);
      await loadUsers();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl text-white">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Gestão de Equipe</h3>
            <p className="text-sm text-slate-500">Controle de acesso e permissões do sistema.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-slate-400 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${user.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{user.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">@{user.username}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(user.id, user.name)}
              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Remover Usuário"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                 <UserPlus className="text-slate-900" size={20} />
                 <h3 className="text-lg font-bold">Cadastrar Novo Membro</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none" 
                    placeholder="Ex: João Silva" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário (Login)</label>
                  <input 
                    required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none font-mono" 
                    placeholder="joao.silva" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none" 
                      placeholder="••••••" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perfil de Acesso</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'brigadista'})}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-xs ${formData.role === 'brigadista' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    <UserIcon size={16} />
                    Brigadista
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-xs ${formData.role === 'admin' ? 'bg-red-50 border-red-600 text-red-700' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    <Shield size={16} />
                    Administrador
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3.5 font-bold text-slate-500 rounded-xl hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <Check size={18} />}
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
