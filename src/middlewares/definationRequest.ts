import { Request } from "express";

export interface IGetUserAuthInfoRequest extends Request {
  user: number; // or any other type you would like to use
}