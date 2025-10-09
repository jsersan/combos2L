import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Provincia } from '../models/provincia.model';
import { Municipio } from '../models/municipio.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private provinciasUrl = 'assets/data/provincias.json';
  private municipiosUrl = 'assets/data/municipios.json';
  
  // Cache para evitar múltiples peticiones
  private provinciasCache: Provincia[] = [];
  private municipiosCache: Municipio[] = [];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las provincias
   */
  getProvincias(): Observable<Provincia[]> {
    // Si ya tenemos datos en caché, los devolvemos directamente
    if (this.provinciasCache.length > 0) {
      return of(this.provinciasCache);
    }

    return this.http.get<Provincia[]>(this.provinciasUrl)
      .pipe(
        map(provincias => {
          this.provinciasCache = provincias;
          return provincias;
        }),
        catchError(this.handleError<Provincia[]>('getProvincias', []))
      );
  }

  /**
   * Obtiene todos los municipios
   */
  getMunicipios(): Observable<Municipio[]> {
    // Si ya tenemos datos en caché, los devolvemos directamente
    if (this.municipiosCache.length > 0) {
      return of(this.municipiosCache);
    }

    return this.http.get<Municipio[]>(this.municipiosUrl)
      .pipe(
        map(municipios => {
          this.municipiosCache = municipios;
          return municipios;
        }),
        catchError(this.handleError<Municipio[]>('getMunicipios', []))
      );
  }

  /**
   * Obtiene los municipios de una provincia específica
   * @param provinciaId ID de la provincia
   */
  getMunicipiosByProvincia(provinciaId: number): Observable<Municipio[]> {
    return this.getMunicipios()
      .pipe(
        map(municipios => municipios.filter(municipio => municipio.provincia_id === provinciaId))
      );
  }

  /**
   * Manejo de errores HTTP
   * @param operation Nombre de la operación que falló
   * @param result Valor opcional a devolver como observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló: ${error.message}`);
      
      // Devolvemos un resultado vacío para seguir ejecutando la aplicación
      return of(result as T);
    };
  }
}