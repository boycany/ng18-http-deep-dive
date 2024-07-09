import { Injectable, inject, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places');
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places').pipe(
      tap({
        next: (userPlaces) => {
          this.userPlaces.set(userPlaces.body?.places || []);
        },
      }),
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();
    console.log('prevPlaces :>> ', prevPlaces);

    if (prevPlaces.some((p) => p.id === place.id)) {
      //if the place is already in the userPlaces,
      //don't send the http request and return an empty observable
      this.errorService.showError('Place already added.');
      return of([]);
    }
    //optimistic update
    this.userPlaces.set([...prevPlaces, place]);

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((error) => {
          console.log('error :>> ', error);
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Failed to store selected place.');
          throw new Error('Failed to store selected place.');
        }),
      );
  }

  removeUserPlace(place: Place) {
    // const targetIndex = this.userPlaces().findIndex((p) => p.id === place.id);
    const prevPlaces = this.userPlaces();

    if (prevPlaces.some((p) => p.id === place.id)) {
      //optimistic update
      this.userPlaces.set(prevPlaces.filter((p) => p.id !== place.id));
    } else {
      this.errorService.showError('Place not found.');
      // return of(prevPlaces);
      return of({ userPlaces: prevPlaces });
    }

    return this.httpClient
      .delete<{
        userPlaces: Place[];
      }>(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError((error) => {
          console.log('error :>> ', error);
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Failed to remove the selected place.');
          throw new Error('Failed to remove the selected place.');
        }),
      );
  }

  private fetchPlaces(url: string, errorMessage?: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url, {
        observe: 'response',
      })
      .pipe(
        catchError((error, obs) => {
          console.log('error  :>> ', error);
          console.log('obs :>> ', obs);
          // return throwError(() => new Error('Something went worng...'));

          let message: string;
          if (errorMessage) {
            message = errorMessage;
          } else if (error.status === 500) {
            message = 'Internal Server Error...';
          } else {
            message = 'Unknown Error';
          }

          throw new Error(message);
        }),
      );
  }
}
