import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from './core/services/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="page-shell">
      <div class="ambient-orb one"></div>
      <div class="ambient-orb two"></div>

      <header class="topbar hero-card" [class.topbar-scrolled]="scrolled()">
        <div class="topbar-left">
          <div class="brand-block">
            <a class="brand-home-link" [routerLink]="homeRoute()">
              <h1 class="brand-title">FinSure</h1>
            </a>
          </div>
        </div>

        <div class="topbar-center" *ngIf="session.isAuthenticated()">
          <nav class="nav-links nav-links-main">
            <a href="" (click)="goToSection($event, 'home')">Home</a>
            <a href="" (click)="goToSection($event, 'about')">About</a>
            <a href="" (click)="goToSection($event, 'loans')">Loans</a>
            <a href="" (click)="goToSection($event, 'faq')">FAQ</a>
            <a href="" (click)="goToSection($event, 'contact')">Contact</a>
          </nav>
        </div>

        <div class="topbar-right" *ngIf="session.isAuthenticated()">
          <div class="shell-meta">
            <a
              *ngIf="session.role() === 'CUSTOMER'"
              class="apply-now-link"
              [routerLink]="homeRoute()"
              fragment="apply"
            >
              Apply Now
              <span class="apply-now-arrow">↗</span>
            </a>

            <nav class="nav-links nav-links-profile">
              <div class="profile-menu" *ngIf="session.role() === 'CUSTOMER'">
                <button class="profile-trigger" type="button" aria-label="Profile menu" title="Profile menu">
                  <span class="profile-badge">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-3.34 0-10 1.68-10 5v1h20v-1c0-3.32-6.66-5-10-5Z"/>
                    </svg>
                  </span>
                </button>

                <div class="profile-dropdown">
                  <a routerLink="/customer/profile" routerLinkActive="active">Profile</a>
                  <a routerLink="/customer" routerLinkActive="active">About</a>
                  <a routerLink="/customer" fragment="terms">Terms and Conditions</a>
                  <a routerLink="/customer" fragment="help">Help Customer Care</a>
                  <button type="button" (click)="logout()">Logout</button>
                </div>
              </div>

              <div class="profile-menu" *ngIf="session.role() === 'OFFICER'">
                <button class="profile-trigger" type="button" aria-label="Profile menu" title="Profile menu">
                  <span class="profile-badge">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-3.34 0-10 1.68-10 5v1h20v-1c0-3.32-6.66-5-10-5Z"/>
                    </svg>
                  </span>
                </button>

                <div class="profile-dropdown">
                  <a routerLink="/officer" routerLinkActive="active">About</a>
                  <a routerLink="/officer" fragment="terms">Terms and Conditions</a>
                  <a routerLink="/officer" fragment="help">Help Customer Care</a>
                  <button type="button" (click)="logout()">Logout</button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main class="route-stage">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  protected readonly scrolled = signal(false);

  protected homeRoute(): string {
    return this.session.role() === 'OFFICER' ? '/officer' : '/customer';
  }

  protected logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }

  protected goToSection(event: Event, sectionId: string): void {
    event.preventDefault();

    void this.router.navigate([this.homeRoute()], { fragment: sectionId }).then(() => {
      setTimeout(() => this.viewportScroller.scrollToAnchor(sectionId), 0);
    });
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 12);
  }
}
