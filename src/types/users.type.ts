export type CoordinateObjectProps = { latitude: number; longitude: number };

export type UserProps = {
  name: string;
  email: string;
  address?: string;
  coordinates?: CoordinateObjectProps;
};
