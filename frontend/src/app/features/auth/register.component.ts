import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page fade-sequence">
      <article class="auth-lead auth-lead-register">
        <div class="auth-lead-copy">
          <p class="eyebrow">Create Account</p>
          <h2 class="display-title">Start your loan journey with FinSure.</h2>
          <p class="lede">
            Set up your customer account, sign in, and begin managing loan requests from a clear
            dashboard.
          </p>
        </div>

        <div class="auth-proof-row" aria-label="Signup highlights">
          <span>Simple details</span>
          <span>Quick access</span>
          <span>Loan-ready account</span>
        </div>

        <div class="auth-lead-grid">
          <div class="auth-feature">
            <p class="auth-feature-title">Quick setup</p>
            <p class="auth-feature-copy">Create your account with only the essentials.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Customer access</p>
            <p class="auth-feature-copy">New accounts are ready for customer loan tools.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Next step</p>
            <p class="auth-feature-copy">Sign in and continue to loan application.</p>
          </div>
        </div>
      </article>

      <article class="auth-panel">
        <div class="auth-panel-card">
          <div class="auth-panel-head">
            <p class="eyebrow">Sign Up</p>
            <h2 class="section-title">Create your account</h2>
            <p class="auth-card-copy">
              Add your basic details now. After registration, sign in to submit and track loan
              requests.
            </p>
          </div>

          <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="field">
              <label for="name">Full name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="Enter full name"
                autocomplete="name"
              >
              <p class="field-hint" *ngIf="form.controls.name.touched && form.controls.name.invalid">
                Enter at least 2 characters.
              </p>
            </div>

            <div class="field">
              <label for="email">Email address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                autocomplete="email"
              >
              <p class="field-hint" *ngIf="form.controls.email.touched && form.controls.email.invalid">
                Enter a valid email address.
              </p>
            </div>

            <div class="field">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Choose a password"
                autocomplete="new-password"
              >
              <p class="field-hint" *ngIf="form.controls.password.touched && form.controls.password.invalid">
                Use at least 4 characters.
              </p>
            </div>

            <div class="message error" *ngIf="error()">{{ error() }}</div>
            <div class="message success" *ngIf="success()">{{ success() }}</div>

            <div class="button-row auth-actions">
              <button class="btn btn-primary" type="submit" [disabled]="loading()">
                {{ loading() ? 'Creating account...' : 'Create account' }}
              </button>
              <a class="btn btn-secondary" routerLink="/login">Back to login</a>
            </div>
          </form>

          <p class="auth-footnote">
            New signups are created as customer accounts.
          </p>
        </div>
      </article>
    </section>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  protected submit(): void {
    this.error.set('');
    this.success.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Enter name, email, and password before submitting.');
      return;
    }

    this.loading.set(true);

    this.authService.register(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => {
          this.success.set(`${message}. Redirecting to login.`);
          this.form.reset({ name: '', email: '', password: '' });
          setTimeout(() => {
            void this.router.navigate(['/login']);
          }, 900);
        },
        error: (error) => {
          this.error.set(error?.error || 'Registration failed.');
        }
      });
  }
}
