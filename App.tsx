
import React, { useState, useEffect } from 'react';
import { Extinguisher, Inspection, ExtinguisherType as ExtType, User, SystemConfig } from './types';
import { getExtinguishers, getInspections, saveInspection, saveExtinguisher, seedInitialData, getExtinguisherTypes, getSystemConfig } from './utils/storage';
import Dashboard from './components/Dashboard';
import ExtinguisherList from './components/ExtinguisherList';
import InspectionForm from './components/InspectionForm';
import ChecklistManager from './components/ChecklistManager';
import TypeManager from './components/TypeManager';
import Login from './components/Login';
import SystemSettings from './components/SystemSettings';
import UserManager from './components/UserManager';
import { Shield, Bell, Settings, Menu, X, Plus, ListChecks, Flame, LogOut, LayoutDashboard, Package, History, ClipboardCheck, Loader2, Cloud, AlertTriangle, CloudOff, Globe, Users, WifiOff, RefreshCcw } from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [extinguishers, setExtinguishers] = useState<Extinguisher[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ExtType[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ appName: 'FireGuard' });
  const [selectedExtinguisher, setSelectedExtinguisher] = useState<Extinguisher | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddingExtinguisher, setIsAddingExtinguisher] = useState(false);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false);

  useEffect(() => {
    // Timer de segurança para não travar na tela branca
    const timer = setTimeout(() => {
      if (loading) setLoadingTimeout(true);
    }, 6000);

    const init = async () => {
      try {
        setLoading(true);
        
        if (supabase) {
          try {
            // Tenta um ping rápido no banco
            const { error } = await supabase.from('extinguisher_types').select('id').limit(1).timeout(4000);
            setIsSupabaseOnline(!error);
          } catch (e) {
            console.warn("Banco offline ou timeout.");
            setIsSupabaseOnline(false);
          }
        }

        await seedInitialData();
        await refreshData();
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };
    init();
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'brigadista' ? 'extinguishers' : 'dashboard');
    }
  }, [user]);

  const refreshData = async () => {
    try {
      const [exts, insps, types, config] = await Promise.all([
        getExtinguishers(),
        getInspections(),
        getExtinguisherTypes(),
        getSystemConfig()
      ]);
      setExtinguishers(exts || []);
      setInspections(insps || []);
      setAvailableTypes(types || []);
      setSystemConfig(config || { appName: 'FireGuard' });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  const handleLogin = (loggedInUser: User) => setUser(loggedInUser);
  const handleLogout = () => setUser(null);

  const handleInspect = (ext: Extinguisher) => {
    setSelectedExtinguisher(ext);
    setActiveTab('inspect-form');
  };

  const onInspectionSubmit = async (inspection: Inspection) => {
    setLoading(true);
    await saveInspection(inspection);
    setSelectedExtinguisher(null);
    setActiveTab(user?.role === 'admin' ? 'dashboard' : 'extinguishers');
    await refreshData();
    setLoading(false);
  };

  const handleAddExtinguisher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newExt: Extinguisher = {
      id: Date.now().toString(),
      code: formData.get('code') as string,
      type: formData.get('type') as string,
      capacity: formData.get('capacity') as string,
      location: formData.get('location') as string,
      manufactureDate: formData.get('manufactureDate') as string,
      expiryDate: formData.get('expiryDate') as string,
      status: 'active'
    };
    await saveExtinguisher(newExt);
    setIsAddingExtinguisher(false);
    await refreshData();
    setLoading(false);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-sm">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-white font-bold text-lg">Iniciando FireGuard</h2>
            <p className="text-slate-400 text-sm">Sincronizando com o banco de dados...</p>
          </div>
          
          {loadingTimeout && (
            <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2">
              <p className="text-amber-200 text-xs mb-4">A conexão está demorando mais que o esperado. Isso pode ser devido a uma chave inválida ou falta de internet.</p>
              <button 
                onClick={() => setLoading(false)}
                className="w-full bg-amber-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-amber-500 flex items-center justify-center gap-2"
              >
                <WifiOff size={16} />
                Entrar em Modo Local
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeTab === 'inspect-form' && selectedExtinguisher) {
      return (
        <InspectionForm 
          extinguisher={selectedExtinguisher} 
          onSubmit={onInspectionSubmit}
          onCancel={() => {
            setSelectedExtinguisher(null);
            setActiveTab('extinguishers');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? <Dashboard extinguishers={extinguishers} /> : null;
      case 'extinguishers':
        return (
          <ExtinguisherList 
            extinguishers={extinguishers} 
            onInspect={handleInspect} 
            onAdd={() => {
              if (user.role === 'admin') setIsAddingExtinguisher(true);
            }}
          />
        );
      case 'users':
        return user.role === 'admin' ? <UserManager /> : null;
      case 'checklist':
        return user.role === 'admin' ? <ChecklistManager /> : null;
      case 'types':
        return user.role === 'admin' ? <TypeManager /> : null;
      case 'system':
        return user.role === 'admin' ? <SystemSettings onUpdate={setSystemConfig} /> : null;
      case 'history':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Extintor</th>
                    <th className="px-6 py-4">Inspetor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ins => {
                    const ext = extinguishers.find(e => e.id === ins.extinguisherId);
                    return (
                      <tr key={ins.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm">{new Date(ins.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium">{ext?.code || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">{ins.inspector}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${ins.status === 'Conforme' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {ins.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{ins.notes}</td>
                      </tr>
                    )
                  })}
                  {inspections.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhum histórico disponível.</td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    ...(user.role === 'admin' ? [{ id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> }] : []),
    { id: 'extinguishers', label: 'Extintores', icon: <Package size={20} /> },
    { id: 'history', label: 'Histórico', icon: <History size={20} /> },
    ...(user.role === 'admin' ? [
      { id: 'users', label: 'Equipe', icon: <Users size={20} /> },
      { id: 'checklist', label: 'Checklist', icon: <ListChecks size={20} /> },
      { id: 'types', label: 'Tipos', icon: <Flame size={20} /> }
    ] : [])
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl">
              {systemConfig.logoUrl ? (
                <img src={systemConfig.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Shield size={24} className="text-red-500" fill="currentColor" />
              )}
            </div>
            <h1 className="text-xl font-black tracking-tight text-white truncate">{systemConfig.appName}</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800 pt-6">
            <div className={`flex items-center gap-3 mb-4 px-3 py-2.5 rounded-xl border transition-all ${isSupabaseOnline ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : (supabase ? 'bg-amber-600/10 border-amber-500/30 text-amber-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400')}`}>
              {isSupabaseOnline ? <Globe size={16} className="animate-pulse" /> : (supabase ? <WifiOff size={16} /> : <CloudOff size={16} />)}
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status</span>
                <span className="text-[9px] font-bold uppercase opacity-80 mt-0.5">
                  {isSupabaseOnline ? 'Sincronizado' : (supabase ? 'Erro no Banco' : 'Modo Offline')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-6 px-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role}</p>
              </div>
            </div>
            
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors mb-2 ${activeTab === 'system' ? 'text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                <Settings size={18} />
                Sistema
              </button>
            )}

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden md:block">
              {navItems.find(t => t.id === activeTab)?.label || (activeTab === 'system' ? 'Sistema' : 'Inspeção')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
            {user.role === 'admin' && activeTab === 'extinguishers' && (
              <button 
                onClick={() => setIsAddingExtinguisher(true)}
                className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
              >
                <Plus size={18} />
                Adicionar Registro
              </button>
            )}
          </div>
        </header>

        <div className="p-6 md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {isAddingExtinguisher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold">Novo Extintor</h3>
              <button onClick={() => setIsAddingExtinguisher(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddExtinguisher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código</label>
                  <input name="code" required className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" placeholder="EXT-XXX" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacidade</label>
                  <input name="capacity" required className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" placeholder="Ex: 4kg" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                <select name="type" required className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Selecione um tipo...</option>
                  {availableTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Localização</label>
                <input name="location" required className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" placeholder="Setor / Bloco" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fabricação</label>
                  <input type="date" name="manufactureDate" required className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vencimento</label>
                  <input type="date" name="expiryDate" required className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddingExtinguisher(false)} className="flex-1 py-3 font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 flex items-center justify-center gap-2">
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
