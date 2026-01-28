
import { Extinguisher, Inspection, ChecklistItem, ExtinguisherType, SystemConfig, User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

const KEYS = {
  EXTINGUISHERS: 'fireguard_extinguishers',
  INSPECTIONS: 'fireguard_inspections',
  CHECKLIST: 'fireguard_checklist_items',
  TYPES: 'fireguard_extinguisher_types',
  SYSTEM_CONFIG: 'fireguard_system_config',
  USERS: 'fireguard_users',
};

// --- Users Management ---
export interface StoredUser extends User {
  password?: string;
}

export const getUsers = async (): Promise<StoredUser[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) return data.map(d => ({
        id: d.id,
        name: d.name,
        username: d.username,
        role: d.role as UserRole,
        password: d.password
      }));
    } catch (e) { console.warn("Tabela users não encontrada."); }
  }
  
  const local = localStorage.getItem(KEYS.USERS);
  const users = local ? JSON.parse(local) : [];
  
  // Usuários padrão se estiver vazio
  if (users.length === 0) {
    // Added explicit type to defaults to satisfy UserRole constraints
    const defaults: StoredUser[] = [
      { id: '1', name: 'Administrador Principal', username: 'admin', role: 'admin', password: 'admin123' },
      { id: '2', name: 'Brigadista Alpha', username: 'brigadista', role: 'brigadista', password: 'fogo123' }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaults));
    return defaults;
  }
  
  return users;
};

export const saveUser = async (user: StoredUser) => {
  const current = await getUsers();
  const index = current.findIndex(u => u.id === user.id);
  if (index >= 0) current[index] = user; else current.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(current));

  if (supabase) {
    try {
      await supabase.from('users').upsert({
        id: user.id,
        name: user.name,
        username: user.username,
        password: user.password,
        role: user.role
      });
    } catch (e) { console.error(e); }
  }
};

export const deleteUser = async (id: string) => {
  const current = await getUsers();
  const updated = current.filter(u => u.id !== id);
  localStorage.setItem(KEYS.USERS, JSON.stringify(updated));

  if (supabase) {
    try {
      await supabase.from('users').delete().eq('id', id);
    } catch (e) { console.error(e); }
  }
};

// --- System Config ---
export const getSystemConfig = async (): Promise<SystemConfig> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('system_config').select('*').eq('id', 1).single();
      // Fixed: mapping logo_url from DB to logoUrl in SystemConfig type
      if (!error && data) return { appName: data.app_name, logoUrl: data.logo_url };
    } catch (e) { console.warn("Tabela system_config não encontrada ou erro de conexão."); }
  }
  
  const local = localStorage.getItem(KEYS.SYSTEM_CONFIG);
  return local ? JSON.parse(local) : { appName: 'FireGuard' };
};

export const saveSystemConfig = async (config: SystemConfig) => {
  localStorage.setItem(KEYS.SYSTEM_CONFIG, JSON.stringify(config));
  if (supabase) {
    try {
      await supabase.from('system_config').upsert({ id: 1, app_name: config.appName, logo_url: config.logoUrl });
    } catch (e) { console.error("Falha ao salvar config na nuvem."); }
  }
};

// --- Extinguisher Types ---
export const getExtinguisherTypes = async (): Promise<ExtinguisherType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('extinguisher_types').select('*');
      if (!error && data) return data;
    } catch (e) { console.warn("Tabela extinguisher_types não encontrada."); }
  }
  
  const local = localStorage.getItem(KEYS.TYPES);
  return local ? JSON.parse(local) : [];
};

export const saveExtinguisherTypes = async (types: ExtinguisherType[]) => {
  localStorage.setItem(KEYS.TYPES, JSON.stringify(types));
  if (supabase) {
    try {
      await supabase.from('extinguisher_types').delete().neq('id', '0');
      await supabase.from('extinguisher_types').insert(types);
    } catch (e) { console.error(e); }
  }
};

// --- Checklist Items ---
export const getChecklistItems = async (): Promise<ChecklistItem[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('checklist_items').select('*');
      if (!error && data) return data;
    } catch (e) { console.warn("Tabela checklist_items não encontrada."); }
  }
  
  const local = localStorage.getItem(KEYS.CHECKLIST);
  return local ? JSON.parse(local) : [];
};

export const saveChecklistItems = async (items: ChecklistItem[]) => {
  localStorage.setItem(KEYS.CHECKLIST, JSON.stringify(items));
  if (supabase) {
    try {
      await supabase.from('checklist_items').delete().neq('id', '0');
      await supabase.from('checklist_items').insert(items);
    } catch (e) { console.error(e); }
  }
};

// --- Extinguishers ---
export const getExtinguishers = async (): Promise<Extinguisher[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('extinguishers').select('*');
      if (!error && data) return data.map(d => ({
        id: d.id,
        code: d.code,
        type: d.type,
        capacity: d.capacity,
        location: d.location,
        manufactureDate: d.manufacture_date,
        expiryDate: d.expiry_date,
        status: d.status,
        lastInspectionId: d.last_inspection_id
      }));
    } catch (e) { console.warn("Tabela extinguishers não encontrada."); }
  }
  
  const local = localStorage.getItem(KEYS.EXTINGUISHERS);
  return local ? JSON.parse(local) : [];
};

export const saveExtinguisher = async (ext: Extinguisher) => {
  const current = await getExtinguishers();
  const index = current.findIndex(e => e.id === ext.id);
  if (index >= 0) current[index] = ext; else current.push(ext);
  localStorage.setItem(KEYS.EXTINGUISHERS, JSON.stringify(current));

  if (supabase) {
    try {
      await supabase.from('extinguishers').upsert({
        id: ext.id,
        code: ext.code,
        type: ext.type,
        capacity: ext.capacity,
        location: ext.location,
        manufacture_date: ext.manufactureDate,
        expiry_date: ext.expiryDate,
        status: ext.status,
        last_inspection_id: ext.lastInspectionId
      });
    } catch (e) { console.error(e); }
  }
};

// --- Inspections ---
export const getInspections = async (): Promise<Inspection[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('inspections').select('*');
      if (!error && data) return data.map(d => ({
        id: d.id,
        extinguisherId: d.extinguisher_id,
        date: d.date,
        inspector: d.inspector,
        responses: d.responses,
        notes: d.notes,
        status: d.status,
        photoUrl: d.photo_url
      }));
    } catch (e) { console.warn("Tabela inspections não encontrada."); }
  }
  
  const local = localStorage.getItem(KEYS.INSPECTIONS);
  return local ? JSON.parse(local) : [];
};

export const saveInspection = async (inspection: Inspection) => {
  const current = await getInspections();
  current.push(inspection);
  localStorage.setItem(KEYS.INSPECTIONS, JSON.stringify(current));

  if (supabase) {
    try {
      await supabase.from('inspections').insert({
        id: inspection.id,
        extinguisher_id: inspection.extinguisherId,
        date: inspection.date,
        inspector: inspection.inspector,
        responses: inspection.responses,
        notes: inspection.notes,
        status: inspection.status,
        photo_url: inspection.photoUrl
      });
      
      await supabase.from('extinguishers')
        .update({ last_inspection_id: inspection.id })
        .eq('id', inspection.extinguisherId);
    } catch (e) { console.error(e); }
  }
};

export const seedInitialData = async () => {
  const types = await getExtinguisherTypes();
  if (types.length === 0) {
    const initialTypes: ExtinguisherType[] = [
      { id: '1', name: 'Pó Químico Seco' },
      { id: '2', name: 'Dióxido de Carbono' },
      { id: '3', name: 'Água Pressurizada' },
      { id: '4', name: 'Espuma Mecânica' }
    ];
    await saveExtinguisherTypes(initialTypes);
  }

  const checklist = await getChecklistItems();
  if (checklist.length === 0) {
    const initialChecklist: ChecklistItem[] = [
      { id: 'manometer', label: 'Manômetro na faixa verde' },
      { id: 'seal', label: 'Lacre intacto e original' },
      { id: 'hose', label: 'Mangueira sem rachaduras' },
      { id: 'signage', label: 'Sinalização visível' },
      { id: 'access', label: 'Acesso desobstruído' },
      { id: 'casing', label: 'Casco sem corrosão' }
    ];
    await saveChecklistItems(initialChecklist);
  }

  // Garante que o usuário admin padrão exista
  await getUsers();
};
