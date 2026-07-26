import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Apuntamos a nuestro backend en NestJS
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // Obtenemos todos los usuarios para validar el login en este nivel de desarrollo
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}