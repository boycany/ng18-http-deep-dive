import { Component, OnInit, inject, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private placesService = inject(PlacesService);

  ngOnInit(): void {
    this.isFetching.set(true);

    this.placesService.loadAvailablePlaces().subscribe({
      next: (response) => {
        console.log('response :>> ', response);
        console.log('response.body: >> ', response.body?.places);

        this.places.set(response.body?.places);
      },
      error: (error: Error) => {
        console.log('error :>> ', error.message);
        this.error.set(error.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });

    // this.httpClient
    //   .get<{ places: Place[] }>('http://localhost:3000/places', {
    //     observe: 'events',
    //   })
    //   .subscribe({
    //     next: (events) => {
    //       console.log('events :>> ', events);
    //     },
    //   });
  }

  onSelectPlace(selectedPlace: Place) {
    console.log('selectedPlace :>> ', selectedPlace);
    this.placesService.addPlaceToUserPlaces(selectedPlace).subscribe((resp) => {
      console.log('resp :>> ', resp);
    });
  }
}
