import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

export class UsersController {
  constructor(private readonly usersService = new UsersService()) {
    this.getAllUsers = this.getAllUsers.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.findUser = this.findUser.bind(this);
  }

  public async getAllUsers(request: Request, res: Response) {
    return await this.usersService.getAllUsers(request, res);
  }

  public async findUser(request: Request, res: Response) {
    return await this.usersService.findUser(request, res);
  }

  public async createUser(request: Request, res: Response) {
    return await this.usersService.createUser(request, res);
  }

  public async updateUser(request: Request, res: Response) {
    return await this.usersService.updateUser(request, res);
  }

  public async deleteUser(request: Request, res: Response) {
    return await this.usersService.deleteUser(request, res);
  }
}
