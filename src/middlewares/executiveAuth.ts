import { Request, Response, NextFunction } from "express";
import { AppDataSource } from '../AppDataSource';
import { ExecutiveLog } from "../entites/ExecutiveLog";

declare global {
    namespace Express {
        interface Request {
            execId?: any;
        }
    }
}

export const executiveAuth = async (req: Request, res: Response, next: NextFunction) => {

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
        const executiveLog = await AppDataSource.getRepository(ExecutiveLog).findOne({ where: { key: token, is_deleted: false } });

        if (!executiveLog) {
            return res.status(401).json({ message: "Invalid token." });
        }

        const execId = executiveLog.executive_id_fk;

        (req as any).execId = execId;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token." });
    }
};