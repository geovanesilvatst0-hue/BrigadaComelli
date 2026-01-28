
import { createClient } from '@supabase/supabase-js';

// =========================================================
// COLOQUE SEUS DADOS DO SUPABASE AQUI:
// =========================================================
const HARDCODED_URL = 'https://liljjjidyfpvjwduecsj.supabase.co'; 
const HARDCODED_KEY = 'sb_publishable_horimZiIM7aLWMERbCdfDA_Kq'; 
// =========================================================

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Chaves do Supabase são sempre JWTs (possuem 3 partes separadas por pontos)
const isLikelyJWT = (key: string) => {
  return key.split('.').length === 3;
};

const getKeys = () => {
  let envUrl = HARDCODED_URL;
  let envKey = HARDCODED_KEY;

  try {
    if (!envUrl && typeof process !== 'undefined' && process.env) {
      envUrl = process.env.SUPABASE_URL || '';
    }
    if (!envKey && typeof process !== 'undefined' && process.env) {
      envKey = process.env.SUPABASE_ANON_KEY || '';
    }
  } catch (e) {}
  
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  const finalUrl = (envUrl || localUrl || '').trim();
  const finalKey = (envKey || localKey || '').trim();

  return { url: finalUrl, key: finalKey };
};

const { url, key } = getKeys();

let supabaseInstance = null;

if (url && key && isValidUrl(url)) {
  if (!isLikelyJWT(key)) {
    console.error("ERRO: A 'Anon Key' do Supabase deve ser um código longo (JWT). A chave fornecida parece inválida.");
  } else {
    try {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: true },
        // Fix: Use explicit parameters (input, init) instead of spreading ...args to resolve 
        // TypeScript error concerning spread arguments on functions with fixed parameter counts.
        global: { fetch: (input: any, init?: any) => fetch(input, init).catch(err => {
          console.warn("Erro de rede no Supabase:", err);
          throw err;
        })}
      });
      console.log("Tentando conectar ao Supabase...");
    } catch (err) {
      console.error("Falha crítica ao criar cliente Supabase:", err);
    }
  }
} else {
  console.warn("Dados de conexão ausentes ou inválidos. Operando em modo Local.");
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
