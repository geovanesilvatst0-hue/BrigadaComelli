
import React, { useState, useEffect } from 'react';
import { User, SystemConfig } from '../types';
import { getSystemConfig, getUsers } from '../utils/storage';
import { Shield, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({ appName: 'FireGuard' });

  useEffect(() => {
    const loadConfig = async () => {
      const systemConfig = await getSystemConfig();
      setConfig(systemConfig);
    };
    
    loadConfig();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const users = await getUsers();
      const foundUser = users.find(u => u.username === username && u.password === password);
      
      if (foundUser) {
        onLogin({ 
          id: foundUser.id, 
          name: foundUser.name, 
          username: foundUser.username, 
          role: foundUser.role 
        });
      } else {
        setError('Credenciais inválidas. Verifique seu usuário e senha.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-red-600 rounded-2xl shadow-xl shadow-red-900/40 mb-4 overflow-hidden w-20 h-20">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Shield size={40} className="text-white" fill="currentColor" />
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{config.appName}</h1>
          <p className="text-slate-400 mt-2 font-medium">Gestão de Prevenção e Combate</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Acessar Sistema</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                <AlertCircle size={18} />
                <p className="text-xs font-bold uppercase">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Acesso Restrito</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
