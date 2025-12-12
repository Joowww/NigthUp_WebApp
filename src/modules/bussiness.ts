// models/Business.ts

export interface ILocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  }
  
  export interface IBusiness {
    _id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    location: ILocation;
    events: string[];
    managers: string[];
    active: boolean;
    avatar?: string;
  }