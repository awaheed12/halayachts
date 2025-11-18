// app/location/[city]/generateStaticParams.js
import locationsData from "../../../../data/locations.json";

export async function generateStaticParams() {
  return locationsData.map((location) => ({
    city: location.id,
  }));
}