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
          <p class="eyebrow">Secure Access</p>
          <h2 class="display-title">Welcome to your FinSure loan workspace.</h2>
          <p class="lede">
            Sign in to apply for loans, track your requests, or review pending applications from
            one clear dashboard.
          </p>
        </div>

        <div class="auth-lead-grid">
          <div class="auth-feature">
            <p class="auth-feature-title">Protected access</p>
            <p class="auth-feature-copy">Your account opens the right dashboard automatically.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Customer dashboard</p>
            <p class="auth-feature-copy">Apply, track, and manage loan activity.</p>
          </div>
          <div class="auth-feature">
            <p class="auth-feature-title">Officer review</p>
            <p class="auth-feature-copy">Approve and reject with live queue access.</p>
          </div>
        </div>
      </article>

      <article class="auth-panel">
        <div class="auth-panel-head">
          <p class="eyebrow">Login</p>
          <h2 class="section-title">Sign in to FinSure</h2>
          <p class="auth-card-copy">
            Enter your email and password. FinSure will take you to the right dashboard for your
            account.
          </p>
        </div>

        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="name@example.com">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Enter password">
          </div>

          <div class="auth-utility">
            <span>Forgot your details? Contact your branch or support team.</span>
            <span>Account access</span>
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
