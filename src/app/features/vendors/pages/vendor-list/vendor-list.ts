import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Tenant
} from '../../../platform/tenants/models/tenant.model';

import {
  TenantService
} from '../../../platform/tenants/services/tenant';

import {
  Vendor,
  VendorRequest
} from '../../models/vendor.model';

import {
  VendorService
} from '../../services/vendor';


@Component({
  selector:
    'app-vendor-list',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './vendor-list.html',

  styleUrl:
    './vendor-list.scss'
})
export class VendorListComponent
  implements OnInit {

  vendors: Vendor[] = [];

  filteredVendors: Vendor[] = [];

  tenants: Tenant[] = [];

  searchText = '';

  selectedTenant = '';

  selectedStatus = '';

  vendorModalOpen = false;

  editingVendor?: Vendor;

  submitted = false;

  vendorCodeError = '';

  vendorForm: FormGroup;


  constructor(
    private readonly vendorService: VendorService,
    private readonly tenantService: TenantService,
    private readonly formBuilder: FormBuilder
  ) {
    this.vendorForm = this.formBuilder.group({
      tenantId: ['', Validators.required],
      vendorName: ['', [Validators.required, Validators.maxLength(200)]],
      vendorCode: ['', [Validators.required, Validators.maxLength(50)]],
      contactPerson: ['', Validators.maxLength(100)],
      phone: ['', Validators.pattern(/^[0-9+\-\s()]{7,20}$/)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      gstNumber: ['', Validators.maxLength(50)],
      paymentTerms: ['', Validators.maxLength(100)],
      address: [''],
      isActive: [true]
    });
  }


  ngOnInit(): void {
    this.tenantService.getTenants().subscribe(tenants => {
      this.tenants = tenants;
    });

    this.vendorService.getVendors().subscribe(vendors => {
      this.vendors = vendors;
      this.applyFilters();
    });
  }


  get totalVendors(): number {
    return this.vendors.length;
  }


  get activeVendors(): number {
    return this.vendors.filter(vendor => vendor.isActive).length;
  }


  get inactiveVendors(): number {
    return this.vendors.filter(vendor => !vendor.isActive).length;
  }


  get tenantsWithVendors(): number {
    return new Set(this.vendors.map(vendor => vendor.tenantId)).size;
  }


  tenantName(tenantId: number): string {
    return this.tenants.find(tenant => tenant.tenantId === tenantId)?.tenantName ?? 'Unknown tenant';
  }


  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredVendors = this.vendors.filter(vendor => {
      const matchesSearch = !search || [
        vendor.vendorName,
        vendor.vendorCode,
        vendor.contactPerson ?? '',
        vendor.email ?? '',
        vendor.gstNumber ?? ''
      ].some(value => value.toLowerCase().includes(search));

      const matchesTenant = !this.selectedTenant ||
        vendor.tenantId === Number(this.selectedTenant);

      const matchesStatus = !this.selectedStatus ||
        (this.selectedStatus === 'active' && vendor.isActive) ||
        (this.selectedStatus === 'inactive' && !vendor.isActive);

      return matchesSearch && matchesTenant && matchesStatus;
    });
  }


  clearFilters(): void {
    this.searchText = '';
    this.selectedTenant = '';
    this.selectedStatus = '';
    this.applyFilters();
  }


  openAddVendor(): void {
    this.editingVendor = undefined;
    this.submitted = false;
    this.vendorCodeError = '';
    this.vendorForm.reset({
      tenantId: '',
      vendorName: '',
      vendorCode: '',
      contactPerson: '',
      phone: '',
      email: '',
      gstNumber: '',
      paymentTerms: '',
      address: '',
      isActive: true
    });
    this.vendorModalOpen = true;
  }


  openEditVendor(vendor: Vendor): void {
    this.editingVendor = vendor;
    this.submitted = false;
    this.vendorCodeError = '';
    this.vendorForm.patchValue(vendor);
    this.vendorModalOpen = true;
  }


  closeVendorModal(): void {
    this.vendorModalOpen = false;
  }


  saveVendor(): void {
    this.submitted = true;
    this.vendorCodeError = '';

    if (this.vendorForm.invalid) {
      return;
    }

    const request = this.vendorForm.getRawValue() as VendorRequest;
    const duplicate = this.vendorService.isVendorCodeTaken(
      Number(request.tenantId),
      request.vendorCode,
      this.editingVendor?.vendorId
    );

    if (duplicate) {
      this.vendorCodeError = 'This vendor code already exists for the selected tenant.';
      return;
    }

    if (this.editingVendor) {
      this.vendorService.updateVendor(this.editingVendor.vendorId, request);
    } else {
      this.vendorService.createVendor(request);
    }

    this.closeVendorModal();
  }


  toggleVendorStatus(vendor: Vendor): void {
    this.vendorService.setVendorActiveStatus(vendor.vendorId, !vendor.isActive);
  }
}
