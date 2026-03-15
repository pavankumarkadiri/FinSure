import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { LoanApplication } from '../../core/models/loan.models';
import { LoanService } from '../../core/services/loan.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-stack fade-sequence">
      <section class="photo-marquee-shell" id="home">
        <div class="photo-marquee-header">
          <div>
            <p class="eyebrow">Customer Moments</p>
            <h3 class="section-title">Real-life banking stories in motion</h3>
          </div>
          <p class="muted">
            A moving gallery placed between your hero summary and portfolio stats, focused on
            banking confidence, approvals, and the joy after receiving a loan.
          </p>
        </div>

        <div class="photo-marquee">
          <div class="photo-track">
            <div class="photo-group">
              <article class="photo-card" *ngFor="let photo of photoCards">
                <img [src]="photo.src" [alt]="photo.alt">
                <div class="photo-caption">
                  <p class="photo-title">{{ photo.title }}</p>
                  <p class="photo-copy">{{ photo.copy }}</p>
                </div>
              </article>
            </div>

            <div class="photo-group" aria-hidden="true">
              <article class="photo-card" *ngFor="let photo of photoCards">
                <img [src]="photo.src" [alt]="photo.alt">
                <div class="photo-caption">
                  <p class="photo-title">{{ photo.title }}</p>
                  <p class="photo-copy">{{ photo.copy }}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="hero-layout dashboard-hero">
        <article class="hero-card hero-panel">
          <div class="hero-grid">
            <div class="hero-copy">
              <p class="eyebrow">Welcome Back</p>
              <h2 class="section-title">Borrowing made calm, clear, and beautifully trackable.</h2>
              <p class="lede">
                Track active applications, submit a new request, and keep every loan decision in one
                place. Signed in as {{ session.email() }} with a dashboard designed like a modern
                product surface instead of a plain form screen.
              </p>

              <div class="hero-actions">
                <button class="btn btn-primary" type="button" (click)="loadLoans()" [disabled]="loadingLoans()">
                  {{ loadingLoans() ? 'Syncing...' : 'Refresh portfolio' }}
                </button>
                <button class="btn btn-ghost" type="button" (click)="focusApply = !focusApply">
                  {{ focusApply ? 'Viewing apply mode' : 'Open apply mode' }}
                </button>
              </div>
            </div>

            <div class="hero-metrics">
              <div class="hero-stat">
                <p class="hero-label">Customer</p>
                <p class="hero-value hero-value-email">{{ session.email() }}</p>
              </div>
              <div class="hero-stat">
                <p class="hero-label">Applications</p>
                <p class="hero-value">{{ loans().length }}</p>
              </div>
              <div class="hero-stat">
                <p class="hero-label">Approved</p>
                <p class="hero-value">{{ approvedCount() }}</p>
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
                <p class="eyebrow">Live Portfolio</p>
                <h3 class="slide-title">Watch every application move in one clean feed.</h3>
                <p class="slide-text">
                  Pending review, approved value, and rejection trends all stay visible the moment
                  you land on the dashboard.
                </p>
                <div class="slide-meta">
                  <span class="slide-badge">Pending {{ appliedCount() }}</span>
                  <span class="slide-badge">Approved {{ approvedCount() }}</span>
                </div>
              </div>
            </article>

            <article class="carousel-slide">
              <div class="slide-visual">
                <div class="slide-panel one"></div>
                <div class="slide-panel three"></div>
              </div>
              <div class="slide-copy">
                <p class="eyebrow">Application Ready</p>
                <h3 class="slide-title">Move from idea to loan request without friction.</h3>
                <p class="slide-text">
                  The apply panel stays close, lightweight, and tuned for fast submission instead of
                  making users jump across screens.
                </p>
                <div class="slide-meta">
                  <span class="slide-badge">Avg tenure {{ averageTenure() }} mo</span>
                  <span class="slide-badge">Total {{ totalRequested() | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </article>

            <article class="carousel-slide">
              <div class="slide-visual">
                <div class="slide-panel two"></div>
                <div class="slide-panel three"></div>
              </div>
              <div class="slide-copy">
                <p class="eyebrow">Backend Aligned</p>
                <h3 class="slide-title">Built around your current API contract.</h3>
                <p class="slide-text">
                  Customer endpoints still depend on your numeric user ID, so the dashboard preserves
                  that session detail while keeping the interface polished.
                </p>
                <div class="slide-meta">
                  <span class="slide-badge">{{ session.email() }}</span>
                  <span class="slide-badge">API synced</span>
                </div>
              </div>
            </article>
          </div>
        </aside>
      </section>

      <section class="stats-strip">
        <article class="stat-card">
          <p class="stat-label">Total requested</p>
          <p class="stat-value">{{ totalRequested() | currency:'INR':'symbol':'1.0-0' }}</p>
          <p class="stat-hint">Combined value across all recorded applications.</p>
        </article>

        <article class="stat-card">
          <p class="stat-label">Average tenure</p>
          <p class="stat-value">{{ averageTenure() }} mo</p>
          <p class="stat-hint">Typical repayment duration in your current portfolio.</p>
        </article>

        <article class="stat-card">
          <p class="stat-label">Approved value</p>
          <p class="stat-value">{{ approvedAmount() | currency:'INR':'symbol':'1.0-0' }}</p>
          <p class="stat-hint">Amount already cleared and available for your next step.</p>
        </article>
      </section>

      <section class="customer-info-grid" id="about">
        <article class="plain-space info-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Borrowing Snapshot</p>
              <h3 class="section-title">A clearer home page for real customer decisions</h3>
            </div>
            <span class="info-pill">Live from your portfolio</span>
          </div>

          <div class="customer-insight-grid">
            <article class="insight-card">
              <p class="insight-label">Current focus</p>
              <p class="insight-value">{{ appliedCount() ? 'Applications under review' : 'Ready for a fresh request' }}</p>
              <p class="mini-copy">
                {{ appliedCount() ? appliedCount() + ' application(s) are still moving through officer review.' : 'You do not have a live pending request right now.' }}
              </p>
            </article>

            <article class="insight-card">
              <p class="insight-label">Best next action</p>
              <p class="insight-value">{{ approvedCount() ? 'Plan the next milestone' : 'Prepare your strongest application' }}</p>
              <p class="mini-copy">
                {{ approvedCount() ? 'Use approved funds carefully and keep future borrowing capacity healthy.' : 'Enter a practical salary, tenure, and amount to improve review confidence.' }}
              </p>
            </article>

            <article class="insight-card">
              <p class="insight-label">Portfolio mix</p>
              <p class="insight-value">{{ loans().length ? averageTenure() + ' month average tenure' : 'No saved applications yet' }}</p>
              <p class="mini-copy">
                A shorter tenure reduces total interest, while a longer tenure can reduce monthly EMI pressure.
              </p>
            </article>
          </div>
        </article>

        <article class="plain-space info-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Before You Apply</p>
              <h3 class="section-title">What customers usually check first</h3>
            </div>
          </div>

          <div class="checklist-grid">
            <div class="checklist-item">
              <span class="check-icon">01</span>
              <div>
                <p class="process-title">Match amount to purpose</p>
                <p class="process-copy">Apply for a number tied to a specific plan like home work, education, or business support.</p>
              </div>
            </div>
            <div class="checklist-item">
              <span class="check-icon">02</span>
              <div>
                <p class="process-title">Keep EMI realistic</p>
                <p class="process-copy">The officer side uses EMI pressure against salary, so a balanced tenure matters.</p>
              </div>
            </div>
            <div class="checklist-item">
              <span class="check-icon">03</span>
              <div>
                <p class="process-title">Choose the right employment type</p>
                <p class="process-copy">This keeps your request aligned with the backend review data the officer sees.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="loan-catalog-band" id="loans">
        <div class="section-head">
          <div>
            <p class="eyebrow">Loan Products</p>
            <h3 class="section-title">Choose the type of loan that matches your goal</h3>
          </div>
          <p class="muted catalog-copy">
            Explore the most common borrowing options before you apply. Each one is designed for a
            different milestone, from study plans to business growth.
          </p>
        </div>

        <div class="loan-catalog-grid">
          <article class="loan-type-card" *ngFor="let loanType of loanTypes" [ngClass]="'loan-theme-' + loanType.theme">
            <div class="loan-type-media">
              <img class="loan-type-image" [src]="loanType.image" [alt]="loanType.title">
              <div class="loan-type-overlay"></div>
            </div>
            <div class="loan-type-body">
              <h4 class="loan-type-title">{{ loanType.title }}</h4>
              <p class="loan-type-copy">{{ loanType.copy }}</p>
              <div class="loan-type-meta">
                <span>{{ loanType.highlight }}</span>
                <span>Popular choice</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="emi-band" id="faq">
        <div class="emi-band-head">
          <div>
            <p class="eyebrow">EMI Calculator</p>
            <h3 class="section-title">Adjust the sliders and know your EMI instantly</h3>
          </div>
          <p class="muted catalog-copy">
            Move the controls and get a quick view of monthly EMI, total interest, and total
            payable before you submit a request.
          </p>
        </div>

        <div class="emi-layout">
          <article class="emi-controls">
            <div class="emi-control">
              <div class="emi-control-head">
                <label for="emiAmount">Loan Amount</label>
                <strong>{{ emiLoanAmount() | currency:'INR':'symbol':'1.0-0' }}</strong>
              </div>
              <input
                id="emiAmount"
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                [value]="emiLoanAmount()"
                (input)="updateEmiLoanAmount($any($event.target).value)"
              >
              <div class="emi-scale">
                <span>{{ 100000 | currency:'INR':'symbol':'1.0-0' }}</span>
                <span>{{ 5000000 | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <div class="emi-control">
              <div class="emi-control-head">
                <label for="emiTenure">Loan Tenure</label>
                <strong>{{ emiTenureMonths() }}M</strong>
              </div>
              <input
                id="emiTenure"
                type="range"
                min="6"
                max="120"
                step="1"
                [value]="emiTenureMonths()"
                (input)="updateEmiTenureMonths($any($event.target).value)"
              >
              <div class="emi-scale">
                <span>6M</span>
                <span>120M</span>
              </div>
            </div>

            <div class="emi-control">
              <div class="emi-control-head">
                <label for="emiRate">Interest Rate</label>
                <strong>{{ emiInterestRate() }}%</strong>
              </div>
              <input
                id="emiRate"
                type="range"
                min="7"
                max="18"
                step="0.1"
                [value]="emiInterestRate()"
                (input)="updateEmiInterestRate($any($event.target).value)"
              >
              <div class="emi-scale">
                <span>7%</span>
                <span>18%</span>
              </div>
            </div>
          </article>

          <article class="emi-summary">
            <div class="emi-summary-grid">
              <div class="emi-summary-card">
                <p class="emi-summary-label">Monthly EMI</p>
                <p class="emi-summary-value">{{ monthlyEmi() | currency:'INR':'symbol':'1.0-0' }}</p>
              </div>
              <div class="emi-summary-card emi-summary-card-warm">
                <p class="emi-summary-label">Total Interest</p>
                <p class="emi-summary-value">{{ totalInterest() | currency:'INR':'symbol':'1.0-0' }}</p>
              </div>
              <div class="emi-summary-card">
                <p class="emi-summary-label">Total Payable</p>
                <p class="emi-summary-value">{{ totalPayable() | currency:'INR':'symbol':'1.0-0' }}</p>
              </div>
            </div>

            <div class="emi-chart-wrap">
              <div class="emi-chart" [style.background]="emiChartGradient()"></div>
              <div class="emi-legend">
                <span><i class="emi-dot emi-dot-principal"></i> Principal</span>
                <span><i class="emi-dot emi-dot-interest"></i> Interest</span>
              </div>
            </div>

            <div class="emi-action-row">
              <button class="btn btn-primary" type="button" (click)="openApplyFromCalculator()">
                Apply for this loan
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="apply-home-grid">
        <article class="apply-space apply-main" [class.glass-card]="focusApply" id="apply">
          <div class="apply-head">
            <p class="eyebrow">New Request</p>
            <h3 class="section-title">Submit loan request</h3>
            <p class="muted">
              Start the application here. Keep the numbers realistic, choose the right employment
              type, and submit with clarity.
            </p>
          </div>

          <div class="apply-highlight-row">
            <div class="apply-highlight">
              <p class="apply-highlight-label">Best for</p>
              <p class="apply-highlight-value">Home, vehicle, education, growth</p>
            </div>
            <div class="apply-highlight">
              <p class="apply-highlight-label">Fast view</p>
              <p class="apply-highlight-value">{{ loans().length }} saved applications</p>
            </div>
          </div>

          <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="loanAmount">Loan amount</label>
              <input id="loanAmount" type="number" formControlName="loanAmount" placeholder="500000">
            </div>

            <div class="field">
              <label for="salary">Monthly salary</label>
              <input id="salary" type="number" formControlName="salary" placeholder="80000">
            </div>

            <div class="field">
              <label for="tenureMonths">Tenure in months</label>
              <input id="tenureMonths" type="number" formControlName="tenureMonths" placeholder="60">
            </div>

            <div class="field">
              <label for="employmentType">Employment type</label>
              <select id="employmentType" formControlName="employmentType">
                <option value="SALARIED">Salaried</option>
                <option value="SELF_EMPLOYED">Self employed</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            <div class="message error" *ngIf="submitError()">{{ submitError() }}</div>
            <div class="message success" *ngIf="submitSuccess()">{{ submitSuccess() }}</div>

            <div class="button-row">
              <button class="btn btn-primary" type="submit" [disabled]="submitting()">
                {{ submitting() ? 'Submitting...' : 'Apply for loan' }}
              </button>
            </div>
          </form>
        </article>

        <aside class="apply-layout">
          <article class="review-space plain-space">
            <p class="eyebrow">Review Flow</p>
            <h3 class="section-title">What happens after you apply</h3>
            <div class="process-line">
              <div class="process-step">
                <span class="process-dot"></span>
                <div>
                  <p class="process-title">Application recorded</p>
                  <p class="process-copy">Your request is created in the backend with APPLIED status.</p>
                </div>
              </div>
              <div class="process-step">
                <span class="process-dot"></span>
                <div>
                  <p class="process-title">Officer review</p>
                  <p class="process-copy">An officer evaluates the loan and runs EMI-based validation.</p>
                </div>
              </div>
              <div class="process-step">
                <span class="process-dot"></span>
                <div>
                  <p class="process-title">Decision published</p>
                  <p class="process-copy">Refresh this page to see APPROVED or REJECTED status updates.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="plain-space attraction-space">
            <p class="eyebrow">Why Customers Apply</p>
            <h3 class="section-title">Turn a plan into progress</h3>
            <div class="detail-list">
              <div class="detail-item">
                <span>Home improvements</span>
                <span class="detail-value">Upgrade faster</span>
              </div>
              <div class="detail-item">
                <span>Education goals</span>
                <span class="detail-value">Invest in growth</span>
              </div>
              <div class="detail-item">
                <span>Business support</span>
                <span class="detail-value">Move with confidence</span>
              </div>
            </div>
            <p class="mini-copy">
              The best home page for a borrower is one that keeps the next action obvious. This
              space is built to make applying feel immediate and worthwhile.
            </p>
          </article>

          <article class="plain-space attraction-space">
            <p class="eyebrow">Helpful Guidance</p>
            <h3 class="section-title">Simple signals customers actually use</h3>
            <div class="detail-list">
              <div class="detail-item">
                <span>Approved applications</span>
                <span class="detail-value">{{ approvedCount() }}</span>
              </div>
              <div class="detail-item">
                <span>Pending review</span>
                <span class="detail-value">{{ appliedCount() }}</span>
              </div>
              <div class="detail-item">
                <span>Suggested planning</span>
                <span class="detail-value">Stable EMI first</span>
              </div>
            </div>
            <p class="mini-copy">
              Customers usually prefer a home page that explains what to do next. This section keeps
              the path simple: apply with clarity, wait for review, and monitor approved value.
            </p>
          </article>
        </aside>
      </section>

      <section class="support-band" id="contact">
        <article class="plain-space support-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Contact</p>
              <h3 class="section-title">Talk to customer care when you need help</h3>
            </div>
          </div>

          <div class="support-grid">
            <div class="support-card">
              <p class="support-label">Customer Care</p>
              <p class="support-value">1800-120-9000</p>
              <p class="mini-copy">Monday to Saturday, 9 AM to 7 PM</p>
            </div>
            <div class="support-card">
              <p class="support-label">Email Support</p>
              <p class="support-value">support&#64;finsure.in</p>
              <p class="mini-copy">Loan help, application status, and document guidance</p>
            </div>
            <div class="support-card">
              <p class="support-label">Quick Visit</p>
              <p class="support-value">Nearest branch help</p>
              <p class="mini-copy">Get guided support for planning and loan selection</p>
            </div>
          </div>
        </article>
      </section>
    </section>
  `
})
export class CustomerDashboardComponent {
  protected readonly session = inject(SessionService);
  private readonly fb = inject(FormBuilder);
  private readonly loanService = inject(LoanService);

  protected readonly loans = signal<LoanApplication[]>([]);
  protected readonly photoCards = [
    {
      src: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
      alt: 'Customer completing digital banking paperwork',
      title: 'Digital Banking',
      copy: 'Fast onboarding and smart financing decisions.'
    },
    {
      src: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80',
      alt: 'Happy customer reviewing loan funds and banking details',
      title: 'Funds Approved',
      copy: 'A clearer path from request to approval.'
    },
    {
      src: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
      alt: 'Customer smiling after receiving financial approval',
      title: 'Loan Success',
      copy: 'Confidence and joy after the money lands.'
    },
    {
      src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
      alt: 'Person using modern banking dashboard on a laptop',
      title: 'Modern Workflow',
      copy: 'Track every status change in a clean interface.'
    },
    {
      src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      alt: 'Customer celebrating a positive financial milestone',
      title: 'Milestone Reached',
      copy: 'The emotional payoff after the right loan support.'
    },
    {
      src: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&w=1200&q=80',
      alt: 'Banking discussion and financial planning with confidence',
      title: 'Planning Ahead',
      copy: 'Better visibility for better financial decisions.'
    }
  ];
  protected readonly loanTypes = [
    {
      tag: 'Education',
      theme: 'education',
      title: 'Education Loan',
      copy: 'Support tuition fees, books, campus living, or professional upskilling with a study-focused loan.',
      highlight: 'Study planning',
      tenure: 'Flexible repayment',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
    },
    {
      tag: 'Home',
      theme: 'home',
      title: 'Home Loan',
      copy: 'Finance a new home purchase, expansion, or long-term residential upgrade with structured repayment.',
      highlight: 'Property goals',
      tenure: 'Long tenure',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    },
    {
      tag: 'Vehicle',
      theme: 'vehicle',
      title: 'Car Loan',
      copy: 'Get support for a new or used car with predictable monthly repayment and clearer planning.',
      highlight: 'Personal mobility',
      tenure: 'Quick approvals',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
    },
    {
      tag: 'Business',
      theme: 'business',
      title: 'Business Loan',
      copy: 'Fund inventory, expansion, working capital, or operational upgrades for your business ambitions.',
      highlight: 'Growth capital',
      tenure: 'Business use',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
    },
    {
      tag: 'Medical',
      theme: 'medical',
      title: 'Medical Loan',
      copy: 'Handle urgent procedures, treatment costs, and recovery-related expenses without delaying care.',
      highlight: 'Emergency support',
      tenure: 'Fast funding',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
    },
    {
      tag: 'Travel',
      theme: 'travel',
      title: 'Travel Loan',
      copy: 'Cover planned international trips, family travel, or important journeys with manageable installments.',
      highlight: 'Planned experiences',
      tenure: 'Short to mid term',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'
    }
  ];
  protected focusApply = false;
  protected readonly emiLoanAmount = signal(3710000);
  protected readonly emiTenureMonths = signal(37);
  protected readonly emiInterestRate = signal(15.5);
  protected readonly loadingLoans = signal(false);
  protected readonly loanError = signal('');
  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly submitSuccess = signal('');

  protected readonly approvedCount = computed(
    () => this.loans().filter((loan) => loan.status === 'APPROVED').length
  );
  protected readonly appliedCount = computed(
    () => this.loans().filter((loan) => loan.status === 'APPLIED').length
  );
  protected readonly totalRequested = computed(
    () => this.loans().reduce((sum, loan) => sum + loan.loanAmount, 0)
  );
  protected readonly approvedAmount = computed(
    () => this.loans()
      .filter((loan) => loan.status === 'APPROVED')
      .reduce((sum, loan) => sum + loan.loanAmount, 0)
  );
  protected readonly averageTenure = computed(() => {
    const loans = this.loans();
    if (!loans.length) {
      return 0;
    }

    return Math.round(loans.reduce((sum, loan) => sum + loan.tenureMonths, 0) / loans.length);
  });
  protected readonly monthlyEmi = computed(() => {
    const monthlyRate = this.emiInterestRate() / (12 * 100);
    const months = this.emiTenureMonths();
    const amount = this.emiLoanAmount();
    const growth = Math.pow(1 + monthlyRate, months);
    const emi = (amount * monthlyRate * growth) / (growth - 1);

    return Number.isFinite(emi) ? Math.round(emi) : 0;
  });
  protected readonly totalPayable = computed(
    () => this.monthlyEmi() * this.emiTenureMonths()
  );
  protected readonly totalInterest = computed(
    () => Math.max(this.totalPayable() - this.emiLoanAmount(), 0)
  );
  protected readonly interestPercent = computed(() => {
    const total = this.totalPayable();
    if (!total) {
      return 0;
    }

    return Math.round((this.totalInterest() / total) * 100);
  });

  protected readonly form = this.fb.nonNullable.group({
    loanAmount: [500000, [Validators.required, Validators.min(1000)]],
    salary: [80000, [Validators.required, Validators.min(1)]],
    tenureMonths: [60, [Validators.required, Validators.min(1)]],
    employmentType: ['SALARIED', [Validators.required]]
  });

  constructor() {
    effect(() => {
      if (!this.focusApply) {
        return;
      }

      this.form.patchValue({
        loanAmount: this.emiLoanAmount(),
        tenureMonths: this.emiTenureMonths()
      }, { emitEvent: false });
    });

    this.loadLoans();
  }

  protected updateEmiLoanAmount(value: string): void {
    this.emiLoanAmount.set(Number(value));
  }

  protected updateEmiTenureMonths(value: string): void {
    this.emiTenureMonths.set(Number(value));
  }

  protected updateEmiInterestRate(value: string): void {
    this.emiInterestRate.set(Number(value));
  }

  protected emiChartGradient(): string {
    const interest = this.interestPercent();
    return `conic-gradient(#ffd04d 0 ${interest}%, #2f67ff ${interest}% 100%)`;
  }

  protected openApplyFromCalculator(): void {
    this.focusApply = true;
    this.form.patchValue({
      loanAmount: this.emiLoanAmount(),
      tenureMonths: this.emiTenureMonths()
    });

    const applySection = document.getElementById('apply');
    applySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected loadLoans(): void {
    this.loanError.set('');
    this.loadingLoans.set(true);

    this.loanService.getCurrentUserLoans()
      .pipe(finalize(() => this.loadingLoans.set(false)))
      .subscribe({
        next: (loans) => this.loans.set(loans),
        error: (error) => {
          this.loanError.set(error?.error?.message || error?.error || 'Failed to load customer loans.');
        }
      });
  }

  protected submit(): void {
    this.submitError.set('');
    this.submitSuccess.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Enter valid loan details before submitting.');
      return;
    }

    this.submitting.set(true);

    this.loanService.applyLoanForCurrentUser(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (message) => {
          this.submitSuccess.set(message);
          this.form.reset({
            loanAmount: 500000,
            salary: 80000,
            tenureMonths: 60,
            employmentType: 'SALARIED'
          });
          this.loadLoans();
        },
        error: (error) => {
          this.submitError.set(error?.error || 'Loan submission failed.');
        }
      });
  }
}
