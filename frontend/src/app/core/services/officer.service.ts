import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanApplication } from '../models/loan.models';

@Injectable({ providedIn: 'root' })
export class OfficerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/officer/loans`;

  getPendingLoans(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(this.baseUrl + '/pending');
  }

  approveLoan(loanId: number): Observable<string> {
    return this.http.put(this.baseUrl + `/${loanId}/approve`, null, { responseType: 'text' });
  }

  rejectLoan(loanId: number): Observable<string> {
    return this.http.put(this.baseUrl + `/${loanId}/reject`, null, { responseType: 'text' });
  }
}
