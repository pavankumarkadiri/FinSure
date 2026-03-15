import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { LoanApplication } from '../../core/models/loan.models';
import { CustomerProfile, CustomerProfileService } from '../../core/services/customer-profile.service';
import { LoanService } from '../../core/services/loan.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-stack fade-sequence">
      <section class="hero-layout dashboard-hero profile-hero-layout">
        <article class="hero-card hero-panel">
          <div class="hero-grid">
            <div class="hero-copy">
              <p class="eyebrow">Customer Profile</p>
              <h2 class="section-title">Manage your personal profile and saved loan details.</h2>
              <p class="lede">
                This page lets the customer maintain editable profile details in the backend and
                review saved loan records from the current account.
              </p>
              <div class="hero-actions">
                <button class="btn btn-primary" type="button" (click)="saveProfile()" [disabled]="saving()">
                  {{ saving() ? 'Saving...' : 'Save profile' }}
                </button>
                <button class="btn btn-ghost" type="button" (click)="loadLoans()" [disabled]="loadingLoans()">
                  {{ loadingLoans() ? 'Refreshing...' : 'Refresh loans' }}
                </button>
              </div>
            </div>

            <div class="hero-metrics">
              <div class="hero-stat">
                <p class="hero-label">Email</p>
                <p class="hero-value hero-value-email">{{ session.email() }}</p>
              </div>
              <div class="hero-stat">
                <p class="hero-label">Account</p>
                <p class="hero-value">Customer</p>
              </div>
              <div class="hero-stat">
                <p class="hero-label">Saved loans</p>
                <p class="hero-value">{{ loans().length }}</p>
              </div>
            </div>
          </div>
        </article>

        <aside class="panel apply-space">
          <p class="eyebrow">Backend Profile Sync</p>
          <h3 class="section-title">Profile details are now stored on the server</h3>
          <p class="muted">
            Your profile details now save against the authenticated customer record in the backend,
            so they remain available after refresh and across sessions.
          </p>
          <div class="detail-list">
            <div class="detail-item">
              <span>Editable details</span>
              <span class="detail-value">Backend synced</span>
            </div>
            <div class="detail-item">
              <span>Loan records</span>
              <span class="detail-value">Backend synced</span>
            </div>
          </div>
        </aside>
      </section>

      <section class="insight-grid">
        <article class="apply-space">
          <p class="eyebrow">Personal Details</p>
          <h3 class="section-title">Update your profile</h3>

          <form class="form-grid" [formGroup]="form" (ngSubmit)="saveProfile()">
            <div class="field">
              <label for="fullName">Full name</label>
              <input id="fullName" type="text" formControlName="fullName" placeholder="Enter your full name">
            </div>

            <div class="field">
              <label for="phone">Phone</label>
              <input id="phone" type="text" formControlName="phone" placeholder="Enter phone number">
            </div>

            <div class="field">
              <label for="city">City</label>
              <input id="city" type="text" formControlName="city" placeholder="Enter city">
            </div>

            <div class="field">
              <label for="occupation">Occupation</label>
              <input id="occupation" type="text" formControlName="occupation" placeholder="Enter occupation">
            </div>

            <div class="field">
              <label for="monthlyGoal">Financial goal</label>
              <input id="monthlyGoal" type="text" formControlName="monthlyGoal" placeholder="Example: Home renovation">
            </div>

            <div class="field">
              <label for="notes">Notes</label>
              <input id="notes" type="text" formControlName="notes" placeholder="Any profile note">
            </div>

            <div class="message error" *ngIf="profileError()">{{ profileError() }}</div>
            <div class="message success" *ngIf="success()">{{ success() }}</div>

            <div class="button-row">
              <button class="btn btn-primary" type="submit" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </form>
        </article>

        <aside class="review-space">
          <p class="eyebrow">Saved Loan Details</p>
          <h3 class="section-title">Latest applications</h3>

          <div class="message error" *ngIf="error()">{{ error() }}</div>

          <div class="detail-list" *ngIf="loans().length; else noLoans">
            <div class="detail-item" *ngFor="let loan of loans()">
              <span>
                #{{ loan.id }} · {{ loan.tenureMonths }} mo · {{ formatEmploymentType(loan.employmentType) }}
              </span>
              <span class="detail-value">
                {{ loan.loanAmount | currency:'INR':'symbol':'1.0-0' }} · {{ loan.status }}
              </span>
            </div>
          </div>

          <ng-template #noLoans>
            <p class="muted">No saved loan details found for this customer.</p>
          </ng-template>

          <div class="mini-card">
            <p class="mini-title">Approved value</p>
            <p class="mini-copy">{{ approvedAmount() | currency:'INR':'symbol':'1.0-0' }}</p>
          </div>
        </aside>
      </section>
    </section>
  `
})
export class CustomerProfileComponent {
  protected readonly session = inject(SessionService);
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(CustomerProfileService);
  private readonly loanService = inject(LoanService);

  protected readonly saving = signal(false);
  protected readonly success = signal('');
  protected readonly error = signal('');
  protected readonly profileError = signal('');
  protected readonly loadingProfile = signal(false);
  protected readonly loadingLoans = signal(false);
  protected readonly loans = signal<LoanApplication[]>([]);

  protected readonly approvedAmount = computed(
    () => this.loans()
      .filter((loan) => loan.status === 'APPROVED')
      .reduce((sum, loan) => sum + loan.loanAmount, 0)
  );

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    phone: [''],
    city: [''],
    occupation: [''],
    monthlyGoal: [''],
    notes: ['']
  });

  constructor() {
    this.loadProfile();
    this.loadLoans();
  }

  protected saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.profileError.set('Enter valid profile details before saving.');
      return;
    }

    this.saving.set(true);
    this.success.set('');
    this.profileError.set('');

    const profile: CustomerProfile = this.form.getRawValue();
    this.profileService.saveCurrentProfile(profile)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (savedProfile) => {
          this.form.patchValue(savedProfile);
          this.success.set('Profile saved to backend.');
        },
        error: (error) => {
          this.profileError.set(error?.error?.message || error?.error || 'Failed to save profile.');
        }
      });
  }

  private loadProfile(): void {
    if (!this.session.token()) {
      return;
    }

    this.loadingProfile.set(true);
    this.profileError.set('');

    this.profileService.getCurrentProfile()
      .pipe(finalize(() => this.loadingProfile.set(false)))
      .subscribe({
        next: (profile) => this.form.patchValue(profile),
        error: (error) => {
          const status = error?.status;
          if (status === 401 || status === 403) {
            return;
          }

          this.profileError.set(error?.error?.message || error?.error || 'Failed to load profile.');
        }
      });
  }

  protected loadLoans(): void {
    if (!this.session.token()) {
      this.error.set('');
      this.loans.set([]);
      return;
    }

    this.error.set('');
    this.loadingLoans.set(true);

    this.loanService.getCurrentUserLoans()
      .pipe(finalize(() => this.loadingLoans.set(false)))
      .subscribe({
        next: (loans) => this.loans.set(loans),
        error: (error) => {
          const status = error?.status;
          if (status === 401 || status === 403) {
            this.error.set('');
            this.loans.set([]);
            return;
          }

          this.error.set(error?.error?.message || error?.error || 'Failed to load saved loan details.');
        }
      });
  }

  protected formatEmploymentType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
