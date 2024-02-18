import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/responseHanlder";
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {

    if(req?.userType!=='ADMIN'){
        return sendError(res,"Not Authorized for this action",{},401)
    }
    next()
};
