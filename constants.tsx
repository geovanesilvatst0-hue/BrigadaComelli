
import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  ClipboardCheck, 
  LayoutDashboard, 
  Package, 
  History,
  AlertCircle
} from 'lucide-react';

export const APP_NAME = "FireGuard";

export const NAVIGATION_TABS = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { id: 'extinguishers', label: 'Extintores', icon: <Package size={20} /> },
  { id: 'inspections', label: 'Inspeções', icon: <ClipboardCheck size={20} /> },
  { id: 'history', label: 'Histórico', icon: <History size={20} /> },
];

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 border-green-200',
  maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
};
