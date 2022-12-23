import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Car } from './types';

// const httpOptions = {
//   headers: new HttpHeaders({
//     'Content-Type': 'application/json',
//   })
// };

@Injectable({
  providedIn: 'root'
})
export class CarService {

  API = 'http://localhost:3000';

  /** GET cars from the server */
  cars$ = this.httpClient.get<Car[]>(`${this.API}/cars`)

  constructor(private httpClient: HttpClient) { }

  createCar(payload: Partial<Car>): Observable<Car> {
    return this.httpClient.post<Car>(`${this.API}/cars`, payload);
  }

  updateCar(payload: Partial<Car>): Observable<Car> {
    return this.httpClient.put<Car>(`${this.API}/cars/${payload.id}`, payload);
  }

  deleteCar(car: Car): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/cars/${car.id}`);
  }

}
