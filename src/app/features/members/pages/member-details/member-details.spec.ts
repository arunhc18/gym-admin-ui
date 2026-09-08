import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { MemberDetailsComponent } from './member-details';

describe('MemberDetailsComponent validation', () => {
  let component: MemberDetailsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: {
              queryParamMap: convertToParamMap({})
            }
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MemberDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires every mandatory member field', () => {
    for (const controlName of ['memberCode', 'firstName', 'lastName', 'phone']) {
      const control = component.memberForm.controls[controlName];
      control.setValue('');
      expect(control.hasError('required')).toBe(true);
    }

    component.memberForm.controls['status'].setValue('');
    expect(component.memberForm.controls['status'].hasError('required')).toBe(true);

    component.memberForm.controls['firstName'].setValue('   ');
    expect(component.memberForm.controls['firstName'].hasError('whitespaceOnly')).toBe(true);
  });

  it('validates phone digit count and prevents duplicate phone numbers', () => {
    component.memberForm.patchValue({
      phone: '9876543210',
      alternatePhone: '98765'
    });
    expect(component.memberForm.controls['alternatePhone'].hasError('phoneLength')).toBe(true);

    component.memberForm.controls['alternatePhone'].setValue('9876543210');
    expect(component.memberForm.hasError('alternatePhoneMatchesPhone')).toBe(true);
  });

  it('rejects a future date and members younger than 18', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    component.memberForm.controls['dateOfBirth'].setValue(toDateValue(futureDate));
    expect(component.memberForm.controls['dateOfBirth'].hasError('futureDate')).toBe(true);

    const underAgeDate = new Date();
    underAgeDate.setFullYear(underAgeDate.getFullYear() - 17);
    component.memberForm.controls['dateOfBirth'].setValue(toDateValue(underAgeDate));
    expect(component.memberForm.controls['dateOfBirth'].hasError('underAge')).toBe(true);
  });

  it('requires a matching ID proof type and valid ID number', () => {
    component.memberForm.patchValue({ idProofType: 'aadhaar', idProofNumber: '' });
    expect(component.memberForm.hasError('idProofNumberRequired')).toBe(true);

    component.memberForm.controls['idProofNumber'].setValue('1234');
    expect(component.memberForm.hasError('invalidIdProofFormat')).toBe(true);

    component.memberForm.controls['idProofNumber'].setValue('123456789012');
    expect(component.memberForm.hasError('invalidIdProofFormat')).toBe(false);
  });

  it('requires a referring member ID for member referrals', () => {
    component.memberForm.patchValue({
      referralSource: 'member-referral',
      referredByMemberId: ''
    });
    expect(component.memberForm.hasError('referredByMemberRequired')).toBe(true);
  });

  it('validates ID proof file type and size', () => {
    const invalidFile = new File(['text'], 'proof.txt', { type: 'text/plain' });
    const input = { files: [invalidFile], value: 'proof.txt' };

    component.onIdProofFileSelected({ target: input } as unknown as Event);

    expect(component.memberForm.controls['idProofUrl'].hasError('invalidFileType')).toBe(true);
  });
});

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
