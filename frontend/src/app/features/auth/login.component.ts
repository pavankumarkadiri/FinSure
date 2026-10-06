import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page fade-sequence">
      <article class="auth-lead">
        <div class="auth-lead-copy">
          <p class="eyebrow">Welcome Back</p>
          <h2 class="display-title">Manage loans with less effort.</h2>
          <p class="lede">
            Sign in once and continue with applications, approvals, and profile updates from a
            focused FinSure dashboard.
          </p>
        </div>

        <div class="auth-proof-row" aria-label="FinSure highlights">
          <span>Fast loan requests</span>
          <span>Clear status tracking</span>
          <span>Officer review tools</span>
        </div>

        <div class="auth-lead-grid">
          <div class="auth-feature">
            <p class="auth-feature-title">One login</p>
            <p class="auth-feature-copy">Customers and officers land in the right workspace.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Loan progress</p>
            <p class="auth-feature-copy">Follow each request from applied to final decision.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Simple review</p>
            <p class="auth-feature-copy">Review queues stay readable and action focused.</p>
          </div>
        </div>
      </article>

      <article class="auth-panel">
        <div class="auth-panel-card">
          <div class="auth-panel-head">
            <p class="eyebrow">Sign In</p>
            <h2 class="section-title">Access your account</h2>
            <p class="auth-card-copy">
              Use your registered email and password. FinSure will open the correct dashboard for
              your account.
            </p>
          </div>

          <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
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
                placeholder="Enter password"
                autocomplete="current-password"
              >
              <p class="field-hint" *ngIf="form.controls.password.touched && form.controls.password.invalid">
                Password is required.
              </p>
            </div>

            <div class="auth-utility">
              <span>Need help? Contact your branch or support team.</span>
              <span>Secure access</span>
            </div>

            <div class="message error" *ngIf="error()">{{ error() }}</div>

            <div class="button-row auth-actions">
              <button class="btn btn-primary" type="submit" [disabled]="loading()">
                {{ loading() ? 'Signing in...' : 'Sign in' }}
              </button>
              <a class="btn btn-secondary" routerLink="/register">Create account</a>
            </div>
          </form>

          <p class="auth-footnote">
            Officer access is available only for approved staff accounts.
          </p>
        </div>
      </article>
    </section>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected submit(): void {
    this.error.set('');
    this.success.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Enter a valid email and password before continuing.');
      return;
    }

    this.loading.set(true);

    this.authService.login({
      email: this.form.controls.email.value,
      password: this.form.controls.password.value
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (token) => {
          try {
            this.session.setSession(token);
            this.success.set('Login successful.');
            void this.router.navigate([this.session.role() === 'OFFICER' ? '/officer' : '/customer']);
          } catch (error) {
            this.error.set(error instanceof Error ? error.message : 'We could not sign you in. Please try again.');
          }
        },
        error: (error) => {
          this.error.set(error?.error || 'We could not sign you in. Please check your email and password.');
        }
      });
  }
}
