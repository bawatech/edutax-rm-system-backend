import { NextFunction, Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "./definationRequest";
export const protect = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token;

      req.user = 1;
      next();
    } catch (error) {
        // return res.send('ttt')
        return next()
    //   return next(new ErrorHandler("Token expired", 401));
    }
  };