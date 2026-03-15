import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CustomerProfile {
  fullName: string;
  phone: string;
  city: string;
  occupation: string;
  monthlyGoal: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customers/me`;

  getCurrentProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(this.baseUrl);
  }

  saveCurrentProfile(profile: CustomerProfile): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(this.baseUrl, profile);
  }
}
