
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para validar se a string é uma URL válida
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const getKeys = () => {
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;
  
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  return {
    url: (envUrl || localUrl || '').trim(),
    key: (envKey || localKey || '').trim()
  };
};

const { url, key } = getKeys();

let supabaseInstance = null;

// Só tenta inicializar se houver URL e Chave, e se a URL for válida
if (url && key) {
  if (isValidUrl(url)) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (err) {
      console.error("Erro crítico ao inicializar Supabase:", err);
      // Limpa chaves problemáticas para evitar loops de erro no próximo reload
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_key');
    }
  } else {
    console.warn("URL do Supabase inválida. O sistema operará em modo LocalStorage.");
  }
}

export const supabase = supabaseInstance;

export const reinitializeSupabase = (newUrl: string, newKey: string) => {
  if (newUrl && newKey) {
    if (isValidUrl(newUrl)) {
      localStorage.setItem('supabase_url', newUrl.trim());
      localStorage.setItem('supabase_key', newKey.trim());
      // Força o recarregamento para aplicar a nova conexão
      window.location.reload();
    } else {
      alert("A URL informada não é válida. Exemplo: https://xyz.supabase.co");
    }
  }
};

if (!supabase) {
  console.info("FireGuard operando em modo LocalStorage (Offline/Híbrido).");
}
