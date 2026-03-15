import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplyLoanRequest, LoanApplication } from '../models/loan.models';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/loans`;

  applyLoanForCurrentUser(payload: ApplyLoanRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/apply', payload, { responseType: 'text' });
  }

  applyLoan(userId: number, payload: ApplyLoanRequest): Observable<string> {
    return this.http.post(this.baseUrl + `/apply/${userId}`, payload, { responseType: 'text' });
  }

  getCurrentUserLoans(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(this.baseUrl + '/me');
  }

  getUserLoans(userId: number): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(this.baseUrl + `/user/${userId}`);
  }
}
