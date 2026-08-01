import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Apuntamos a nuestro backend en NestJS
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Obtenemos todos los usuarios para validar el login en este nivel de desarrollo
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}