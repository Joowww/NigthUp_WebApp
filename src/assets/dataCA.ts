export const cities = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia",
  "Palma", "Las Palmas de Gran Canaria", "Bilbao", "Alicante", "Córdoba", "Valladolid",
  "Vigo", "Gijón", "L'Hospitalet de Llobregat", "Vitoria-Gasteiz", "A Coruña",
  "Elche", "Granada", "Terrassa", "Badalona", "Oviedo", "Sabadell", "Cartagena",
  "Jerez de la Frontera", "Móstoles", "Santa Cruz de Tenerife", "Pamplona", "Almería",
  "Alcalá de Henares", "Fuenlabrada", "Leganés", "San Sebastián", "Getafe",
  "Burgos", "Albacete", "Castellón de la Plana", "Santander", "Alcorcón",
  "San Cristóbal de La Laguna", "Logroño", "Badajoz", "Marbella", "Salamanca",
  "Huelva", "Lleida", "Tarragona", "Dos Hermanas", "Parla", "Mataró", "León",
  "Torrejón de Ardoz", "Gerona", "Algeciras", "Santa Coloma de Gramenet", "Cádiz",
  "Alcobendas", "Reus", "Ourense", "Telde", "Barakaldo", "Lugo", "Santiago de Compostela"
];

// Helper to get coordinates for a city (simplified for major ones)
export const getCityCoordinates = (city: string): [number, number] | null => {
  const cityCoords: Record<string, [number, number]> = {
    "madrid": [-3.7038, 40.4168],
    "barcelona": [2.1734, 41.3851],
    "valencia": [-0.3763, 39.4699],
    "sevilla": [-5.9845, 37.3891],
    "zaragoza": [-0.8814, 41.6488],
    "málaga": [-4.4203, 36.7212],
    "bilbao": [-2.9350, 43.2630],
    // Add more if needed or allow default centering
  };

  const normalizedCity = city.toLowerCase();
  return cityCoords[normalizedCity] || null;
};