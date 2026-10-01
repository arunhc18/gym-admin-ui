import { Injectable } from '@angular/core';

import { LocationOption } from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly locations: LocationOption[] = [
    {
      locationId: 1,
      tenantId: 1,
      locationName: 'Main Branch',
      city: 'Bengaluru',
      address: 'MG Road'
    },
    {
      locationId: 2,
      tenantId: 1,
      locationName: 'Indiranagar',
      city: 'Bengaluru',
      address: '100 Feet Road'
    },
    {
      locationId: 3,
      tenantId: 1,
      locationName: 'HSR Layout',
      city: 'Bengaluru',
      address: 'Sector 7'
    },
    {
      locationId: 4,
      tenantId: 1,
      locationName: 'Koramangala',
      city: 'Bengaluru',
      address: '5th Block'
    }
  ];

  getLocations(tenantId: number): LocationOption[] {
    return this.locations
      .filter(item => item.tenantId === tenantId)
      .map(item => ({ ...item }));
  }

  getLocationById(locationId: number): LocationOption | undefined {
    return this.locations.find(item => item.locationId === locationId);
  }
}
