export interface Event {
  _id: string;
  name: string;
  schedule: Date;
  location: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
  category: string;
  capacity: number;
  price: number;
  participants: string[];
  city?: string;
  imageUrl?: string; // Added imageUrl property

}



