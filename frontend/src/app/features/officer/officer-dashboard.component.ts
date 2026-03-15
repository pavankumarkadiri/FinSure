import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoanApplication } from '../../core/models/loan.models';
import { OfficerService } from '../../core/services/officer.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-stack fade-sequence">
      <section class="hero-layout dashboard-hero">
        <article class="hero-card hero-panel">
          <div class="hero-grid">
            <div class="hero-copy">
              <p class="eyebrow">Officer Command</p>
              <h2 class="section-title">Review the queue in a sharper, faster command surface.</h2>
              <p class="lede">
                Signed in as {{ session.email() }}. Every approval action still relies on the backend
                EMI rule before a status is persisted, but the UI now keeps the queue readable and
                visually current.
              </p>

              <div class="hero-actions">
                <button class="btn btn-primary" type="button" (click)="loadPendingLoans()" [disabled]="loading()">
                  {{ loading() ? 'Syncing...' : 'Refresh queue' }}
                </button>
              </div>
            </div>

            <div class="hero-metrics">
              <div class="hero-stat">
                <p class="hero-label">Pending loans</p>
                <p class="hero-value">{{ loans().length }}</p>
              </div>
              <div class="hero-stat">
                <p class="hero-label">Queue value</p>
                <p class="hero-value">{{ totalPendingAmount() | currency:'INR':'symbol':'1.0-0' }}</p>
              </div>
              <div class="hero-stat">
                <p class="hero-label">Avg EMI</p>
                <p class="hero-value">{{ averageEmi() | currency:'INR':'symbol':'1.0-0' }}</p>
              </div>
            </div>
          </div>
        </article>

        <aside class="carousel-shell">
          <div class="carousel-track">
            <article class="carousel-slide">
              <div class="slide-visual">
                <div class="slide-panel one"></div>
                <div class="slide-panel two"></div>
                <div class="slide-panel three"></div>
              </div>
              <div class="slide-copy">
                <p class="eyebrow">Decision Snapshot</p>
                <h3 class="slide-title">Read the entire queue at a glance.</h3>
                <p class="slide-text">
                  High-risk EMI cases, queue size, and larger ticket values stay visible without
                  leaving the main officer workspace.
                </p>
                <div class="slide-meta">
                  <span class="slide-badge">Risk {{ emiRiskCount() }}</span>
                  <span class="slide-badge">Largest {{ largestLoan() | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </article>

            <article class="carousel-slide">
              <div class="slide-visual">
                <div class="slide-panel one"></div>
                <div class="slide-panel three"></div>
              </div>
              <div class="slide-copy">
                <p class="eyebrow">EMI Review</p>
                <h3 class="slide-title">See pressure points before you approve.</h3>
                <p class="slide-text">
                  The interface previews estimated EMI to support the same backend rule that rejects
                  applications when repayment load goes too high.
                </p>
                <div class="slide-meta">
                  <span class="slide-badge">Avg EMI {{ averageEmi() | currency:'INR':'symbol':'1.0-0' }}</span>
                  <span class="slide-badge">Avg salary {{ averageSalary() | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </article>

            <article class="carousel-slide">
              <div class="slide-visual">
                <div class="slide-panel two"></div>
                <div class="slide-panel three"></div>
              </div>
              <div class="slide-copy">
                <p class="eyebrow">Live Processing</p>
                <h3 class="slide-title">Approve, reject, and keep the queue moving.</h3>
                <p class="slide-text">
                  This workspace is optimized for quick decisions while keeping context visible in
                  the same view.
                </p>
                <div class="slide-meta">
                  <span class="slide-badge">Pending {{ loans().length }}</span>
                  <span class="slide-badge">{{ loading() ? 'Syncing' : 'Ready' }}</span>
                </div>
              </div>
            </article>
          </div>
        </aside>
      </section>

      <section class="stats-strip">
        <article class="stat-card">
          <p class="stat-label">Average ticket size</p>
          <p class="stat-value">{{ averageLoanAmount() | currency:'INR':'symbol':'1.0-0' }}</p>
          <p class="stat-hint">Mean amount across loans currently awaiting review.</p>
        </article>

        <article class="stat-card">
          <p class="stat-label">Average salary</p>
          <p class="stat-value">{{ averageSalary() | currency:'INR':'symbol':'1.0-0' }}</p>
          <p class="stat-hint">Average monthly salary of customers in the live queue.</p>
        </article>

        <article class="stat-card">
          <p class="stat-label">High EMI risk</p>
          <p class="stat-value">{{ emiRiskCount() }}</p>
          <p class="stat-hint">Applications likely to breach the 40% salary comfort zone.</p>
        </article>
      </section>

      <section class="officer-overview-grid">
        <article class="plain-space officer-info-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Queue Overview</p>
              <h3 class="section-title">A cleaner command view for officer decisions</h3>
            </div>
            <span class="info-pill">Review focused</span>
          </div>

          <div class="customer-insight-grid officer-signal-grid">
            <article class="insight-card">
              <p class="insight-label">Ready now</p>
              <p class="insight-value">{{ loans().length }} pending cases</p>
              <p class="mini-copy">
                The main queue stays on one screen so you can scan, judge, and act without switching context.
              </p>
            </article>

            <article class="insight-card">
              <p class="insight-label">Risk concentration</p>
              <p class="insight-value">{{ riskShare() }}% high-risk share</p>
              <p class="mini-copy">
                This shows how much of the live pipeline may fail the repayment-pressure rule.
              </p>
            </article>

            <article class="insight-card">
              <p class="insight-label">Largest exposure</p>
              <p class="insight-value">{{ largestLoan() | currency:'INR':'symbol':'1.0-0' }}</p>
              <p class="mini-copy">
                Use higher-value cases as the first pass when you need to reduce outstanding exposure quickly.
              </p>
            </article>
          </div>
        </article>

        <article class="plain-space officer-info-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Decision Checklist</p>
              <h3 class="section-title">What to confirm before approval</h3>
            </div>
          </div>

          <div class="checklist-grid">
            <div class="checklist-item">
              <span class="check-icon">01</span>
              <div>
                <p class="process-title">Read salary against EMI</p>
                <p class="process-copy">The backend still enforces the 40% ceiling, so this remains the first signal.</p>
              </div>
            </div>
            <div class="checklist-item">
              <span class="check-icon">02</span>
              <div>
                <p class="process-title">Check tenure realism</p>
                <p class="process-copy">Longer terms may soften EMI, but can hide stress if salary is already tight.</p>
              </div>
            </div>
            <div class="checklist-item">
              <span class="check-icon">03</span>
              <div>
                <p class="process-title">Confirm employment context</p>
                <p class="process-copy">Use employment type as a quick stability cue before committing the decision.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="insight-grid">
        <article class="table-card">
          <div class="table-header">
            <div>
              <p class="eyebrow">Review Queue</p>
              <h3 class="section-title">Pending loans</h3>
            </div>
            <div class="action-cluster">
              <button class="btn btn-ghost" type="button" (click)="loadPendingLoans()" [disabled]="loading()">
                {{ loading() ? 'Refreshing...' : 'Refresh queue' }}
              </button>
            </div>
          </div>

          <div class="message error" *ngIf="error()">{{ error() }}</div>
          <div class="message success" *ngIf="success()">{{ success() }}</div>

          <div class="table-wrap" *ngIf="loans().length; else noPending">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Salary</th>
                  <th>Tenure</th>
                  <th>Employment</th>
                  <th>Estimated EMI</th>
                  <th>Risk</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of loans()">
                  <td>#{{ loan.id }}</td>
                  <td>
                    <strong>{{ loan.customer?.name || 'Customer #' + loan.customer?.id }}</strong><br>
                    <span class="muted">{{ loan.customer?.email }}</span>
                  </td>
                  <td>{{ loan.loanAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td>{{ loan.salary | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td>{{ loan.tenureMonths }} months</td>
                  <td>{{ formatEmploymentType(loan.employmentType) }}</td>
                  <td>{{ estimateEmi(loan) | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="riskClass(loan)">
                      {{ isHighRisk(loan) ? 'High' : 'Normal' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-cluster">
                      <button class="btn btn-primary" type="button" (click)="process(loan.id, 'approve')">
                        Approve
                      </button>
                      <button class="btn btn-danger" type="button" (click)="process(loan.id, 'reject')">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noPending>
            <div class="empty-state">
              <p class="section-title">Queue cleared</p>
              <p class="muted">There are no APPLIED loans waiting for officer action right now.</p>
            </div>
          </ng-template>
        </article>

        <aside class="stack">
          <article class="plain-space officer-side-panel">
            <p class="eyebrow">Review Heuristics</p>
            <h3 class="section-title">How this console supports decisions</h3>
            <div class="detail-list">
              <div class="detail-item">
                <span>40% salary ceiling</span>
                <span class="detail-value">Backend enforced</span>
              </div>
              <div class="detail-item">
                <span>Interest basis</span>
                <span class="detail-value">10% annual</span>
              </div>
              <div class="detail-item">
                <span>Decision mode</span>
                <span class="detail-value">Manual + EMI check</span>
              </div>
            </div>
          </article>

          <article class="plain-space officer-side-panel">
            <p class="eyebrow">Review Workflow</p>
            <h3 class="section-title">Recommended sequence</h3>
            <div class="process-line">
              <div class="process-step">
                <span class="process-dot"></span>
                <div>
                  <p class="process-title">Review borrower profile</p>
                  <p class="process-copy">Use salary, tenure, and employment type to assess fit.</p>
                </div>
              </div>
              <div class="process-step">
                <span class="process-dot"></span>
                <div>
                  <p class="process-title">Check estimated EMI</p>
                  <p class="process-copy">The console previews likely pressure before approval is sent.</p>
                </div>
              </div>
              <div class="process-step">
                <span class="process-dot"></span>
                <div>
                  <p class="process-title">Commit action</p>
                  <p class="process-copy">Approve or reject and immediately refresh the live queue.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="plain-space officer-side-panel">
            <p class="eyebrow">Operational Notes</p>
            <h3 class="section-title">What makes this queue move faster</h3>
            <div class="detail-list">
              <div class="detail-item">
                <span>Refresh strategy</span>
                <span class="detail-value">On demand</span>
              </div>
              <div class="detail-item">
                <span>Highest-value case</span>
                <span class="detail-value">{{ largestLoan() | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-item">
                <span>Queue health</span>
                <span class="detail-value">{{ loading() ? 'Syncing' : 'Stable' }}</span>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </section>
  `
})
export class OfficerDashboardComponent {
  protected readonly session = inject(SessionService);
  private readonly officerService = inject(OfficerService);

  protected readonly loans = signal<LoanApplication[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  protected readonly totalPendingAmount = computed(
    () => this.loans().reduce((sum, loan) => sum + loan.loanAmount, 0)
  );
  protected readonly largestLoan = computed(
    () => this.loans().reduce((largest, loan) => Math.max(largest, loan.loanAmount), 0)
  );
  protected readonly averageLoanAmount = computed(() => {
    const loans = this.loans();
    if (!loans.length) {
      return 0;
    }

    return Math.round(this.totalPendingAmount() / loans.length);
  });
  protected readonly averageSalary = computed(() => {
    const loans = this.loans();
    if (!loans.length) {
      return 0;
    }

    return Math.round(loans.reduce((sum, loan) => sum + loan.salary, 0) / loans.length);
  });
  protected readonly averageEmi = computed(() => {
    const loans = this.loans();
    if (!loans.length) {
      return 0;
    }

    const total = loans.reduce((sum, loan) => sum + this.estimateEmi(loan), 0);
    return Math.round(total / loans.length);
  });
  protected readonly emiRiskCount = computed(
    () => this.loans().filter((loan) => this.isHighRisk(loan)).length
  );
  protected readonly riskShare = computed(() => {
    const loans = this.loans();
    if (!loans.length) {
      return 0;
    }

    return Math.round((this.emiRiskCount() / loans.length) * 100);
  });

  constructor() {
    this.loadPendingLoans();
  }

  protected loadPendingLoans(): void {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    this.officerService.getPendingLoans()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (loans) => this.loans.set(loans),
        error: (error) => {
          this.error.set(error?.error?.message || error?.error || 'Failed to load pending loans.');
        }
      });
  }

  protected process(loanId: number, action: 'approve' | 'reject'): void {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    const request$ = action === 'approve'
      ? this.officerService.approveLoan(loanId)
      : this.officerService.rejectLoan(loanId);

    request$
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => {
          this.success.set(message);
          this.loadPendingLoans();
        },
        error: (error) => {
          this.error.set(error?.error || `Unable to ${action} loan.`);
        }
      });
  }

  protected estimateEmi(loan: LoanApplication): number {
    const monthlyRate = 10 / (12 * 100);
    return (
      (loan.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loan.tenureMonths)) /
      (Math.pow(1 + monthlyRate, loan.tenureMonths) - 1)
    );
  }

  protected isHighRisk(loan: LoanApplication): boolean {
    return this.estimateEmi(loan) > loan.salary * 0.4;
  }

  protected riskClass(loan: LoanApplication): string {
    return this.isHighRisk(loan) ? 'status-rejected' : 'status-approved';
  }

  protected formatEmploymentType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
