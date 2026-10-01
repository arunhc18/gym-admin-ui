/** Mirrors the two SQL tables; API DTOs may use snake_case and map at the boundary. */
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'retired';
export type MaintenanceType = 'routine' | 'repair' | 'inspection';

export interface Equipment {
  equipmentId: number;
  tenantId: number;
  locationId: number;
  equipmentName: string;
  equipmentCode: string;
  category: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiryDate: string | null;
  maintenanceFrequencyDays: number | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  status: EquipmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
}

export type EquipmentPayload = Omit<Equipment,
  'equipmentId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

export interface EquipmentMaintenance {
  maintenanceId: number;
  equipmentId: number;
  maintenanceDate: string;
  maintenanceType: MaintenanceType;
  performedBy: number | null; // employees.employee_id, NOT necessarily staff.staffId
  cost: number | null;
  description: string | null;
  nextMaintenanceDate: string | null;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string;
  updatedBy: number | null;
}
export type MaintenancePayload = Pick<EquipmentMaintenance,
  'equipmentId' | 'maintenanceDate' | 'maintenanceType' | 'performedBy' |
  'cost' | 'description' | 'nextMaintenanceDate'>;

export interface EquipmentLocation { locationId: number; tenantId: number; locationName: string; }
export type ServiceDue = 'overdue' | 'soon' | 'scheduled' | 'none' | 'retired';
