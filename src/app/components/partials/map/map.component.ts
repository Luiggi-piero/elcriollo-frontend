import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { LatLng, LatLngExpression, LatLngTuple, LeafletMouseEvent, Map, Marker, icon, map, marker, tileLayer } from 'leaflet';
import { LocationService } from 'src/app/services/location.service';
import { Order } from 'src/app/shared/models/Order';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnChanges {

  @Input()
  order!: Order;
  @Input()
  readonly = false;

  private readonly MARKER_ZOOM_LEVEL = 16;
  private readonly MARKER_ICON = icon({
    iconUrl: 'https://res.cloudinary.com/foodmine/image/upload/v1638842791/map/marker_kbua9q.png',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
  })
  private readonly DEFAULT_LATLNG: LatLngTuple = [13.75, 21.62];

  /**
   * {static: true}: Esta opción se refiere al momento en que se resuelve la referencia. 
   * Cuando se establece en true, la referencia se resuelve antes de que se inicialice el 
   * componente (en el ciclo de vida ngOnInit). Esto significa que puedes acceder a mapRef en el método ngOnInit. 
   * Si se establece en false, la referencia se resuelve después de que se inicialice el 
   * componente (en el ciclo de vida ngAfterViewInit)
   */
  @ViewChild('map', { static: true })
  mapRef!: ElementRef;

  map!: Map;
  currentMarker!: Marker;

  constructor(private locationService: LocationService) { }

  ngOnChanges(): void {
    // Evita inicializar si ya tiene valor
    if(!this.order) return;

    this.initializeMap();

    if(this.readonly && this.addressLatLng) {
      this.showLocationOnReadonlyMode();
    }
  }

  // Configurar el mapa para solo lectura
  showLocationOnReadonlyMode() {
    const m = this.map;
    this.setMarker(this.addressLatLng);
    m.setView(this.addressLatLng, this.MARKER_ZOOM_LEVEL);
    m.dragging.disable();
    m.touchZoom.disable();
    m.doubleClickZoom.disable();
    m.scrollWheelZoom.disable();
    m.boxZoom.disable();
    m.keyboard.disable();
    m.off('click');
    m.tap?.disable();
    this.currentMarker.dragging?.disable();
  }

  initializeMap() {
    if (this.map) return;

    /**
     * attributionControl: false desactiva el control de atribución (es decir, la información sobre la fuente de datos del mapa).
     * 
     * .setView(this.DEFAULT_LATLNG, 1): Establece la vista del mapa en una ubicación específica. this.DEFAULT_LATLNG
     *  representa las coordenadas (latitud y longitud) del centro del mapa, y 1 es el nivel de zoom inicial.
     * 
     * tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'): Agrega una capa de mosaico al mapa. En este caso, se utiliza 
     * la fuente de mosaicos de OpenStreetMap (OSM) con la URL proporcionada.
     * 
     * .addTo(this.map): Agrega la capa de mosaico al mapa creado anteriormente.
     */
    this.map = map(this.mapRef.nativeElement, {
      attributionControl: false
    }).setView(this.DEFAULT_LATLNG, 1);

    tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(this.map);

    // Agregar evento click para manejar la ubicacion
    this.map.on('click', (e: LeafletMouseEvent) => {
      this.setMarker(e.latlng);
    })
  }


  findMyLocation() {
    this.locationService.getCurrentLocation().subscribe({
      next: (latlgn) => {
        // console.log(latlgn);
        this.map.setView(latlgn, this.MARKER_ZOOM_LEVEL);
        this.setMarker(latlgn);
      }
    })
  }

  // Cambiar la marca (ubicacion)
  setMarker(latlng: LatLngExpression) {

    this.addressLatLng = latlng as LatLng;

    if (this.currentMarker) {
      this.currentMarker.setLatLng(latlng);
      return;
    }

    this.currentMarker = marker(latlng, {
      draggable: true,
      icon: this.MARKER_ICON,
    }).addTo(this.map);

    // Al arrastrar el marcador(icono) rojo tambien cambiaran las coordenadas
    this.currentMarker.on('dragend', () => {
      this.addressLatLng = this.currentMarker.getLatLng();
    })
  }

  // Modifica addressLatLng del objeto order, para mantenerlo actualizado mientras se manipula el mapa
  set addressLatLng(latlng: LatLng) {

    /**
     * verifica que lat sea un número antes de realizar operaciones numéricas en él. 
     * Si lat no es un número válido o no tiene el método toFixed, 
     * la función sale temprano sin realizar más operaciones.
     */
    if(!latlng.lat.toFixed) return;

    latlng.lat = parseFloat(latlng.lat.toFixed(8));
    latlng.lng = parseFloat(latlng.lng.toFixed(8));
    this.order.addressLatLng = latlng;
    // console.log(this.order.addressLatLng);
  }

  get addressLatLng() {
    return this.order.addressLatLng!;
  }
}
