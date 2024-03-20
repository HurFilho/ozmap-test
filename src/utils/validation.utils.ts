import * as GeoJSONValidation from "geojson-validation";
import { CoordinateArrayProps } from "../types/regions.type";

export const validatePolygon = (polygon: {
  type: string;
  coordinates: CoordinateArrayProps[][][];
}): boolean => {
  return (
    GeoJSONValidation.isPolygon(polygon) && GeoJSONValidation.valid(polygon)
  );
};
