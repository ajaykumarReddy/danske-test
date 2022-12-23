import { Component, inject } from '@angular/core';
import { CarService } from './cars.service';

import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Car } from './types';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  action: 'add' | 'update' = 'add';
  cars$ = new BehaviorSubject<Car[]>([]);

  cols = [{ displayName: 'Id', property: 'id' },
  { displayName: 'Owner Name', property: 'owner_name' },
  { displayName: 'Car Number', property: 'car_number' },
  { displayName: 'Car Model', property: 'model' }];

  private destroy$ = new Subject();

  constructor(private readonly carService: CarService) { }

  carsList$ = this.carService.cars$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(cars => {
    this.cars$.next(cars);
  });

  addCarForm = inject(FormBuilder).nonNullable.group({
    car_number: ['', [Validators.required,
    Validators.pattern('^[A-Z]{2}[-][0-9]{1,2}[-][A-Z]{1,2}[-][0-9]{3,4}$'),
    ], this.carNumnerValidator.bind(this)],
    model: ['', Validators.required],
    owner_name: ['', Validators.required],
    id: ''
  });


  addCar(): void {
    if (this.addCarForm.valid) {
      this.carService.createCar(this.addCarForm.value).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (newCar) => {
          this.cars$.next([...this.cars$.value, newCar]);
          this.addCarForm.reset();
        },
        error: (err) => console.error('Hello error in creating car....', err)
      })
    }
  }

  editedCarItem(car: Car): void {
    this.action = 'update';
    this.addCarForm.patchValue(car);
  }

  addUpdatecar(): void {
    this.action === 'add' ? this.addCar() : this.updatedCar();
  }

  updatedCar(): void {
    this.carService.updateCar(this.addCarForm.value).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (value) => {
        let updatedCar = this.cars$.value.find(carItem => carItem.id === value.id);
        if (updatedCar) {
          updatedCar.car_number = value.car_number;
          updatedCar.model = value.model;
          updatedCar.owner_name = value.owner_name;
          this.cars$.next([...this.cars$.value]);
          this.addCarForm.reset();
          this.action = 'add';
        }
      },
      error: err => console.error('error in updating the car', err)
    })
  }

  deleteCar(car: Car): void {
    if (confirm("Are you sure to delete " + car.car_number)) {
      this.carService.deleteCar(car).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          const cars = this.cars$.value.filter(carItem => carItem.id !== car.id);
          this.cars$.next(cars);
        },
        error: err => console.error('error in deleting the car', err)
      })
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.addCarForm.controls;
  }

  carNumnerValidator(Control: AbstractControl) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.cars$.value.find(car => car.car_number === Control.value)) {
          resolve({ carNumberNotAvailable: true });
        } else {
          resolve(null);
        }
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

}
