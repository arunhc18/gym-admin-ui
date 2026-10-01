import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { ClassType, ClassTypeFormValues } from '../../models/class.model';
import { ClassesService } from '../../services/classes.service';

function requiredTrimmedText(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };
}

function optionalPositiveInteger(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === '') {
    return null;
  }

  return Number.isInteger(Number(control.value)) && Number(control.value) > 0
    ? null
    : { positiveInteger: true };
}

function optionalImageUrl(control: AbstractControl): ValidationErrors | null {
  const value = typeof control.value === 'string' ? control.value.trim() : '';
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? null
      : { invalidUrl: true };
  } catch {
    return { invalidUrl: true };
  }
}

@Component({
  selector: 'app-class-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './class-types.html',
  styleUrl: './class-types.scss'
})
export class ClassTypesComponent {
  readonly tenantId = 1;

  classTypes: ClassType[] = [];
  editingClassTypeId: number | null = null;
  formOpen = false;
  submitted = false;
  toastMessage = '';

  readonly classTypeForm = new FormGroup({
    class_name: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmedText, Validators.maxLength(200)]
    }),
    description: new FormControl<string | null>(null),
    duration_minutes: new FormControl<number | null>(null, [
      Validators.required,
      optionalPositiveInteger
    ]),
    max_capacity: new FormControl<number | null>(null, [optionalPositiveInteger]),
    image_url: new FormControl<string | null>(null, [optionalImageUrl]),
    color_code: new FormControl<string | null>(null, [
      Validators.pattern(/^#[0-9A-Fa-f]{6}$/)
    ]),
    is_active: new FormControl(true, { nonNullable: true })
  });

  constructor(private readonly classService: ClassesService) {
    this.classService.getClassTypes().subscribe(items => {
      this.classTypes = items.filter(item => item.tenant_id === this.tenantId);
    });
  }

  openCreateForm(): void {
    this.toastMessage = '';
    this.editingClassTypeId = null;
    this.submitted = false;
    this.classTypeForm.reset({
      class_name: '',
      description: null,
      duration_minutes: null,
      max_capacity: null,
      image_url: null,
      color_code: null,
      is_active: true
    });
    this.formOpen = true;
  }

  editClassType(classType: ClassType): void {
    this.toastMessage = '';
    this.editingClassTypeId = classType.class_type_id;
    this.submitted = false;
    this.classTypeForm.reset({
      class_name: classType.class_name,
      description: classType.description,
      duration_minutes: classType.duration_minutes,
      max_capacity: classType.max_capacity,
      image_url: classType.image_url,
      color_code: classType.color_code,
      is_active: classType.is_active
    });
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.submitted = false;
  }

  saveClassType(): void {
    this.submitted = true;
    this.classTypeForm.markAllAsTouched();
    if (this.classTypeForm.invalid) {
      return;
    }

    const values = this.classTypeForm.getRawValue() as ClassTypeFormValues;
    const normalized: ClassTypeFormValues = {
      ...values,
      class_name: values.class_name.trim(),
      description: values.description?.trim() || null,
      image_url: values.image_url?.trim() || null,
      color_code: values.color_code?.trim() || null
    };

    const updated = this.editingClassTypeId === null
      ? this.classService.addClassType(normalized)
      : this.classService.updateClassType(this.editingClassTypeId, normalized);

    if (!updated) {
      this.toastMessage = 'Unable to save class type.';
      return;
    }

    this.toastMessage = this.editingClassTypeId === null
      ? 'Class type created.'
      : 'Class type updated.';
    this.closeForm();
  }

  toggleClassTypeStatus(classType: ClassType): void {
    const updated = this.classService.toggleClassTypeStatus(classType.class_type_id);
    if (updated) {
      this.toastMessage = `${updated.class_name} is now ${updated.is_active ? 'active' : 'inactive'}.`;
    }
  }

  clearToast(): void {
    this.toastMessage = '';
  }
}