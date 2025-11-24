// // app/location/[city]/generateStaticParams.js
// import locationsData from "../../../../data/locations.json";

// export async function generateStaticParams() {
//   return locationsData.map((location) => ({
//     city: location.id,
//   }));
// } 
// app/location/[city]/generateStaticParams.js

async function getLocations() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/locations`, {
      next: { revalidate: 3600 } // 1 hour cache
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating static params:', error);
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