import { Request, Response, NextFunction } from "express";
import { AppDataSource } from '../AppDataSource';
import { UserLog } from "../entites/UserLog";

declare global {
    namespace Express {
        interface Request {
            userId?: any,
            userToken?: any,
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
        const userLogRepo = AppDataSource.getRepository(UserLog);
        const userLog = await userLogRepo.findOne({ where: { key: token, is_deleted: false, id_status: "ACTIVE" } });

        if (!userLog) {
            return res.status(401).json({ message: "Invalid token." });
        }

        const tokenTime = new Date(userLog.added_on);
        const currentTime = new Date();

        const timeDiff = Math.abs(currentTime.getTime() - tokenTime.getTime());
        const diffInMinutes = Math.floor(timeDiff / (1000 * 60));
        if (diffInMinutes > 10) {
            userLog.id_status = "INACTIVE";
            userLog.is_deleted = true;
            await userLogRepo.update(userLog.id, userLog);
            return res.status(401).json({ message: "Session Expired" });
        }

        const userId = userLog.user_id_fk;

        (req as any).userId = userId;
        (req as any).userToken = token;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token." });
    }
};
