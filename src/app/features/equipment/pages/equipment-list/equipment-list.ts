import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import {
  Equipment, EquipmentPayload, EquipmentMaintenance, EquipmentLocation,
  EquipmentStatus, MaintenanceType, MaintenancePayload, ServiceDue
} from '../../models/equipment.model';
import { EquipmentService } from '../../services/equipment.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.scss'
})
export class EquipmentListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private historySubscription?: Subscription;
  // Demo tenant until authenticated tenant context is connected.
  readonly tenantId = 1;
  readonly statuses: EquipmentStatus[] = ['operational', 'maintenance', 'repair', 'retired'];
  readonly maintenanceTypes: MaintenanceType[] = ['routine', 'repair', 'inspection'];
  readonly dueOptions: { value: ServiceDue | ''; label: string }[] = [
    { value: '', label: 'All Service Dates' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'soon', label: 'Due Within 7 Days' },
    { value: 'scheduled', label: 'Scheduled Later' },
    { value: 'none', label: 'Not Scheduled' }
  ];
  equipment: Equipment[] = [];
  locations: EquipmentLocation[] = [];
  search = '';
  selectedLocation: number | null = null;
  selectedCategory = '';
  selectedStatus: EquipmentStatus | '' = '';
  selectedDue: ServiceDue | '' = '';
  equipmentModalOpen = false;
  editingId: number | null = null;
  equipmentSubmitted = false;
  equipmentError = '';
  draft: EquipmentPayload = this.blankEquipment();
  drawerMode: 'history' | 'log' | null = null;
  selectedEquipmentId: number | null = null;
  history: EquipmentMaintenance[] = [];
  maintenanceSubmitted = false;
  maintenanceError = '';
  maintenanceDraft: {
    maintenanceDate: string;
    maintenanceType: MaintenanceType;
    performedBy: number | null;
    cost: number | null;
    description: string;
    nextMaintenanceDate: string;
  } = this.blankMaintenance();
  toast = '';

  constructor(public readonly equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.locations = this.equipmentService.getLocations(this.tenantId);
    this.equipmentService.getEquipment(this.tenantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(rows => { this.equipment = rows; });
    this.destroyRef.onDestroy(() => this.historySubscription?.unsubscribe());
  }

  get today(): string { return this.equipmentService.today(); }
  get categories(): string[] {
    return [...new Set(this.equipment.map(x => x.category).filter((x): x is string => Boolean(x)))].sort();
  }
  get filteredEquipment(): Equipment[] {
    const q = this.search.trim().toLowerCase();
    return this.equipment.filter(x => {
      const terms = [x.equipmentName, x.equipmentCode, x.category, x.manufacturer, x.modelNumber, x.serialNumber]
        .filter(Boolean).join(' ').toLowerCase();
      return (!q || terms.includes(q))
        && (this.selectedLocation === null || x.locationId === this.selectedLocation)
        && (!this.selectedCategory || x.category === this.selectedCategory)
        && (!this.selectedStatus || x.status === this.selectedStatus)
        && (!this.selectedDue || this.equipmentService.getDue(x) === this.selectedDue);
    }).sort((a, b) => a.equipmentName.localeCompare(b.equipmentName));
  }
  get operationalCount(): number { return this.equipment.filter(x => x.status === 'operational').length; }
  get downtimeCount(): number { return this.equipment.filter(x => x.status === 'maintenance' || x.status === 'repair').length; }
  get dueSoonCount(): number { return this.equipment.filter(x => this.equipmentService.getDue(x) === 'soon').length; }
  get overdueCount(): number { return this.equipment.filter(x => this.equipmentService.getDue(x) === 'overdue').length; }
  get retiredCount(): number { return this.equipment.filter(x => x.status === 'retired').length; }
  get selectedEquipment(): Equipment | null {
    return this.equipment.find(x => x.equipmentId === this.selectedEquipmentId) ?? null;
  }
  get isMaintenanceOpen(): boolean { return this.drawerMode !== null; }
  locationName(id: number): string { return this.equipmentService.locationName(this.tenantId, id); }
  dueState(x: Equipment): ServiceDue { return this.equipmentService.getDue(x); }
  dueLabel(x: Equipment): string {
    switch (this.dueState(x)) {
      case 'overdue': return 'Overdue';
      case 'soon': return 'Due Soon';
      case 'scheduled': return 'Scheduled';
      case 'retired': return 'Retired';
      default: return 'Not Scheduled';
    }
  }
  warrantyLabel(x: Equipment): string {
    if (!x.warrantyExpiryDate) return '—';
    return x.warrantyExpiryDate < this.today ? 'Expired' : 'Valid';
  }
  clearFilters(): void {
    this.search = ''; this.selectedLocation = null; this.selectedCategory = '';
    this.selectedStatus = ''; this.selectedDue = '';
  }
  openAddEquipment(): void {
    this.editingId = null; this.equipmentSubmitted = false; this.equipmentError = '';
    this.draft = this.blankEquipment(); this.equipmentModalOpen = true;
  }
  openEditEquipment(row: Equipment): void {
    this.editingId = row.equipmentId; this.equipmentSubmitted = false; this.equipmentError = '';
    this.draft = {
      tenantId: row.tenantId, locationId: row.locationId, equipmentCode: row.equipmentCode,
      equipmentName: row.equipmentName, category: row.category, manufacturer: row.manufacturer,
      modelNumber: row.modelNumber, serialNumber: row.serialNumber, purchaseDate: row.purchaseDate,
      purchasePrice: row.purchasePrice, warrantyExpiryDate: row.warrantyExpiryDate,
      maintenanceFrequencyDays: row.maintenanceFrequencyDays,
      lastMaintenanceDate: row.lastMaintenanceDate, nextMaintenanceDate: row.nextMaintenanceDate,
      status: row.status, notes: row.notes
    };
    this.equipmentModalOpen = true;
  }
  closeEquipment(): void { this.equipmentModalOpen = false; this.equipmentError = ''; }
  saveEquipment(form: NgForm): void {
    this.equipmentSubmitted = true; this.equipmentError = '';
    if (form.invalid) { form.control.markAllAsTouched(); this.equipmentError = 'Correct the highlighted fields.'; return; }
    try {
      this.equipmentService.saveEquipment({
        ...this.draft,
        equipmentCode: this.draft.equipmentCode.trim().toUpperCase(),
        equipmentName: this.draft.equipmentName.trim(),
        category: this.clean(this.draft.category), manufacturer: this.clean(this.draft.manufacturer),
        modelNumber: this.clean(this.draft.modelNumber), serialNumber: this.clean(this.draft.serialNumber),
        notes: this.clean(this.draft.notes),
        purchaseDate: this.clean(this.draft.purchaseDate), warrantyExpiryDate: this.clean(this.draft.warrantyExpiryDate),
        lastMaintenanceDate: this.clean(this.draft.lastMaintenanceDate), nextMaintenanceDate: this.clean(this.draft.nextMaintenanceDate)
      }, this.editingId ?? undefined);
      this.toast = this.editingId === null ? 'Equipment added.' : 'Equipment updated.';
      this.closeEquipment();
    } catch (error) { this.equipmentError = this.errorText(error); }
  }
  openHistory(row: Equipment): void {
    this.equipmentModalOpen = false; this.selectedEquipmentId = row.equipmentId;
    this.historySubscription?.unsubscribe();
    this.historySubscription = this.equipmentService.getMaintenance(this.tenantId, row.equipmentId)
      .subscribe(rows => this.history = rows);
    this.drawerMode = 'history';
  }
  openLogMaintenance(): void {
    const equipment = this.selectedEquipment;
    if (!equipment || equipment.status === 'retired') return;
    this.maintenanceSubmitted = false; this.maintenanceError = '';
    this.maintenanceDraft = this.blankMaintenance();
    if (equipment.maintenanceFrequencyDays) {
      this.maintenanceDraft.nextMaintenanceDate = this.equipmentService.addDays(this.today, equipment.maintenanceFrequencyDays);
    }
    this.drawerMode = 'log';
  }
  onServiceDateChange(): void {
    const equipment = this.selectedEquipment;
    if (equipment?.maintenanceFrequencyDays && this.maintenanceDraft.maintenanceDate) {
      this.maintenanceDraft.nextMaintenanceDate = this.equipmentService.addDays(this.maintenanceDraft.maintenanceDate, equipment.maintenanceFrequencyDays);
    }
  }
  backToHistory(): void { this.drawerMode = 'history'; this.maintenanceError = ''; }
  closeMaintenance(): void {
    this.drawerMode = null; this.selectedEquipmentId = null;
    this.historySubscription?.unsubscribe(); this.historySubscription = undefined;
    this.history = [];
  }
  saveMaintenance(form: NgForm): void {
    this.maintenanceSubmitted = true; this.maintenanceError = '';
    const equipment = this.selectedEquipment;
    if (!equipment) { this.maintenanceError = 'Select equipment first.'; return; }
    if (form.invalid) { form.control.markAllAsTouched(); this.maintenanceError = 'Correct the highlighted fields.'; return; }
    const payload: MaintenancePayload = {
      equipmentId: equipment.equipmentId,
      maintenanceDate: this.maintenanceDraft.maintenanceDate,
      maintenanceType: this.maintenanceDraft.maintenanceType,
      performedBy: this.maintenanceDraft.performedBy,
      cost: this.maintenanceDraft.cost,
      description: this.clean(this.maintenanceDraft.description),
      nextMaintenanceDate: this.clean(this.maintenanceDraft.nextMaintenanceDate)
    };
    try {
      this.equipmentService.logMaintenance(this.tenantId, payload);
      this.toast = 'Maintenance entry saved.';
      this.backToHistory();
    } catch (error) { this.maintenanceError = this.errorText(error); }
  }
  private blankEquipment(): EquipmentPayload {
    return {
      tenantId: this.tenantId, locationId: 0, equipmentCode: '', equipmentName: '',
      category: null, manufacturer: null, modelNumber: null, serialNumber: null,
      purchaseDate: null, purchasePrice: null, warrantyExpiryDate: null,
      maintenanceFrequencyDays: null, lastMaintenanceDate: null, nextMaintenanceDate: null,
      status: 'operational', notes: null
    };
  }
  private blankMaintenance() {
    const date = new Date();
    const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { maintenanceDate: today, maintenanceType: 'routine' as MaintenanceType,
      performedBy: null as number | null, cost: null as number | null, description: '', nextMaintenanceDate: '' };
  }
  private clean(value: string | null): string | null { return value?.trim() || null; }
  private errorText(error: unknown): string { return error instanceof Error ? error.message : 'Unable to save changes.'; }
}
