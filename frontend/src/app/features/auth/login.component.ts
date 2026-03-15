import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { UserRole } from '../../core/models/auth.models';
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
          <h2 class="display-title">A cleaner way into your lending workspace.</h2>
          <p class="lede">
            Sign in to review applications, submit loans, and move through the backend flow with a
            more modern, focused UI.
          </p>
        </div>

        <div class="auth-lead-grid">
          <div class="auth-feature">
            <p class="auth-feature-title">JWT secured</p>
            <p class="auth-feature-copy">Authenticated customer and officer flows.</p>
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
          <h2 class="section-title">Authenticate with FinSure</h2>
          <p class="auth-card-copy">
            Sign in with your backend credentials. Customer loan actions now resolve from the
            logged-in JWT session.
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

          <div class="field">
            <label for="role">Frontend role selection</label>
            <select id="role" formControlName="role">
              <option value="CUSTOMER">Customer</option>
              <option value="OFFICER">Officer</option>
            </select>
          </div>

          <div class="auth-utility">
            <span>Role-aware routing is enabled after login.</span>
            <span>{{ form.controls.role.value }}</span>
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
          Officer accounts must already exist in the backend with the OFFICER role.
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
    password: ['', [Validators.required]],
    role: ['CUSTOMER' as UserRole, [Validators.required]]
  });

  protected submit(): void {
    this.error.set('');
    this.success.set('');

    const selectedRole = this.form.controls.role.value;
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
            this.session.setSession(token, selectedRole, null);
            this.success.set('Login successful.');
            void this.router.navigate([selectedRole === 'OFFICER' ? '/officer' : '/customer']);
          } catch (error) {
            this.error.set(error instanceof Error ? error.message : 'Unable to initialize session.');
          }
        },
        error: (error) => {
          this.error.set(error?.error || 'Login failed. Check backend credentials and role access.');
        }
      });
  }
}
