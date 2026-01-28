
import React, { useState, useEffect, useRef } from 'react';
import { SystemConfig } from '../types';
import { getSystemConfig, saveSystemConfig } from '../utils/storage';
import { reinitializeSupabase, supabase } from '../lib/supabase';
import { Camera, Save, RefreshCcw, Shield, Cloud, Database, ExternalLink, AlertCircle, HelpCircle, ChevronRight, Copy, CheckCircle2, Wifi, WifiOff, Loader2 } from 'lucide-react';

interface Props {
  onUpdate: (config: SystemConfig) => void;
}

const SystemSettings: React.FC<Props> = ({ onUpdate }) => {
  const [config, setConfig] = useState<SystemConfig>({ appName: 'FireGuard' });
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('supabase_url') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('supabase_key') || '');
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SQL_SCRIPT = `-- Script de Criação de Tabelas para FireGuard

-- 1. Tipos de Extintores
CREATE TABLE IF NOT EXISTS extinguisher_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- 2. Itens do Checklist
CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

-- 3. Extintores
CREATE TABLE IF NOT EXISTS extinguishers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity TEXT NOT NULL,
  location TEXT NOT NULL,
  manufacture_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL,
  last_inspection_id TEXT
);

-- 4. Inspeções
CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  extinguisher_id TEXT REFERENCES extinguishers(id),
  date TIMESTAMPTZ NOT NULL,
  inspector TEXT NOT NULL,
  responses JSONB NOT NULL,
  notes TEXT,
  status TEXT NOT NULL,
  photo_url TEXT
);

-- 5. Usuários e Equipe
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

-- 6. Configuração do Sistema
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  app_name TEXT NOT NULL,
  logo_url TEXT
);`;

  useEffect(() => {
    const loadConfig = async () => {
      const current = await getSystemConfig();
      setConfig(current);
      if (current.logoUrl) setPreview(current.logoUrl);
    };
    
    loadConfig();
  }, []);

  const handleTestConnection = async () => {
    if (!supabase) {
      setConnStatus('error');
      setValidationError('Supabase não inicializado. Verifique URL e Chave.');
      return;
    }

    setTestingConn(true);
    setConnStatus('idle');
    setValidationError(null);

    try {
      // Tenta uma consulta simples para verificar se a tabela existe e se há conexão
      const { error } = await supabase.from('extinguisher_types').select('id').limit(1);
      
      if (error) {
        throw error;
      }

      setConnStatus('success');
    } catch (err: any) {
      console.error("Erro de conexão:", err);
      setConnStatus('error');
      setValidationError(err.message || 'Erro ao conectar. Verifique se as tabelas foram criadas no SQL Editor.');
    } finally {
      setTestingConn(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setConfig(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await saveSystemConfig(config);
    onUpdate(config);
    alert('Branding salvo com sucesso!');
  };

  const handleSaveDatabase = () => {
    const cleanUrl = dbUrl.trim();
    const cleanKey = dbKey.trim();

    if (!cleanUrl || !cleanKey) {
      setValidationError('Você deve preencher a URL e a Chave antes de conectar.');
      setTimeout(() => setValidationError(null), 5000);
      return;
    }
    
    setValidationError(null);
    reinitializeSupabase(cleanUrl, cleanKey);
  };

  const handleReset = () => {
    if (confirm('Deseja resetar para as configurações padrão?')) {
      const defaultConfig = { appName: 'FireGuard' };
      saveSystemConfig(defaultConfig);
      setConfig(defaultConfig);
      setPreview(null);
      onUpdate(defaultConfig);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Card de Branding */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-900 rounded-lg text-white">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Personalização Visual</h3>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-500 transition-all group"
            >
              {preview ? (
                <img src={preview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="mx-auto text-slate-400 group-hover:text-red-500 mb-1" size={24} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Logo</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              className="hidden" 
              accept="image/*" 
            />
            <p className="text-xs text-slate-400">Recomendado: PNG com fundo transparente</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Sistema</label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => setConfig(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-semibold"
                placeholder="Ex: FireGuard"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button onClick={handleReset} className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
              <RefreshCcw size={18} />
              Resetar
            </button>
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              <Save size={18} />
              Salvar Identidade
            </button>
          </div>
        </div>
      </div>

      {/* Card de Conexão Supabase */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Cloud size={120} />
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg text-white">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Configuração do Supabase</h3>
          </div>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${showHelp ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <HelpCircle size={16} />
            Próximos Passos
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-8">Conecte o banco de dados para sincronizar dados em tempo real.</p>

        <div className="space-y-6 relative z-10">
          {showHelp && (
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4">
                   Passo 1: Chaves de API
                </h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start text-xs text-blue-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">1</span>
                    <p>No Supabase, vá em <b>Settings > API</b> e copie a <b>Project URL</b> e a <b>Anon Key</b>.</p>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4">
                   Passo 2: Criar Tabelas (Obrigatório)
                </h4>
                <p className="text-xs text-blue-800 mb-4">Seu banco de dados precisa ter as tabelas para guardar os extintores. Siga estas ordens:</p>
                <ol className="space-y-3">
                  <li className="flex gap-3 items-start text-xs text-blue-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">A</span>
                    <p>No menu lateral do Supabase, clique em <b>SQL Editor</b>.</p>
                  </li>
                  <li className="flex gap-3 items-start text-xs text-blue-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">B</span>
                    <p>Clique em <b>New Query</b>.</p>
                  </li>
                  <li className="flex gap-3 items-start text-xs text-blue-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">C</span>
                    <p>Cole o código SQL abaixo e clique em <b>Run</b>.</p>
                  </li>
                </ol>
                
                <div className="mt-4 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                   <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Script SQL</span>
                      <button 
                        onClick={handleCopySql}
                        className={`flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded transition-all ${copied ? 'bg-green-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                      >
                        {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        {copied ? 'COPIADO!' : 'COPIAR SCRIPT'}
                      </button>
                   </div>
                   <div className="p-4 max-h-40 overflow-y-auto font-mono text-[10px] text-blue-300/80 leading-relaxed bg-slate-950">
                      <pre>{SQL_SCRIPT}</pre>
                   </div>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Ir para o SQL Editor no Supabase <ChevronRight size={12} />
                </a>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
             <AlertCircle className="text-amber-600 shrink-0" size={20} />
             <div className="space-y-1">
               <p className="text-xs text-amber-800 leading-relaxed font-bold">Dica de Verificação:</p>
               <p className="text-xs text-amber-800 leading-relaxed">Use o botão "Testar Conexão Real" abaixo para confirmar se as tabelas foram criadas corretamente.</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project URL</label>
              <input
                type="text"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs"
                placeholder="https://your-project.supabase.co"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anon Key (API Key)</label>
              <input
                type="password"
                value={dbKey}
                onChange={(e) => setDbKey(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleTestConnection}
              disabled={testingConn || !dbUrl || !dbKey}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-2 ${
                connStatus === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
                connStatus === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
                'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {testingConn ? (
                <Loader2 className="animate-spin" size={18} />
              ) : connStatus === 'success' ? (
                <Wifi size={18} />
              ) : connStatus === 'error' ? (
                <WifiOff size={18} />
              ) : (
                <Database size={18} />
              )}
              {testingConn ? 'Verificando Banco...' : 
               connStatus === 'success' ? 'Conexão Estabelecida com Sucesso!' :
               connStatus === 'error' ? 'Falha na Conexão (Verifique o SQL)' : 
               'Testar Conexão Real'}
            </button>

            <button 
              onClick={handleSaveDatabase}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Cloud size={18} />
              Salvar e Recarregar Sincronização
            </button>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl animate-shake">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase">{validationError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
