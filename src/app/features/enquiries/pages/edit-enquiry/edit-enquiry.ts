import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MEMBERSHIP_PLANS } from '../../../members/services/member.service';
import {
  Enquiry,
  EnquiryService,
  EnquiryStatus
} from '../../services/enquiry.service';

const PHONE_PATTERN = /^\+?[0-9\s()-]+$/;

@Component({
  selector: 'app-edit-enquiry',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-enquiry.html',
  styleUrls: ['./edit-enquiry.scss']
})
export class EditEnquiryComponent {
  readonly membershipPlans = MEMBERSHIP_PLANS;
  readonly sources = ['Website', 'Walk-in', 'Instagram', 'Referral', 'Google', 'Other'];
  readonly statuses: EnquiryStatus[] = [
    'New',
    'Contacted',
    'Follow-up',
    'Converted',
    'Lost'
  ];
  readonly enquiryForm;
  enquiry: Enquiry | undefined;
  notFound = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly enquiryService: EnquiryService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.enquiryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN), this.phoneLengthValidator]],
      email: ['', [Validators.email]],
      interestedPlan: ['', [Validators.required]],
      source: ['Website', [Validators.required]],
      followUpDate: [''],
      status: ['New' as EnquiryStatus, [Validators.required]],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.enquiry = Number.isNaN(id)
      ? undefined
      : this.enquiryService.getEnquiryById(id);

    if (!this.enquiry) {
      this.notFound = true;
      return;
    }

    this.enquiryForm.reset({
      name: this.enquiry.name,
      phone: this.enquiry.phone,
      email: this.enquiry.email,
      interestedPlan: this.enquiry.interestedPlan,
      source: this.enquiry.source,
      followUpDate: this.enquiry.followUpDate,
      status: this.enquiry.status,
      notes: this.enquiry.notes
    });
    this.enquiryForm.markAsPristine();
  }

  saveChanges(): void {
    if (!this.enquiry || this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      return;
    }

    const value = this.enquiryForm.getRawValue();
    this.enquiryService.updateEnquiry(this.enquiry.enquiryId, {
      name: value.name?.trim() ?? '',
      phone: value.phone?.trim() ?? '',
      email: value.email?.trim() ?? '',
      interestedPlan: value.interestedPlan ?? '',
      source: value.source ?? 'Website',
      followUpDate: value.followUpDate ?? '',
      status: value.status as EnquiryStatus,
      notes: value.notes?.trim() ?? ''
    });

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
