import { Request, Response, NextFunction } from "express";
import { AppDataSource } from '../AppDataSource';
import { UserLog } from "../entites/UserLog";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const clientAuth = async (req: Request, res: Response, next: NextFunction) => {

    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader || typeof authorizationHeader !== 'string') {
        return res.status(401).json({ message: "Access denied. Token is required." });
    }

    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: "Invalid authorization header format." });
    }

    const token: string = tokenParts[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Token is required." });
    }

    try {
        const userLog = await AppDataSource.getRepository(UserLog).findOne({ where: { key: token, is_deleted: false } });

        if (!userLog) {
            return res.status(401).json({ message: "Invalid token." });
        }

        (req as any).userId = userLog.user_id_fk;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token." });
    }
};
