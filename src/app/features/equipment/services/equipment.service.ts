import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {
  Equipment, EquipmentPayload, EquipmentMaintenance, EquipmentLocation,
  MaintenancePayload, ServiceDue
} from '../models/equipment.model';

/** Frontend demo store. Replace these subjects/lookup values with tenant-scoped API calls later. */
@Injectable({ providedIn: 'root' })
export class EquipmentService {
  // These are DEMO lookup IDs. Bind to real locations.location_id when backend is ready.
  private readonly locations: EquipmentLocation[] = [
    { tenantId: 1, locationId: 1, locationName: 'Main Branch' },
    { tenantId: 1, locationId: 2, locationName: 'Branch 2' }
  ];

  private readonly equipmentSubject = new BehaviorSubject<Equipment[]>([
    this.demo(1, 1, 'EQ-TM-001', 'Commercial Treadmill', 'Cardio', 'Life Fitness', 'Integrity+', 'operational', '2025-03-10', 245000, '2027-03-10', 90, '2026-08-01', '2026-10-30'),
    this.demo(2, 1, 'EQ-TM-002', 'Incline Treadmill', 'Cardio', 'Matrix', 'T75', 'maintenance', '2024-11-08', 220000, '2026-11-08', 60, '2026-08-20', '2026-10-19'),
    this.demo(3, 1, 'EQ-DM-001', 'Dumbbell Rack', 'Strength', 'Jerai', 'DBR-12', 'operational', '2025-01-20', 55000, null, 180, '2026-06-15', '2026-12-12'),
    this.demo(4, 2, 'EQ-CR-001', 'Cross Trainer', 'Cardio', 'Precor', 'EFX', 'repair', '2024-08-12', 189000, '2026-08-12', 90, '2026-06-25', '2026-09-23'),
    this.demo(5, 2, 'EQ-BK-001', 'Exercise Bike', 'Cardio', 'Technogym', 'Bike 700', 'operational', '2025-12-05', 98000, '2027-12-05', 120, '2026-07-20', '2026-11-17'),
    this.demo(6, 1, 'EQ-BP-001', 'Bench Press', 'Strength', 'Jerai', 'Olympic', 'operational', '2025-02-12', 85000, '2027-02-12', 90, '2026-07-15', '2026-10-13'),
    this.demo(7, 2, 'EQ-RW-001', 'Rowing Machine', 'Functional', 'Concept2', 'Model D', 'operational', '2026-02-14', 112000, '2028-02-14', 60, '2026-08-03', '2026-10-02'),
    this.demo(8, 1, 'EQ-OL-001', 'Old Spin Bike', 'Cardio', 'Generic', 'SB-10', 'retired', '2020-01-08', 32000, null, null, null, null)
  ]);
  private readonly maintenanceSubject = new BehaviorSubject<EquipmentMaintenance[]>([
    { maintenanceId: 1, equipmentId: 1, maintenanceDate: '2026-08-01', maintenanceType: 'routine', performedBy: null, cost: 1800, description: 'Belt inspection and lubrication.', nextMaintenanceDate: '2026-10-30', createdAt: '2026-08-01T10:00:00Z', updatedAt: '2026-08-01T10:00:00Z', createdBy: null, updatedBy: null },
    { maintenanceId: 2, equipmentId: 4, maintenanceDate: '2026-06-25', maintenanceType: 'inspection', performedBy: null, cost: 750, description: 'Drive assembly requires repair.', nextMaintenanceDate: '2026-09-23', createdAt: '2026-06-25T10:00:00Z', updatedAt: '2026-06-25T10:00:00Z', createdBy: null, updatedBy: null }
  ]);

  getLocations(tenantId: number): EquipmentLocation[] {
    return this.locations.filter(x => x.tenantId === tenantId).map(x => ({ ...x }));
  }
  locationName(tenantId: number, locationId: number): string {
    return this.locations.find(x => x.tenantId === tenantId && x.locationId === locationId)?.locationName ?? `Location ${locationId}`;
  }
  getEquipment(tenantId: number): Observable<Equipment[]> {
    return this.equipmentSubject.pipe(map(rows => rows.filter(x => x.tenantId === tenantId).map(x => ({ ...x }))));
  }
  getMaintenance(tenantId: number, equipmentId: number): Observable<EquipmentMaintenance[]> {
    return this.maintenanceSubject.pipe(map(rows => {
      if (!this.findEquipment(tenantId, equipmentId)) return [];
      return rows.filter(x => x.equipmentId === equipmentId)
        .sort((a, b) => b.maintenanceDate.localeCompare(a.maintenanceDate) || b.maintenanceId - a.maintenanceId)
        .map(x => ({ ...x }));
    }));
  }
  findEquipment(tenantId: number, equipmentId: number): Equipment | undefined {
    const row = this.equipmentSubject.value.find(x => x.tenantId === tenantId && x.equipmentId === equipmentId);
    return row && { ...row };
  }
  saveEquipment(payload: EquipmentPayload, equipmentId?: number): Equipment {
    this.validateEquipment(payload, equipmentId);
    const rows = this.equipmentSubject.value;
    const now = new Date().toISOString();
    if (equipmentId !== undefined) {
      const index = rows.findIndex(x => x.tenantId === payload.tenantId && x.equipmentId === equipmentId);
      if (index < 0) throw new Error('Equipment not found for this gym.');
      const updated: Equipment = {
        ...rows[index], ...payload,
        equipmentCode: payload.equipmentCode.trim().toUpperCase(),
        equipmentName: payload.equipmentName.trim(), updatedAt: now
      };
      this.equipmentSubject.next(rows.map((x, i) => i === index ? updated : x));
      return { ...updated };
    }
    const nextId = Math.max(0, ...rows.map(x => x.equipmentId)) + 1;
    const created: Equipment = {
      ...payload, equipmentId: nextId,
      equipmentName: payload.equipmentName.trim(),
      equipmentCode: payload.equipmentCode.trim().toUpperCase(),
      createdAt: now, updatedAt: now, createdBy: null, updatedBy: null
    };
    this.equipmentSubject.next([...rows, created]);
    return { ...created };
  }
  logMaintenance(tenantId: number, request: MaintenancePayload): EquipmentMaintenance {
    const equipment = this.findEquipment(tenantId, request.equipmentId);
    if (!equipment) throw new Error('Equipment not found for this gym.');
    if (equipment.status === 'retired') throw new Error('Retired equipment cannot receive new maintenance records.');
    if (!this.validDate(request.maintenanceDate) || request.maintenanceDate > this.today()) throw new Error('Enter a valid maintenance date, not in the future.');
    if (equipment.purchaseDate && request.maintenanceDate < equipment.purchaseDate) throw new Error('Maintenance cannot predate purchase.');
    if (!['routine', 'repair', 'inspection'].includes(request.maintenanceType)) throw new Error('Choose a maintenance type.');
    if (request.performedBy !== null && (!Number.isSafeInteger(request.performedBy) || request.performedBy <= 0)) throw new Error('Employee ID must be a positive integer.');
    if (request.cost !== null && (!Number.isFinite(request.cost) || request.cost < 0 || request.cost > 99999999.99)) throw new Error('Enter a valid non-negative maintenance cost.');
    if (request.nextMaintenanceDate && (!this.validDate(request.nextMaintenanceDate) || request.nextMaintenanceDate < request.maintenanceDate)) throw new Error('Next maintenance date must be on or after the service date.');
    const next = request.nextMaintenanceDate ?? (equipment.maintenanceFrequencyDays ? this.addDays(request.maintenanceDate, equipment.maintenanceFrequencyDays) : null);
    const rows = this.maintenanceSubject.value;
    const now = new Date().toISOString();
    const record: EquipmentMaintenance = {
      ...request, maintenanceId: Math.max(0, ...rows.map(x => x.maintenanceId)) + 1,
      nextMaintenanceDate: next, description: request.description?.trim() || null,
      createdAt: now, updatedAt: now, createdBy: null, updatedBy: null
    };
    this.maintenanceSubject.next([...rows, record]);
    // Preserve the latest service date when entering an older historical record.
    if (!equipment.lastMaintenanceDate || request.maintenanceDate >= equipment.lastMaintenanceDate) {
      this.equipmentSubject.next(this.equipmentSubject.value.map(x => x.equipmentId === equipment.equipmentId && x.tenantId === tenantId
        ? { ...x, lastMaintenanceDate: request.maintenanceDate, nextMaintenanceDate: next, updatedAt: now } : x));
    }
    // Note: maintenance cost is a log value, NOT automatically an Accounts expense.
    return { ...record };
  }
  getDue(equipment: Equipment, today = this.today()): ServiceDue {
    if (equipment.status === 'retired') return 'retired';
    const date = equipment.nextMaintenanceDate;
    if (!date) return 'none';
    if (date < today) return 'overdue';
    if (date <= this.addDays(today, 7)) return 'soon';
    return 'scheduled';
  }
  today(): string { return this.dateKey(new Date()); }
  addDays(date: string, days: number): string {
    const [y, m, d] = date.split('-').map(Number);
    const utc = new Date(Date.UTC(y, m - 1, d + days));
    return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')}`;
  }
  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  private validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
  }
  private validateEquipment(p: EquipmentPayload, equipmentId?: number): void {
    if (!Number.isSafeInteger(p.tenantId) || p.tenantId <= 0 || !this.locations.some(x => x.tenantId === p.tenantId && x.locationId === p.locationId)) throw new Error('Choose a valid location for this gym.');
    if (p.equipmentName.trim().length < 2 || p.equipmentName.trim().length > 200) throw new Error('Equipment name must be 2–200 characters.');
    const code = p.equipmentCode.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{2,50}$/.test(code)) throw new Error('Code must be 2–50 letters, numbers, hyphens or underscores.');
    if (this.equipmentSubject.value.some(x => x.tenantId === p.tenantId && x.equipmentId !== equipmentId && x.equipmentCode.toUpperCase() === code)) throw new Error('Equipment code already exists for this gym.');
    for (const [value, max, label] of [[p.category, 100, 'Category'], [p.manufacturer, 100, 'Manufacturer'], [p.modelNumber, 100, 'Model number'], [p.serialNumber, 100, 'Serial number']] as const) {
      if (value && value.length > max) throw new Error(`${label} must be at most ${max} characters.`);
    }
    for (const [value, label] of [[p.purchaseDate, 'Purchase date'], [p.warrantyExpiryDate, 'Warranty expiry'], [p.lastMaintenanceDate, 'Last maintenance'], [p.nextMaintenanceDate, 'Next maintenance']] as const) {
      if (value && !this.validDate(value)) throw new Error(`Enter a valid ${label.toLowerCase()}.`);
    }
    if (p.purchaseDate && p.purchaseDate > this.today()) throw new Error('Purchase date cannot be in the future.');
    if (p.warrantyExpiryDate && p.purchaseDate && p.warrantyExpiryDate < p.purchaseDate) throw new Error('Warranty expiry cannot predate purchase.');
    if (p.lastMaintenanceDate && p.lastMaintenanceDate > this.today()) throw new Error('Last maintenance cannot be in the future.');
    if (p.lastMaintenanceDate && p.purchaseDate && p.lastMaintenanceDate < p.purchaseDate) throw new Error('Last maintenance cannot predate purchase.');
    if (p.nextMaintenanceDate && p.lastMaintenanceDate && p.nextMaintenanceDate < p.lastMaintenanceDate) throw new Error('Next maintenance cannot predate last maintenance.');
    if (p.purchasePrice !== null && (!Number.isFinite(p.purchasePrice) || p.purchasePrice < 0 || p.purchasePrice > 99999999.99)) throw new Error('Enter a valid purchase price.');
    if (p.maintenanceFrequencyDays !== null && (!Number.isSafeInteger(p.maintenanceFrequencyDays) || p.maintenanceFrequencyDays <= 0)) throw new Error('Maintenance frequency must be a positive number of days.');
    if (!['operational', 'maintenance', 'repair', 'retired'].includes(p.status)) throw new Error('Choose a valid equipment status.');
  }
  private demo(id: number, locationId: number, code: string, name: string, category: string, manufacturer: string, model: string, status: Equipment['status'], purchase: string, price: number, warranty: string | null, freq: number | null, last: string | null, next: string | null): Equipment {
    return { equipmentId: id, tenantId: 1, locationId, equipmentCode: code, equipmentName: name, category, manufacturer, modelNumber: model, serialNumber: null, status, purchaseDate: purchase, purchasePrice: price, warrantyExpiryDate: warranty, maintenanceFrequencyDays: freq, lastMaintenanceDate: last, nextMaintenanceDate: next, notes: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', createdBy: null, updatedBy: null };
  }
}
