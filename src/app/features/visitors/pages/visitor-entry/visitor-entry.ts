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
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN), this.phoneLengthValidator]],
      purpose: ['Guest pass', [Validators.required]],
      host: ['Front desk', [Validators.required, Validators.maxLength(100)]],
      visitDate: [this.today(), [Validators.required]],
      checkInTime: [this.currentTime(), [Validators.required]],
      checkInPeriod: [this.currentPeriod(), [Validators.required]]
    });
  }

  get canSave(): boolean {
    return this.visitorForm.valid &&
      String(this.visitorForm.controls.name.value ?? '').trim().length >= 2;
  }

  saveVisitor(): void {
    if (!this.canSave) {
      this.visitorForm.markAllAsTouched();
      return;
    }

    const value = this.visitorForm.getRawValue();
    const visitor: CreateVisitor = {
      name: value.name?.trim() ?? '',
      phone: value.phone?.trim() ?? '',
      purpose: value.purpose ?? '',
      host: value.host?.trim() ?? '',
      visitDate: value.visitDate ?? this.today(),
      checkInTime: this.to24HourTime(
        value.checkInTime ?? this.currentTime(),
        value.checkInPeriod ?? 'AM'
      ),
      checkOutTime: ''
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

  private currentPeriod(): 'AM' | 'PM' {
    return new Date().getHours() >= 12 ? 'PM' : 'AM';
  }

  private to24HourTime(time: string, period: 'AM' | 'PM'): string {
    const [hours, minutes] = time.split(':').map(Number);
    const normalizedHours = period === 'PM'
      ? (hours % 12) + 12
      : hours % 12;
    return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
