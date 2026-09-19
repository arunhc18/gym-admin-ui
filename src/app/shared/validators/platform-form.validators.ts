import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function noWhitespaceValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = String(control.value ?? '');
  return value.length > 0 && value.trim().length === 0
    ? { whitespace: true }
    : null;
}

export function trimmedMinLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    return value.length > 0 && value.length < minLength
      ? { minlength: { requiredLength: minLength, actualLength: value.length } }
      : null;
  };
}

export function containsLetterValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  return value.length > 0 && !/[A-Za-z]/.test(value)
    ? { noLetter: true }
    : null;
}

export function containsLetterOrNumberValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  return value.length > 0 && !/[A-Za-z0-9]/.test(value)
    ? { noLetterOrNumber: true }
    : null;
}

export function wholeNumberValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= 0
    ? null
    : { wholeNumber: true };
}

export function decimalPlacesValidator(maxPlaces: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) {
      return null;
    }

    return /^\d+(?:\.\d+)?$/.test(value) &&
      (value.split('.')[1]?.length ?? 0) <= maxPlaces
      ? null
      : { decimalPlaces: { maxPlaces } };
  };
}

export function allowedValueValidator(values: readonly string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    return values.includes(value) ? null : { allowedValue: true };
  };
}

export function validDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? { invalidDate: true } : null;
}

export function subdomainValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }

  if (!/^[a-z0-9-]+$/.test(value)) {
    return { subdomainPattern: true };
  }

  if (value.startsWith('-') || value.endsWith('-')) {
    return { subdomainBoundary: true };
  }

  if (value.includes('--')) {
    return { subdomainConsecutiveHyphen: true };
  }

  return null;
}

export function dateRangeValidator(
  startControlName: string,
  endControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const start = String(group.get(startControlName)?.value ?? '');
    const end = String(group.get(endControlName)?.value ?? '');

    return start && end && end < start
      ? { beforeStartDate: true }
      : null;
  };
}

export function pricingValidator(
  billingCycleControlName: string,
  monthlyControlName: string,
  yearlyControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const cycle = group.get(billingCycleControlName)?.value;
    const monthly = group.get(monthlyControlName)?.value;
    const yearly = group.get(yearlyControlName)?.value;

    if (cycle === 'monthly' && (monthly === null || monthly === undefined || monthly === '')) {
      return { monthlyPriceRequired: true };
    }

    if (cycle === 'yearly' && (yearly === null || yearly === undefined || yearly === '')) {
      return { yearlyPriceRequired: true };
    }

    return null;
  };
}

export function tenantLimitValidator(
  inheritControlName: string,
  locationsControlName: string,
  membersControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const inherits = group.get(inheritControlName)?.value;
    const locations = group.get(locationsControlName)?.value;
    const members = group.get(membersControlName)?.value;

    if (inherits) {
      return null;
    }

    return (locations === null || locations === undefined || locations === '' ||
      members === null || members === undefined || members === '')
      ? { limitsRequired: true }
      : null;
  };
}
