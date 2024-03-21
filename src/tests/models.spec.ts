import * as mongoose from "mongoose";
import * as sinon from "sinon";
import { faker } from "@faker-js/faker";
import { expect } from "chai";
import GeoLib from "../apis/nodeGeocoder.api";
import { Region, RegionModel, User, UserModel } from "../models/model.model";
import { MOCK_DATA_REGION } from "./Mocks/regions.mock";
import { CoordinateArrayProps } from "../types/regions.type";

describe("Models", () => {
  let user: User;
  let session: mongoose.ClientSession;
  let geoLibStub: Partial<typeof GeoLib> = {};

  before(async () => {
    geoLibStub.getAddressFromCoordinates = sinon
      .stub(GeoLib, "getAddressFromCoordinates")
      .resolves(faker.location.streetAddress({ useFullAddress: true }));
    geoLibStub.getCoordinatesFromAddress = sinon
      .stub(GeoLib, "getCoordinatesFromAddress")
      .resolves({
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
      });

    session = await mongoose.startSession();
    user = await UserModel.create({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress({ useFullAddress: true }),
    });
  });

  after(() => {
    sinon.restore();
    session.endSession();
  });

  beforeEach(() => {
    session.startTransaction();
  });

  afterEach(() => {
    session.commitTransaction();
  });

  describe("UserModel", () => {
    it("should create a user", async () => {
      const createdUser = await UserModel.findOne({ _id: user._id });
      expect(createdUser).to.exist;
    });

    it("should update a user", async () => {
      const newName = faker.person.firstName();
      await UserModel.updateOne({ _id: user._id }, { name: newName });
      const updatedUser = await UserModel.findOne({ _id: user._id });
      expect(updatedUser.name).to.equal(newName);
    });

    it("should find a user", async () => {
      const foundUser = await UserModel.findOne({ _id: user._id });
      expect(foundUser).to.exist;
    });

    it("should delete a user", async () => {
      await UserModel.deleteOne({ _id: user._id });
      const deletedUser = await UserModel.findOne({ _id: user._id });
      expect(deletedUser).to.not.exist;
    });
  });

  describe("RegionModel", () => {
    it("should create a region", async () => {
      const regionData: Omit<Region, "_id"> = {
        user: user._id,
        name: faker.person.fullName(),
        geometry: {
          type: "Polygon",
          coordinates: [
            [...MOCK_DATA_REGION.sequoia.coordinates] as CoordinateArrayProps[],
          ],
        },
      };

      const [region] = await RegionModel.create([regionData]);

      expect(region).to.deep.include(regionData);
    });

    it("should update a region", async () => {
      const newName = faker.person.fullName();
      const regionToUpdate = await RegionModel.findOne({ user: user._id });
      await RegionModel.updateOne(
        { _id: regionToUpdate._id },
        { name: newName }
      );
      const updatedRegion = await RegionModel.findOne({
        _id: regionToUpdate._id,
      });
      expect(updatedRegion.name).to.equal(newName);
    });

    it("should find a region", async () => {
      const foundRegion = await RegionModel.findOne({ user: user._id });
      expect(foundRegion).to.exist;
    });

    it("should delete a region", async () => {
      const regionToDelete = await RegionModel.findOne({ user: user._id });
      await RegionModel.deleteOne({ _id: regionToDelete._id });
      const deletedRegion = await RegionModel.findOne({
        _id: regionToDelete._id,
      });
      expect(deletedRegion).to.not.exist;
    });
  });
});
