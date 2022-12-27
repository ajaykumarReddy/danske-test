import { Injectable } from "@angular/core";
import { CarService } from "./cars.service";
import {
    ComponentStore,
    OnStateInit,
    tapResponse,
} from '@ngrx/component-store';
import { pipe, switchMap, tap } from 'rxjs';
import { Car } from "./types";

@Injectable()
export class AppStore extends ComponentStore<AppState>
    implements OnStateInit {


    readonly cars$ = this.select((state) => state.cars);
    readonly loading$ = this.select((state) => state.loading);
    readonly error$ = this.select((state) => state.error);

    readonly vm$ = this.select(
        {
            cars: this.cars$,
            loading: this.loading$,
            error: this.error$,
        },
        { debounce: true }
    );

    constructor(private carService: CarService) {
        super({ cars: [], loading: false });
    }

    private readonly addCarState = this.updater((state, car: Car) => ({
        error: undefined,
        loading: false,
        cars: [...state.cars, car],
    }));


    private readonly updateCars = this.updater((state, car: Car) => ({
        error: undefined,
        loading: false,
        cars: state.cars.map((t) => (t.id === car.id ? { ...car } : t)),
    }));

    private readonly deleteCarState = this.updater((state, carId: string) => ({
        error: undefined,
        loading: false,
        cars: state.cars.filter((car) => car.id !== carId),
    }));


    readonly fetchCar = this.effect<void>(
        pipe(
            tap(() => this.patchState({ loading: true })),
            switchMap(() =>
                this.carService.cars$.pipe(
                    tapResponse(
                        (cars) => this.patchState({ cars, loading: false }),
                        (error: Error) =>
                            this.patchState({ error: error.message, loading: false })
                    )
                )
            )
        )
    );

    readonly updateCar = this.effect<Car>(
        pipe(
            tap(() => this.patchState({ loading: true })),
            switchMap((car) => this.carService.updateCar(car).pipe(
                tapResponse(
                    (updatedCar) => this.updateCars(updatedCar),
                    (error: Error) =>
                        this.patchState({ error: error.message, loading: false })
                )
            )
            )
        )
    );

    readonly addCar = this.effect<Car>(
        pipe(
            tap(() => this.patchState({ loading: true })),
            switchMap((car) => this.carService.createCar(car).pipe(
                tapResponse(
                    (newCar) => this.addCarState(newCar),
                    (error: Error) =>
                        this.patchState({ error: error.message, loading: false })
                ))
            )
        )
    );

    readonly deleteTodo = this.effect<Car>(
        pipe(
            tap(() => this.patchState({ loading: true })),
            switchMap((car) =>
                this.carService.deleteCar(car).pipe(
                    tapResponse(
                        () => this.deleteCarState(car.id),
                        (error: Error) =>
                            this.patchState({ error: error.message, loading: false })
                    )
                )
            )
        )
    );

    ngrxOnStateInit = () => this.fetchCar();

}

interface AppState {
    cars: Car[];
    loading: boolean;
    error?: string;
}