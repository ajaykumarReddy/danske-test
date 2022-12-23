import { Component, inject } from '@angular/core';
import { CarService } from './cars.service';

import { BehaviorSubject } from 'rxjs';
import { Car } from './types';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  action: 'add' | 'edit' = 'add';
  cars$ = new BehaviorSubject<Car[]>([]);

  constructor(private readonly carService: CarService) { }

  carsList$ = this.carService.cars$.subscribe(cars => {
    this.cars$.next(cars);
  });

  addCarForm = inject(FormBuilder).nonNullable.group<Car>({
    car_number: '',
    model: '',
    owner_name: '',
    id: ''
  })


  addCar(): void {
    if (this.addCarForm.valid) {
      this.carService.createCar(this.addCarForm.value).subscribe({
        next: (newCar) => {
          this.cars$.next([...this.cars$.value, newCar]);
          this.addCarForm.reset();
        },
        error: (err) => console.error('Hello error in creating car....', err)
      })
    }
  }

  editedCarItem(car: Car): void {
    this.action = 'edit';
    this.addCarForm.patchValue(car);
  }

  addUpdatecar(): void {
    this.action === 'add' ? this.addCar() : this.updatedCar();
  }

  updatedCar(): void {
    this.carService.updateCar(this.addCarForm.value).subscribe({
      next: (value) => {
        let updatedCar = this.cars$.value.find(carItem => carItem.id === value.id);
        if (updatedCar) {
          updatedCar.car_number = value.car_number;
          updatedCar.model = value.model;
          updatedCar.owner_name = value.owner_name;
          this.cars$.next(this.cars$.value);
          this.addCarForm.reset();
        }
      },
      error: err => console.error('error in updating the car', err)
    })
  }

  deleteCar(car: Car): void {
    if (confirm("Are you sure to delete " + car.car_number)) {
      this.carService.deleteCar(car).subscribe({
        next: () => {
          const cars = this.cars$.value.filter(carItem => carItem.id !== car.id);
          this.cars$.next(cars);
        },
        error: err => console.error('error in deleting the car', err)
      })
    }
  }

}
