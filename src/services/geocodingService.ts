import axios from 'axios';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getNearestPopularLocation = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: GOOGLE_API_KEY,
          result_type: 'locality|sublocality|administrative_area_level_2|administrative_area_level_1', // Limit results to popular locations
          location_type: 'ROOFTOP|GEOMETRIC_CENTER'
        }
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      // Look for specific types of address components
      const components = response.data.results[0].address_components;

      // Filter for the most relevant location types
      const locationTypes = ['locality', 'sublocality', 'administrative_area_level_2', 'administrative_area_level_1'];
      const location = components.find((component: any) => locationTypes.some(type => component.types.includes(type)));

      if (location) {
        return location.long_name; // Return the most relevant location name
      } else {
        console.warn('No popular location found for provided coordinates.');
        return null;
      }
    } else {
      console.warn('No address found for provided coordinates.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching address from coordinates:', error);
    return null;
  }
};
