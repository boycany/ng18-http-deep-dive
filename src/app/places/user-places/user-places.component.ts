import { Component, OnInit, inject, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { Subscription, catchError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  private placesService = inject(PlacesService);

  places = this.placesService.loadedUserPlaces;
  isFetching = signal(false);
  error = signal('');

  ngOnInit() {
    this.isFetching.set(true);

    this.placesService.loadUserPlaces().subscribe({
      // next: (response) => {
      //   console.log('response :>> ', response);
      //   this.places.set(response.body?.places);
      // },
      error: (error) => {
        console.log('error :>> ', error);
        this.error.set(error.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });
  }

  onRemovePlace(place: Place) {
    if (window.confirm('Are you sure to remove this place?')) {
      console.log('DELETE place :>> ', place);

      this.placesService.removeUserPlace(place).subscribe({
        next: (response) => {
          console.log('response :>> ', response);
        },
      });
    }
  }
}
