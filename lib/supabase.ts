
import { createClient } from '@supabase/supabase-js';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const getKeys = () => {
  let envUrl = '';
  let envKey = '';

  // Tentativa segura de acessar process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      envUrl = process.env.SUPABASE_URL || '';
      envKey = process.env.SUPABASE_ANON_KEY || '';
    }
  } catch (e) {
    // Ambiente sem process.env (ex: browser puro)
  }
  
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  return {
    url: (envUrl || localUrl || '').trim(),
    key: (envKey || localKey || '').trim()
  };
};

const { url, key } = getKeys();

let supabaseInstance = null;

if (url && key && isValidUrl(url)) {
  try {
    supabaseInstance = createClient(url, key);
  } catch (err) {
    console.error("Falha ao criar cliente Supabase:", err);
  }
}

export const supabase = supabaseInstance;

export const reinitializeSupabase = (newUrl: string, newKey: string) => {
  if (newUrl && newKey && isValidUrl(newUrl)) {
    localStorage.setItem('supabase_url', newUrl.trim());
    localStorage.setItem('supabase_key', newKey.trim());
    window.location.reload();
  } else {
    alert("URL ou Chave inválida.");
  }
};
