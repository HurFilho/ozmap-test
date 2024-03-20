import "../database/mongo.database";
import * as supertest from "supertest";
import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { MOCK_DATA_USER } from "./Mocks/users.mock";
import server from "../app";
import { Routes } from "../constants/routes.constant";
import { StatusCodes } from "../constants/statusCodes.constant";
import { errorMessage } from "../utils/errors.handler.utils";

describe("Users routes", () => {
  let userIds: string[] = [];

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
  });

  after(async () => {
    const deleteUsers = async () => {
      userIds.forEach(async (userId) => {
        await supertest(server).delete(`${Routes.Users}/${userId}`);
      });
    };
    await deleteUsers();
  });

  describe("User creation", () => {
    it("should create a user with coordinates when only coordinates are provided", async () => {
      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        coordinates: MOCK_DATA_USER.validCoordinates,
      };

      const response = await supertest(server)
        .post(Routes.Users)
        .send(userData);

      expect(response.status).to.equal(StatusCodes.CREATED);
      expect(response.body).to.have.property("name").that.equals(userData.name);
      expect(response.body)
        .to.have.property("email")
        .that.equals(userData.email);
      expect(response.body)
        .to.have.property("coordinates")
        .that.deep.eq(userData.coordinates);
    });

    it("should create a user with address when only a valid address is provided", async () => {
      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        address: MOCK_DATA_USER.validAddress,
      };

      const response = await supertest(server)
        .post(Routes.Users)
        .send(userData);

      expect(response.status).to.equal(StatusCodes.CREATED);
      expect(response.body).to.have.property("name").that.equals(userData.name);
      expect(response.body)
        .to.have.property("email")
        .that.equals(userData.email);
      expect(response.body)
        .to.have.property("address")
        .that.equals(userData.address);
    });

    it("should return an error when a not valid address is provided", async () => {
      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        address: MOCK_DATA_USER.notValidAddress,
      };

      const response = await supertest(server)
        .post(Routes.Users)
        .send(userData);

      expect(response.status).to.equal(StatusCodes.ERROR_NOT_FOUND);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("not-found-address"));
    });

    it("should return an error when invalid coordinates are provided", async () => {
      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        coordinates: MOCK_DATA_USER.notValidCoordinates,
      };

      const response = await supertest(server)
        .post(Routes.Users)
        .send(userData);

      expect(response.status).to.equal(StatusCodes.ERROR_NOT_FOUND);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("not-found-address"));
    });

    it("should return an error when both coordinates and address are provided", async () => {
      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        address: MOCK_DATA_USER.validAddress,
        coordinates: MOCK_DATA_USER.validCoordinates,
      };

      const response = await supertest(server)
        .post(Routes.Users)
        .send(userData);

      expect(response.status).to.equal(StatusCodes.ERROR_BAD_REQUEST);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("address-or-coordinates"));
    });

    it("should return an error when neither coordinates nor address is provided", async () => {
      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
      };

      const response = await supertest(server)
        .post(Routes.Users)
        .send(userData);

      expect(response.status).to.equal(StatusCodes.ERROR_BAD_REQUEST);
      expect(response.body)
        .to.have.property("error")
        .that.equals(errorMessage("address-or-coordinates"));
    });
  });

  describe("Users retrieval", () => {
    it("should return default pagination values if query parameters are not provided", async () => {
      const DEFAULT_PAGINATION = 1;
      const DEFAULT_LIMIT = 10;
      const response = await supertest(server).get(Routes.AllUsers);

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body)
        .to.have.property("page")
        .that.equals(DEFAULT_PAGINATION);
      expect(response.body)
        .to.have.property("limit")
        .that.equals(DEFAULT_LIMIT);
    });

    it("should return custom pagination values if query parameters are provided", async () => {
      const page = 2;
      const limit = 5;

      const response = await supertest(server)
        .get(Routes.AllUsers)
        .query({ page, limit });

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body).to.have.property("page").that.equals(page);
      expect(response.body).to.have.property("limit").that.equals(limit);
    });

    it("should return the correct number of users based on pagination", async () => {
      const page = 2;
      const limit = 2;

      const response = await supertest(server)
        .get(Routes.AllUsers)
        .query({ page, limit });

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body.rows).to.be.an("array");
      expect(response.body.rows).to.have.lengthOf(limit);
    });

    it("should return an existing user", async () => {
      const userId = userIds[0];
      const response = await supertest(server).get(`${Routes.Users}/${userId}`);

      expect(response.status).to.equal(StatusCodes.SUCCESS);
    });
  });

  describe("Users update", () => {
    it("should update an existing user", async () => {
      const userId = userIds[0];
      const updatedUserData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        address: MOCK_DATA_USER.validAddress,
      };

      const response = await supertest(server)
        .put(`${Routes.Users}/${userId}`)
        .send(updatedUserData);

      expect(response.status).to.equal(StatusCodes.SUCCESS);
      expect(response.body)
        .to.have.property("name")
        .that.equals(updatedUserData.name);
      expect(response.body)
        .to.have.property("email")
        .that.equals(updatedUserData.email);
      expect(response.body)
        .to.have.property("address")
        .that.equals(updatedUserData.address);
    });
  });

  describe("Users deletion", () => {
    it("should delete an existing user", async () => {
      const userId = userIds.pop();
      const response = await supertest(server).delete(
        `${Routes.Users}/${userId}`
      );

      expect(response.status).to.equal(StatusCodes.SUCCESS);
    });
  });
});
