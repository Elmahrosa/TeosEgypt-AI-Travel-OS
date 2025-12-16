export interface Accommodation {
  name: string;
  rating: string;
  priceLevel: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  location: string;
  estimatedCost: string;
  accommodation?: Accommodation;
}

export interface Itinerary {
  tripTitle: string;
  summary: string;
  days: ItineraryDay[];
  totalEstimatedCost?: string;
  currency?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  groundingChunks?: any[];
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'History' | 'Leisure' | 'Adventure';
  rating: number;
}

export type TripPace = 'Relaxed' | 'Moderate' | 'Fast-paced';

export interface UserPreferences {
  selectedCities: string[];
  duration: string;
  interests: string;
  budget: string;
  pace: TripPace;
  needsAccessibility: boolean;
  useTeosLoyalty: boolean;
}