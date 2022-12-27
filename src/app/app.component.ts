import { Component, inject } from '@angular/core';
import { CarService } from './cars.service';

import { BehaviorSubject, map, Subject, takeUntil, tap } from 'rxjs';
import { Car } from './types';
import { FormBuilder, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CAR_COLS, CAR_NUMBER_PATTERN } from './shared/common';
import { AppStore } from './app.store';
import { provideComponentStore } from '@ngrx/component-store';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  providers: [provideComponentStore(AppStore)],
})
export class AppComponent {

  vm$ = this.appStore.vm$.pipe(
    tap(res => this.cars = res.cars)
  );
  cars!: Car[];

  update(car: Car) {
    this.appStore.updateCar(car);
  }

  delete(car: Car) {
    this.appStore.deleteTodo(car);
  }

  add(car: Car) {
    this.appStore.addCar(car);
  }

  action: 'add' | 'update' = 'add';

  cols = CAR_COLS;


  constructor(private readonly carService: CarService, private appStore: AppStore) { }


  addCarForm = inject(FormBuilder).nonNullable.group({
    car_number: ['', [Validators.required,
    Validators.pattern(CAR_NUMBER_PATTERN),
    ], this.carNumnerValidator.bind(this)],
    model: ['', Validators.required],
    owner_name: ['', Validators.required],
    id: ''
  });

  editedCarItem(car: Car): void {
    this.action = 'update';
    this.addCarForm.patchValue(car);
  }

  addUpdatecar(): void {
    this.action === 'add' ? this.add(this.addCarForm.value as Car) : this.update(this.addCarForm.value as Car);
    this.addCarForm.reset();
    this.action = 'add';
  }

  get f(): { [key: string]: AbstractControl } {
    return this.addCarForm.controls;
  }

  carNumnerValidator(Control: AbstractControl) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.cars.find(car => car.car_number === Control.value)) {
          resolve({ carNumberNotAvailable: true });
        } else {
          resolve(null);
        }
      }, 1000);
    });
  }

}
