import {
  pre,
  getModelForClass,
  Prop,
  Ref,
  modelOptions,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import * as mongoose from "mongoose";
import GeoLib from "../apis/nodeGeocoder.api";

import ObjectId = mongoose.Types.ObjectId;
import { CoordinateArrayProps } from "../types/regions.type";

class Base extends TimeStamps {
  @Prop({ required: true, default: () => new ObjectId().toString() })
  _id: string;
}

@pre<User>("validate", async function (next) {
  const user = this as Omit<any, keyof User> & User;

  if (!user.address && user.coordinates) {
    user.address = await GeoLib.getAddressFromCoordinates(user.coordinates);
  } else if (!user.coordinates && user.address) {
    const { latitude, longitude } = await GeoLib.getCoordinatesFromAddress(
      user.address
    );
    user.coordinates = { longitude, latitude };
  }

  next();
})
export class User extends Base {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  coordinates: { latitude: number; longitude: number };

  @Prop({ required: true, default: [], ref: () => Region, type: () => String })
  regions: Ref<Region>[];
}

@pre<Region>("save", async function (next) {
  const region = this as Omit<any, keyof Region> & Region;

  if (!region._id) {
    region._id = new ObjectId().toString();
  }

  if (!region.name || !region.user) {
    return;
  }

  if (region.isNew) {
    const user = await UserModel.findOne({ _id: region.user });
    if (user) {
      user.regions.push(region._id);
      await user.save({ session: region.$session() });
    }
  }

  next(region.validateSync());
})
@modelOptions({ schemaOptions: { validateBeforeSave: false } })
export class Region extends Base {
  @Prop({ required: true, auto: true })
  _id: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  geometry!: {
    type: string;
    coordinates: CoordinateArrayProps[][];
  };

  @Prop({ ref: () => User, required: true, type: () => String })
  user: Ref<User>;
}

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);

RegionModel.createCollection().then(() => {
  RegionModel.collection.createIndex({ geometry: "2dsphere" });
});
