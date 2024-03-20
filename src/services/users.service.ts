import { errorHandler } from "../utils/errors.handler.utils";
import { messageHandler } from "../utils/messages.handler.utils";
import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes.constant";
import { UserModel } from "../models/model.model";
import { UserProps } from "../types/users.type";
import { UsersConstants } from "../constants/users.constant";

export class UsersService {
  async getAllUsers(request: Request, response: Response) {
    const { query } = request;
    const { DEFAULT_LIMIT_SIZE, DEFAULT_PAGE_NUMBER } = UsersConstants;

    const limit = Number(query.limit) || DEFAULT_LIMIT_SIZE;
    const page = Number(query.page) || DEFAULT_PAGE_NUMBER;

    const itemsToSkip = (page - 1) * limit;

    try {
      const [users, total] = await Promise.all([
        UserModel.find().skip(itemsToSkip).limit(limit).lean(),
        UserModel.countDocuments(),
      ]);

      return response.status(StatusCodes.SUCCESS).json({
        rows: users,
        page,
        limit,
        total,
      });
    } catch (error) {
      return response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async createUser(request: Request, response: Response) {
    const { email, name, address, coordinates }: UserProps = request.body;

    if ((address && coordinates) || (!address && !coordinates)) {
      response
        .status(StatusCodes.ERROR_BAD_REQUEST)
        .json(errorHandler("address-or-coordinates"));
      return;
    }
    try {
      const newUser = await UserModel.create({
        address,
        coordinates,
        email,
        name,
      });
      response.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_NOT_FOUND)
        .json({ error: error.message });
    }
  }

  async updateUser(request: Request, response: Response) {
    const { email, name, address, coordinates }: UserProps = request.body;

    if ((address && coordinates) || (!address && !coordinates)) {
      response
        .status(StatusCodes.ERROR_BAD_REQUEST)
        .json(errorHandler("address-or-coordinates"));
      return;
    }
    try {
      const { id } = request.params;
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { email, name, address, coordinates },
        {
          new: true,
        }
      );
      if (!updatedUser) {
        return response
          .status(StatusCodes.ERROR_NOT_FOUND)
          .json(errorHandler("not-found-user"));
      }
      response.status(StatusCodes.SUCCESS).json(updatedUser);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async deleteUser(request: Request, response: Response) {
    const { id } = request.params;

    try {
      const deletedUser = await UserModel.findByIdAndDelete(id);
      if (!deletedUser) {
        return response
          .status(StatusCodes.ERROR_NOT_FOUND)
          .json({ error: "User not found" });
      }
      response.status(StatusCodes.SUCCESS).json(messageHandler("deleted"));
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async findUser(request: Request, response: Response) {
    const { id } = request.params;

    const user = await UserModel.findOne({ _id: id }).lean();

    if (!user) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("not-found-user"));
      return;
    }
    response.status(StatusCodes.SUCCESS).json(user);
  }
}
