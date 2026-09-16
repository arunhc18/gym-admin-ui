import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateVisitor, VisitorService } from '../../services/visitor.service';

const PHONE_PATTERN = /^\+?[0-9\s()-]+$/;

@Component({
  selector: 'app-visitor-entry',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './visitor-entry.html',
  styleUrl: './visitor-entry.scss'
})
export class VisitorEntryComponent {
  readonly visitorForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly visitorService: VisitorService,
    private readonly router: Router
  ) {
    this.visitorForm = this.formBuilder.group({
      tenantId: [null as number | null, [Validators.required, Validators.min(1)]],
      locationId: [null as number | null, [Validators.required, Validators.min(1)]],
      visitorName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN), this.phoneLengthValidator]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      purpose: ['', [Validators.maxLength(255)]],
      referredByMemberId: [null as number | null],
      visitDate: [this.today(), [Validators.required]],
      checkinTime: [this.currentTime()],
      checkoutTime: [''],
      status: ['scheduled' as const, [Validators.required]]
    });
  }

  get canSave(): boolean {
    return this.visitorForm.valid &&
      String(this.visitorForm.controls.visitorName.value ?? '').trim().length >= 2;
  }

  saveVisitor(): void {
    if (!this.canSave) {
      this.visitorForm.markAllAsTouched();
      return;
    }

    const value = this.visitorForm.getRawValue();
    const visitor: CreateVisitor = {
      tenantId: value.tenantId ?? 0,
      locationId: value.locationId ?? 0,
      visitorName: value.visitorName?.trim() ?? '',
      phone: value.phone?.trim() ?? '',
      email: value.email?.trim() || null,
      purpose: value.purpose?.trim() || null,
      referredByMemberId: value.referredByMemberId ?? null,
      visitDate: value.visitDate ?? this.today(),
      checkinTime: value.checkinTime || null,
      checkoutTime: value.checkoutTime || null,
      status: value.status ?? 'scheduled'
    };

    this.visitorService.createVisitor(visitor);
    this.router.navigate(['/visitors']);
  }

  hasError(controlName: string): boolean {
    const control = this.visitorForm.controls[controlName as keyof typeof this.visitorForm.controls];
    return control.touched && control.invalid;
  }

  openPicker(event: MouseEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    input.showPicker?.();
  }

  private phoneLengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const digits = String(control.value).replace(/\D/g, '').length;
    return digits >= 10 && digits <= 15 ? null : { phoneLength: true };
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private currentTime(): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  }

}
