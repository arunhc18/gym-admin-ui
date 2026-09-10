import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MEMBERSHIP_PLANS } from '../../../members/services/member.service';
import { CreateEnquiry, EnquiryService } from '../../services/enquiry.service';

const PHONE_PATTERN = /^\+?[0-9\s()-]+$/;

@Component({
  selector: 'app-quick-enquiry',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './quick-enquiry.html',
  styleUrl: './quick-enquiry.scss'
})
export class QuickEnquiryComponent {
  readonly membershipPlans = MEMBERSHIP_PLANS;
  readonly sources = ['Website', 'Walk-in', 'Instagram', 'Referral', 'Google', 'Other'];
  readonly enquiryForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly enquiryService: EnquiryService,
    private readonly router: Router
  ) {
    this.enquiryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN), this.phoneLengthValidator]],
      email: ['', [Validators.email]],
      interestedPlan: ['', [Validators.required]],
      source: ['Website', [Validators.required]],
      followUpDate: [''],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  get canSave(): boolean {
    const name = String(this.enquiryForm.controls.name.value ?? '').trim();
    const phone = String(this.enquiryForm.controls.phone.value ?? '').trim();
    const interestedPlan = String(
      this.enquiryForm.controls.interestedPlan.value ?? ''
    ).trim();

    return (
      this.enquiryForm.valid &&
      name.length >= 2 &&
      phone.length > 0 &&
      interestedPlan.length > 0
    );
  }

  saveEnquiry(): void {
    if (!this.canSave) {
      this.enquiryForm.markAllAsTouched();
      return;
    }

    const value = this.enquiryForm.getRawValue();
    const enquiry: CreateEnquiry = {
      name: value.name?.trim() ?? '',
      phone: value.phone?.trim() ?? '',
      email: value.email?.trim() ?? '',
      interestedPlan: value.interestedPlan ?? '',
      source: value.source ?? 'Website',
      followUpDate: value.followUpDate ?? '',
      notes: value.notes?.trim() ?? ''
    };

    this.enquiryService.createEnquiry(enquiry);
    this.enquiryForm.markAsPristine();
    this.router.navigate(['/enquiries']);
  }

  hasError(controlName: string): boolean {
    const control = this.enquiryForm.controls[controlName as keyof typeof this.enquiryForm.controls];
    return control.touched && control.invalid;
  }

  private phoneLengthValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const digits = String(control.value).replace(/\D/g, '').length;
    return digits >= 10 && digits <= 15 ? null : { phoneLength: true };
  }
}
