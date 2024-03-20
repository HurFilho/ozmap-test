import * as supertest from "supertest";
import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { Routes } from "../constants/routes.constant";
import { StatusCodes } from "../constants/statusCodes.constant";
import server from "../app";
import { RegionsConstants } from "../constants/regions.constant";
import { errorMessage } from "../utils/errors.handler.utils";
import { MOCK_DATA_REGION } from "./Mocks/regions.mock";
import { MOCK_DATA_USER } from "./Mocks/users.mock";

describe("Regions routes", () => {
  let userIds: string[] = [];
  let addedRegions = [];

  before(async () => {
    const populateUsers = async () => {
      for (let i = 0; i < 3; i++) {
        const userData = {
          name: faker.person.firstName(),
          email: faker.internet.email(),
          coordinates: MOCK_DATA_USER.validCoordinates,
        };

        const response = await supertest(server)
          .post(Routes.Users)
          .send(userData);

        userIds.push(response.body._id);
      }
    };
    await populateUsers();

    const populateRegions = async () => {
      const regions = [
        { ...MOCK_DATA_REGION.banff, userId: userIds[0] },
        { ...MOCK_DATA_REGION.grandCanyon, userId: userIds[1] },
        { ...MOCK_DATA_REGION.sequoia, userId: userIds[2] },
      ];

      for (const region of regions) {
        const response = await supertest(server)
          .post(Routes.Regions)
          .send(region);

        addedRegions.push(response.body);
      }
    };

    await populateRegions();
  });

  after(async () => {
    const deleteUsers = async () => {
      userIds.forEach(async (userId) => {
        await supertest(server).delete(`${Routes.Users}/${userId}`);
      });
    };
    const deleteRegions = async () => {
      addedRegions.forEach(async ({ _id: regionId }) => {
        await supertest(server).delete(`${Routes.Regions}/${regionId}`);
      });
    };

    await Promise.all([deleteRegions(), deleteUsers()]);
  });

  describe("Regions creation", () => {
    it("should create a new region", async () => {
      const newRegion = { ...MOCK_DATA_REGION.chapada, userId: userIds[0] };

      const response = await supertest(server)
        .post(Routes.Regions)
        .send(newRegion);

      expect(response.status).to.equal(StatusCodes.CREATED);
      expect(response.body).to.have.property("_id");
      expect(response.body)
        .to.have.property("name")
        .that.equals(newRegion.name);
      expect(response.body)
        .to.have.property("user")
        .that.equals(newRegion.userId);
      expect(response.body.geometry)
        .to.have.property("coordinates")
        .that.deep.eq([newRegion.coordinates]);
    });

    it("should return an error when providing invalid coordinates", async () => {
      const newRegion = {
        ...MOCK_DATA_REGION.chapada,
        userId: userIds[0],
        coordinates: MOCK_DATA_REGION.notValidCoordinates,
      };

      const response = await supertest(server)
        .post(Routes.Regions)
        .send(newRegion);

      expect(response.status).to.equal(StatusCodes.ERROR_BAD_REQUEST);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("not-valid-coordinates"));
    });

    it("should return an error when providing an invalid user id", async () => {
      const newRegion = {
        ...MOCK_DATA_REGION.chapada,
        userId: MOCK_DATA_USER.notValidUserId,
      };

      const response = await supertest(server)
        .post(Routes.Regions)
        .send(newRegion);

      expect(response.status).to.equal(StatusCodes.ERROR_NOT_FOUND);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("not-found-user"));
    });

    it("should return an error when not providing both coordinates, name and userId", async () => {
      const { coordinates, name } = MOCK_DATA_REGION.chapada;
      const userId = userIds[0];
      const newRegions = [
        { coordinates, name },
        { coordinates, userId },
        { name, userId },
      ];

      newRegions.forEach(async (item) => {
        const response = await supertest(server)
          .post(Routes.Regions)
          .send(item);

        expect(response.status).to.equal(StatusCodes.ERROR_BAD_REQUEST);
        expect(response.body)
          .to.have.property("error")
          .that.equals(errorMessage("server-error"));
      });
    });
  });

  describe("Regions retrieval", () => {
    it("should return an existing region", async () => {
      const regionId = addedRegions[2]._id;
      const response = await supertest(server).get(
        `${Routes.Regions}/${regionId}`
      );

      expect(response.status).to.equal(StatusCodes.SUCCESS);

      expect(response.body).to.have.property("_id").that.equals(regionId);
      expect(response.body)
        .to.have.property("name")
        .that.equals(addedRegions[2].name);
      expect(response.body)
        .to.have.property("user")
        .that.equals(addedRegions[2].user);
      expect(response.body)
        .to.have.property("geometry")
        .that.deep.eq(addedRegions[2].geometry);
    });

    it("should return a list of regions with pagination", async () => {
      const response = await supertest(server).get(Routes.AllRegions);
      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body).to.have.property("rows");
      expect(response.body).to.have.property("page");
      expect(response.body).to.have.property("limit");
      expect(response.body).to.have.property("total");
    });

    it("should return default pagination values if query parameters are not provided", async () => {
      const { DEFAULT_LIMIT_SIZE, DEFAULT_PAGE_NUMBER } = RegionsConstants;

      const response = await supertest(server).get(Routes.AllRegions);

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body)
        .to.have.property("page")
        .that.equals(DEFAULT_PAGE_NUMBER);
      expect(response.body)
        .to.have.property("limit")
        .that.equals(DEFAULT_LIMIT_SIZE);
    });

    it("should return custom pagination values if query parameters are provided", async () => {
      const page = 2;
      const limit = 5;

      const response = await supertest(server)
        .get(Routes.AllRegions)
        .query({ page, limit });

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body).to.have.property("page").that.equals(page);
      expect(response.body).to.have.property("limit").that.equals(limit);
    });

    it("should return the correct number of regions based on pagination", async () => {
      const page = 2;
      const limit = 2;

      const response = await supertest(server)
        .get(Routes.AllRegions)
        .query({ page, limit });

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body.rows).to.be.an("array");
      expect(response.body.rows).to.have.lengthOf(limit);
    });
  });

  describe("Regions update", () => {
    it("should update an existing region", async () => {
      const newRegion = { ...MOCK_DATA_REGION.iguacu, userId: userIds[0] };
      const regionId = addedRegions[0]._id;

      const response = await supertest(server)
        .put(`${Routes.Regions}/${regionId}`)
        .send(newRegion);

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body)
        .to.have.property("name")
        .that.equals(newRegion.name);
      expect(response.body.geometry)
        .to.have.property("coordinates")
        .that.deep.eq(newRegion.coordinates);
      expect(response.body)
        .to.have.property("user")
        .that.equals(newRegion.userId);
    });
  });

  describe("Regions search", () => {
    it("should return regions containing a specific point", async () => {
      const { latitude, longitude } = MOCK_DATA_REGION.pointInsideGrandCanyon;

      const response = await supertest(server)
        .get(Routes.RegionContains)
        .query({ longitude, latitude });

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body).to.be.an("array");
      expect(response.body[0])
        .to.have.property("name")
        .that.equals(MOCK_DATA_REGION.grandCanyon.name);
    });

    it("should only return regions containing a specific point owned by a specific user", async () => {
      const { latitude, longitude } = MOCK_DATA_REGION.pointInsideGrandCanyon;
      const userIdWithRegion = userIds[1];
      const userIdWithoutRegion = userIds[2];

      const getUserWithRegion = async () => {
        const response = await supertest(server)
          .get(Routes.RegionContains)
          .query({ longitude, latitude, userId: userIdWithRegion });

        expect(response.status).to.equal(StatusCodes.SUCCESS);
        expect(response.body).to.be.an("array");
        expect(response.body[0])
          .to.have.property("name")
          .that.equals(MOCK_DATA_REGION.grandCanyon.name);
      };
      await getUserWithRegion();

      const getUserWithoutRegion = async () => {
        const response = await supertest(server)
          .get(Routes.RegionContains)
          .query({ longitude, latitude, userId: userIdWithoutRegion });

        expect(response.status).to.equal(StatusCodes.SUCCESS);
        expect(response.body).to.be.an("array");
        expect(response.body).to.length(0);
      };
      await getUserWithoutRegion();
    });

    it("should return regions nearby a specific point", async () => {
      const { latitude, longitude, distance } =
        MOCK_DATA_REGION.pointNearbyGrandCanyon;

      const response = await supertest(server)
        .get(Routes.RegionNearby)
        .query({ longitude, latitude, distance });

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body).to.be.an("array");
      expect(response.body[0])
        .to.have.property("name")
        .that.equals(MOCK_DATA_REGION.grandCanyon.name);
    });

    it("should only return regions owned by a specific user nearby a specific point", async () => {
      const { latitude, longitude, distance } =
        MOCK_DATA_REGION.pointNearbyGrandCanyon;
      const userIdWithRegion = userIds[1];
      const userIdWithoutRegion = userIds[2];

      const getUserWithRegion = async () => {
        const response = await supertest(server)
          .get(Routes.RegionNearby)
          .query({ longitude, latitude, distance, userId: userIdWithRegion });

        expect(response.status).to.equal(StatusCodes.SUCCESS);
        expect(response.body).to.be.an("array");
        expect(response.body[0])
          .to.have.property("name")
          .that.equals(MOCK_DATA_REGION.grandCanyon.name);
      };
      await getUserWithRegion();

      const getUserWithoutRegion = async () => {
        const response = await supertest(server)
          .get(Routes.RegionNearby)
          .query({
            longitude,
            latitude,
            distance,
            userId: userIdWithoutRegion,
          });

        expect(response.status).to.equal(StatusCodes.SUCCESS);
        expect(response.body).to.be.an("array");
        expect(response.body).to.length(0);
      };
      await getUserWithoutRegion();
    });
  });

  describe("Regions deleting", () => {
    it("should not delete an existing region if the user is not the owner", async () => {
      const regionId = addedRegions[0]._id;
      const userId = userIds[2];

      const response = await supertest(server)
        .delete(`${Routes.Regions}/${regionId}`)
        .send({ userId });

      expect(response.status).to.equal(StatusCodes.ERROR_BAD_REQUEST);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("not-region-owner"));
    });

    it("should delete an existing region if the user is the owner", async () => {
      const regionId = addedRegions[0]._id;
      addedRegions.pop();
      const userId = userIds[0];

      const response = await supertest(server)
        .delete(`${Routes.Regions}/${regionId}`)
        .send({ userId });

      expect(response.status).to.equal(StatusCodes.SUCCESS);

      const verifyResponse = await supertest(server).get(
        `${Routes.Regions}/${regionId}`
      );

      expect(verifyResponse.status).to.equal(StatusCodes.ERROR_INTERNAL_SERVER);
    });
  });
});
