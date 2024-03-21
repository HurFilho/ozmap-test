import { RegionsService } from "../services/regions.service";
import { Request, Response } from "express";

export class RegionsController {
  constructor(private readonly regionsService = new RegionsService()) {
    this.getAllRegions = this.getAllRegions.bind(this);
    this.createRegion = this.createRegion.bind(this);
    this.updateRegion = this.updateRegion.bind(this);
    this.deleteRegion = this.deleteRegion.bind(this);
    this.findRegionContainingPoint = this.findRegionContainingPoint.bind(this);
    this.findRegionByNearbyPoint = this.findRegionByNearbyPoint.bind(this);
    this.findRegion = this.findRegion.bind(this);
  }

  public async createRegion(request: Request, res: Response) {
    return await this.regionsService.createRegion(request, res);
  }

  public async getAllRegions(request: Request, res: Response) {
    return await this.regionsService.getAllRegions(request, res);
  }

  public async updateRegion(request: Request, res: Response) {
    return await this.regionsService.updateRegion(request, res);
  }

  public async deleteRegion(request: Request, res: Response) {
    return await this.regionsService.deleteRegion(request, res);
  }

  public async findRegionContainingPoint(request: Request, res: Response) {
    return await this.regionsService.findRegionContainingPoint(request, res);
  }

  public async findRegionByNearbyPoint(request: Request, res: Response) {
    return await this.regionsService.findRegionByNearbyPoint(request, res);
  }

  public async findRegion(request: Request, res: Response) {
    return await this.regionsService.findRegion(request, res);
  }
}
