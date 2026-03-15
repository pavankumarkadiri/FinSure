import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  register(payload: RegisterRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/register', payload, { responseType: 'text' });
  }

  login(payload: LoginRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/login', payload, { responseType: 'text' });
  }
}
