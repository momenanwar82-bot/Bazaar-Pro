
import { Product, Category, Currency, Review } from './types';

export const CATEGORIES: Category[] = [
  'All',
  'Cars',
  'Phones',
  'Clothing',
  'Games',
  'Electronics',
  'Real Estate',
  'Furniture',
  'Others'
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar' },
  { code: 'SAR', symbol: 'SR', rate: 3.75, label: 'Saudi Riyal' },
  { code: 'AED', symbol: 'DH', rate: 3.67, label: 'UAE Dirham' },
  { code: 'EGP', symbol: 'E£', rate: 48.50, label: 'Egypt Pound' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro' },
];

export const COUNTRY_CODES = [
  { code: '20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
  { code: '966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '971', country: 'UAE', flag: '🇦🇪', iso: 'AE' },
  { code: '1', country: 'USA', flag: '🇺🇸', iso: 'US' },
  { code: '34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '212', country: 'Morocco', flag: '🇲🇦', iso: 'MA' },
  { code: '213', country: 'Algeria', flag: '🇩🇿', iso: 'DZ' },
  { code: '964', country: 'Iraq', flag: '🇮🇶', iso: 'IQ' },
  { code: '86', country: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '91', country: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
];

const createReview = (name: string, rating: number, comment: string): Review => ({
  id: Math.random().toString(36).substr(2, 9),
  userName: name,
  rating,
  comment,
  timestamp: new Date(Date.now() - Math.random() * 1000000000)
});

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Tesla Model S Plaid 2024',
    description: 'All-electric Tesla, amazing acceleration, Autopilot system, mint condition.',
    price: 89000,
    category: 'Cars',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    location: 'New York, USA',
    createdAt: new Date(),
    sellerName: 'James Smith',
    phoneNumber: '12125550199',
    rating: 4.9,
    reviewsCount: 3,
    reviews: [
      createReview("Michael R.", 5, "Unbelievable acceleration! Worth every penny."),
      createReview("Sarah K.", 5, "Car is exactly as described. Clean interior."),
      createReview("John D.", 4, "Great car, though delivery took a bit long.")
    ]
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max 512GB',
    description: 'iPhone 15 Pro Max, Black Titanium, unlocked for all global networks.',
    price: 1200,
    category: 'Phones',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    location: 'London, UK',
    createdAt: new Date(),
    sellerName: 'Oliver Williams',
    phoneNumber: '442071234567',
    rating: 4.8,
    reviewsCount: 2,
    reviews: [
      createReview("Emma W.", 5, "Perfect condition. Battery health is 100%."),
      createReview("David L.", 4, "Fast shipping. Original box included.")
    ]
  }
];
