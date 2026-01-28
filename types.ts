
export type UserRole = 'admin' | 'brigadista';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface SystemConfig {
  appName: string;
  logoUrl?: string; // Base64 string
}

export interface ExtinguisherType {
  id: string;
  name: string;
}

export enum InspectionStatus {
  OK = 'Conforme',
  NON_CONFORMING = 'Não Conforme',
  CRITICAL = 'Crítico'
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface Inspection {
  id: string;
  extinguisherId: string;
  date: string;
  inspector: string;
  responses: { [itemId: string]: boolean };
  notes: string;
  status: InspectionStatus;
  photoUrl?: string;
}

export interface Extinguisher {
  id: string;
  code: string;
  type: string;
  capacity: string;
  location: string;
  manufactureDate: string;
  expiryDate: string;
  lastInspectionId?: string;
  status: 'active' | 'maintenance' | 'expired';
}
