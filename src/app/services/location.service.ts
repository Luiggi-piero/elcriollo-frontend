import { Injectable } from '@angular/core';
import { LatLngLiteral } from 'leaflet';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  getCurrentLocation(): Observable<LatLngLiteral> {
    return new Observable((observer) => {
      // verifica si el navegador permite la geolocalizacion
      if (!navigator.geolocation) return; // no permite

      // usa la api de geolocalizacion del navegador
      return navigator.geolocation.getCurrentPosition(
        (pos) => {
          // emite por el observable la latitud y longitud
          observer.next({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (error) => {
          observer.error(error)
        }
      )
    })
  }
}
