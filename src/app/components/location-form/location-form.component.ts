import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LocationService } from '../../services/location.service';
import { Provincia } from '../../models/provincia.model';
import { Municipio } from '../../models/municipio.model';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls:   ['./location-form.component.css']
})
export class LocationFormComponent implements OnInit {
  locationForm: FormGroup;
  provincias: Provincia[] = [];
  municipios: Municipio[] = [];
  selectedProvincia: number = 0;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private locationService: LocationService
  ) {
    // Inicializamos el formulario con validadores
    this.locationForm = this.formBuilder.group({
      provincia: ['', Validators.required],
      municipio: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProvincias();
    
    // Nos suscribimos a los cambios en el campo provincia
    this.locationForm.get('provincia')?.valueChanges.subscribe(provinciaId => {
      if (provinciaId) {
        this.onProvinciaChange(+provinciaId); // El + convierte a número
      } else {
        this.municipios = [];
      }
    });
  }

  /**
   * Carga todas las provincias disponibles
   */
  loadProvincias(): void {
    this.loading = true;
    this.locationService.getProvincias()
      .subscribe({
        next: (data: Provincia[]) => {
          this.provincias = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar provincias', error);
          this.loading = false;
        }
      });
  }

  /**
   * Se ejecuta cuando cambia la provincia seleccionada
   * @param provinciaId ID de la provincia seleccionada
   */
  onProvinciaChange(provinciaId: number): void {
    if (provinciaId) {
      this.selectedProvincia = provinciaId;
      // Reseteamos el valor del municipio cuando cambia la provincia
      this.locationForm.get('municipio')?.setValue('');
      
      this.loading = true;
      this.locationService.getMunicipiosByProvincia(provinciaId)
        .subscribe({
          next: (data: Municipio[]) => {
            this.municipios = data;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al cargar municipios', error);
            this.loading = false;
          }
        });
    } else {
      this.municipios = [];
    }
  }

  /**
   * Envía el formulario con los datos seleccionados
   */
  onSubmit(): void {
    this.submitted = true;
    
    // Verificamos que se hayan seleccionado provincia y municipio
    if (this.locationForm.invalid) {
      return;
    }

    const formValues = this.locationForm.value;
    
    // Aquí puedes procesar los valores del formulario
    console.log('Formulario enviado:', {
      provincia: this.getProvinciaNombre(+formValues.provincia),
      municipio: this.getMunicipioNombre(+formValues.municipio)
    });
  }

  /**
   * Obtiene el nombre de la provincia según su ID
   */
  getProvinciaNombre(id: number): string {
    return this.provincias.find(p => p.id === id)?.nombre || '';
  }

  /**
   * Obtiene el nombre del municipio según su ID
   */
  getMunicipioNombre(id: number): string {
    return this.municipios.find(m => m.id === id)?.nombre || '';
  }

  /**
   * Obtiene el ID de la provincia seleccionada
   */
  get selectedProvinciaId(): number {
    const value = this.locationForm.get('provincia')?.value;
    return value ? +value : 0;
  }

  /**
   * Obtiene el ID del municipio seleccionado
   */
  get selectedMunicipioId(): number {
    const value = this.locationForm.get('municipio')?.value;
    return value ? +value : 0;
  }
}