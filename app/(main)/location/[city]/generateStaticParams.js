// // app/location/[city]/generateStaticParams.js
// import locationsData from "../../../../data/locations.json";

// export async function generateStaticParams() {
//   return locationsData.map((location) => ({
//     city: location.id,
//   }));
// } 
// app/location/[city]/generateStaticParams.js

import { getApiUrl } from '@/lib/utils';

async function getLocations() {
  try {
    const apiUrl = getApiUrl('/api/locations');
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // 1 hour cache
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating static params:', error);
    }
    return [];
  }
}

export async function generateStaticParams() {
  const locationsData = await getLocations();
  
  return locationsData.map((location) => ({
    city: location.id,
  }));
}

export const dynamicParams = true; // Allow new locations without rebuild