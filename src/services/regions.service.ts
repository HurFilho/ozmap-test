import { errorHandler } from "../utils/errors.handler.utils";
import { RegionModel, UserModel } from "../models/model.model";
import { RegionsConstants } from "../constants/regions.constant";
import { RegionsProps } from "../types/regions.type";
import { Request, Response, query } from "express";
import { StatusCodes } from "../constants/statusCodes.constant";
import { validatePolygon } from "../utils/validation.utils";

export class RegionsService {
  async getAllRegions(request: Request, response: Response) {
    const { query } = request;
    const { DEFAULT_LIMIT_SIZE, DEFAULT_PAGE_NUMBER } = RegionsConstants;

    const limit = Number(query.limit) || DEFAULT_LIMIT_SIZE;
    const page = Number(query.page) || DEFAULT_PAGE_NUMBER;

    const itemsToSkip = (page - 1) * limit;

    try {
      const [regions, total] = await Promise.all([
        RegionModel.find().skip(itemsToSkip).limit(limit).lean(),
        RegionModel.countDocuments(),
      ]);

      return response.status(StatusCodes.SUCCESS).json({
        rows: regions,
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

  async createRegion(request: Request, response: Response) {
    const { coordinates, name, userId }: RegionsProps = request.body;

    if (!coordinates || !name || !userId) {
      return response
        .status(StatusCodes.ERROR_BAD_REQUEST)
        .json({ error: "Bad request" });
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return response
          .status(StatusCodes.ERROR_NOT_FOUND)
          .json({ error: "User not found" });
      }

      const geometry = {
        type: "Polygon",
        coordinates: [coordinates],
      };

      const isValidPolygon = validatePolygon(geometry);

      if (!isValidPolygon) {
        return response
          .status(StatusCodes.ERROR_BAD_REQUEST)
          .json(errorHandler("not-valid-coordinates"));
      }

      const newRegion = await RegionModel.create({
        name,
        geometry,
        user: userId,
      });

      user.regions.push(newRegion._id);
      await user.save();

      response.status(StatusCodes.CREATED).json(newRegion);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async updateRegion(request: Request, response: Response) {
    const { name, coordinates, userId }: RegionsProps = request.body;
    const { id } = request.params;

    try {
      const region = await RegionModel.findById(id);
      if (!region) {
        return response
          .status(StatusCodes.ERROR_NOT_FOUND)
          .json(errorHandler("not-found-region"));
      }
      const { user } = region;
      if (user !== userId) {
        return response
          .status(StatusCodes.ERROR_BAD_REQUEST)
          .json(errorHandler("not-region-owner"));
      }
      region.name = name;
      const geometry = {
        type: "Polygon",
        coordinates: coordinates,
      };

      region.geometry = geometry;

      region.save();

      response.status(StatusCodes.SUCCESS).json(region);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async deleteRegion(request: Request, response: Response) {
    const { userId }: RegionsProps = request.body;
    const { id } = request.params;
    try {
      const region = await RegionModel.findById(id);
      const { user } = region;
      if (user !== userId) {
        return response
          .status(StatusCodes.ERROR_BAD_REQUEST)
          .json(errorHandler("not-region-owner"));
      }

      region.deleteOne();

      response.status(StatusCodes.SUCCESS).end();
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async findRegionContainingPoint(request: Request, response: Response) {
    const { longitude, latitude, userId } = request.query;

    try {
      const newQuery: { geometry: any; user?: string } = {
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
          },
        },
      };

      if (userId) {
        newQuery.user = String(userId);
      }

      const regions = await RegionModel.find(newQuery);

      response.status(StatusCodes.SUCCESS).json(regions);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async findRegionByNearbyPoint(request: Request, response: Response) {
    try {
      const { longitude, latitude, distance, userId } = request.query;

      const newQuery: { geometry: any; user?: string } = {
        geometry: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: Number(distance),
          },
        },
      };

      if (userId) {
        newQuery.user = String(userId);
      }

      const regions = await RegionModel.find(newQuery);

      response.status(StatusCodes.SUCCESS).json(regions);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }

  async findRegion(request: Request, response: Response) {
    const { id } = request.params;

    try {
      const region = await RegionModel.findById(id);
      if (!region) {
        return response
          .status(StatusCodes.ERROR_INTERNAL_SERVER)
          .json({ error: "Region not found" });
      }
      response.status(StatusCodes.SUCCESS).json(region);
    } catch (error) {
      response
        .status(StatusCodes.ERROR_INTERNAL_SERVER)
        .json(errorHandler("server-error"));
    }
  }
}
