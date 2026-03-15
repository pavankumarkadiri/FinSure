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
          <p class="eyebrow">Customer Onboarding</p>
          <h2 class="display-title">Create a customer account with a better first impression.</h2>
          <p class="lede">
            This registration screen maps directly to your backend and keeps the flow simple,
            modern, and easy to understand.
          </p>
        </div>

        <div class="auth-lead-grid">
          <div class="auth-feature">
            <p class="auth-feature-title">Register endpoint</p>
            <p class="auth-feature-copy">Directly aligned to the backend register endpoint.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Created role</p>
            <p class="auth-feature-copy">New signups become CUSTOMER users.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Next step</p>
            <p class="auth-feature-copy">Sign in and continue to loan application.</p>
          </div>
        </div>
      </article>

      <article class="auth-panel">
        <div class="auth-panel-head">
          <p class="eyebrow">Register</p>
          <h2 class="section-title">Create a new customer account</h2>
          <p class="auth-card-copy">
            Keep it simple: name, email, password. This screen stays aligned to the backend
            contract you already have.
          </p>
        </div>

        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label for="name">Full name</label>
            <input id="name" type="text" formControlName="name" placeholder="Enter full name">
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="name@example.com">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Choose a password">
          </div>

          <div class="message error" *ngIf="error()">{{ error() }}</div>
          <div class="message success" *ngIf="success()">{{ success() }}</div>

          <div class="button-row auth-actions">
            <button class="btn btn-primary" type="submit" [disabled]="loading()">
              {{ loading() ? 'Creating account...' : 'Register' }}
            </button>
            <a class="btn btn-secondary" routerLink="/login">Back to login</a>
          </div>
        </form>

        <p class="auth-footnote">
          The backend currently creates new signups only as customer accounts.
        </p>
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
