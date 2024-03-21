import * as NodeGeocoder from "node-geocoder";
import { CoordinateObjectProps } from "../types/users.type";
import { errorMessage } from "../utils/errors.handler.utils";

const geocoderOptions = {
  provider: "openstreetmap",
};
const geocoder = NodeGeocoder(geocoderOptions);

class GeoLib {
  public async getAddressFromCoordinates(
    coordinates: CoordinateObjectProps
  ): Promise<string> {
    const { latitude, longitude } = coordinates;
    try {
      const response = await geocoder.reverse({
        lon: longitude,
        lat: latitude,
      });
      if (response && !!response.length) {
        return response[0].formattedAddress;
      } else {
        throw new Error(errorMessage("not-found-address"));
      }
    } catch (error) {
      throw new Error(errorMessage("not-found-address"));
    }
  }

  public async getCoordinatesFromAddress(
    address: string
  ): Promise<CoordinateObjectProps> {
    try {
      const response = await geocoder.geocode(address);
      if (response && !!response.length) {
        return {
          latitude: response[0].latitude,
          longitude: response[0].longitude,
        };
      } else {
        throw new Error(errorMessage("not-found-address"));
      }
    } catch (error) {
      throw new Error(errorMessage("not-found-address"));
    }
  }
}

export default new GeoLib();
