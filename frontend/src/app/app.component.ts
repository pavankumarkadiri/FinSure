import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
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

        <div class="topbar-center" *ngIf="session.isAuthenticated() && !authPage()">
          <nav class="nav-links nav-links-main">
            <a href="" (click)="goToSection($event, 'home')">Home</a>
            <a href="" (click)="goToSection($event, 'about')">About</a>
            <a href="" (click)="goToSection($event, 'loans')">Loans</a>
            <a href="" (click)="goToSection($event, 'faq')">FAQ</a>
            <a href="" (click)="goToSection($event, 'contact')">Contact</a>
          </nav>
        </div>

        <div class="topbar-right" *ngIf="session.isAuthenticated() && !authPage()">
          <div class="shell-meta">
            <a
              *ngIf="session.role() === 'CUSTOMER'"
              class="apply-now-link"
              [routerLink]="homeRoute()"
              fragment="apply"
            >
              Apply Now
              <span class="apply-now-arrow">&#8594;</span>
            </a>

            <nav class="nav-links nav-links-profile">
              <div class="profile-menu">
                <button
                  *ngIf="session.role() === 'CUSTOMER'"
                  class="profile-action"
                  type="button"
                  title="Profile"
                  [routerLink]="'/customer/profile'"
                >
                  Profile
                </button>

                <button
                  class="logout-action"
                  type="button"
                  title="Logout"
                  (click)="logout()"
                >
                  Logout
                </button>
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
  protected readonly authPage = signal(this.isAuthUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.authPage.set(this.isAuthUrl(event.urlAfterRedirects)));
  }

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

  private isAuthUrl(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/register');
  }
}
