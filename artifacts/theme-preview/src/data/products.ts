export type Product = {
  id: number;
  title: string;
  vendor: string;
  mpn: string;
  priceAura: number;
  stockStatus: 'til' | 'vaentanlegt' | 'uppselt';
  stockCount?: number;
};

export const products: Product[] = [
  { id: 1, title: 'Siemens 3NA3820', vendor: 'Siemens', mpn: '3NA3820', priceAura: 3490000, stockStatus: 'til' },
  { id: 2, title: 'ABB S200 B16', vendor: 'ABB', mpn: 'S200B16', priceAura: 189000, stockStatus: 'til' },
  { id: 3, title: 'Legrand 41571', vendor: 'Legrand', mpn: '41571', priceAura: 2890000, stockStatus: 'vaentanlegt', stockCount: 3 },
  { id: 4, title: 'Schneider ACTI9 C32', vendor: 'Schneider', mpn: 'ACTI9C32', priceAura: 445000, stockStatus: 'vaentanlegt' },
  { id: 5, title: 'Wago 222-413', vendor: 'Wago', mpn: '222413', priceAura: 89000, stockStatus: 'til' },
  { id: 6, title: 'Phoenix Contact 3002750', vendor: 'Phoenix', mpn: '3002750', priceAura: 567000, stockStatus: 'til' },
  { id: 7, title: 'OBO Bettermann 2099', vendor: 'OBO', mpn: '2099', priceAura: 134000, stockStatus: 'uppselt' },
  { id: 8, title: 'Hager MFN132', vendor: 'Hager', mpn: 'MFN132', priceAura: 1245000, stockStatus: 'til' },
];
