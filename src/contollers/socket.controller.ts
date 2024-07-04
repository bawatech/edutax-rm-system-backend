import { toNull } from "../utils/commonFunctions";
import { AppDataSource } from '../AppDataSource';
import { OnlineStatus } from "../entites/OnlineStatus";

export const onlineDetailByUserId = async (userId: any) => {
    try {
        userId = parseInt(userId) || null;
        if (toNull(userId) != null) {
            const onlineStatusRepo = AppDataSource.getRepository(OnlineStatus);
            const onlineStatus = await onlineStatusRepo.findOne({ where: { user_id: userId } });
            if (!onlineStatus) {
                return null;
            }
            return { detail: onlineStatus };
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
};

export const onlineDetailBySocketId = async (socketId: any) => {
    try {
        if (toNull(socketId) != null) {
            const onlineStatusRepo = AppDataSource.getRepository(OnlineStatus);
            const onlineStatus = await onlineStatusRepo.findOne({ where: { socket_id: socketId } });
            if (!onlineStatus) {
                return null;
            }
            return { detail: onlineStatus };
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
};

export const addOnlineStatus = async (data: any) => {
    try {
        if (toNull(data.socket_id) != null) {
            const { socket_id, user_id, user_type, room, in_chat } = data;
            console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", in_chat)
            const onlineStatusRepo = AppDataSource.getRepository(OnlineStatus);
            const onlineStatus = await onlineStatusRepo.findOne({ where: { socket_id, user_id, user_type, room } });
            if (!onlineStatus) {
                const onlineStatus = new OnlineStatus();
                onlineStatus.socket_id = socket_id;
                onlineStatus.user_id = user_id;
                onlineStatus.room = room;
                onlineStatus.user_type = user_type;
                if (in_chat === "YES") {
                    onlineStatus.in_chat = "YES";
                }
                const addOnlineStatus = await onlineStatusRepo.save(onlineStatus);
                if (!addOnlineStatus) {
                    return false;
                }
                return true;
            }
            return false;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
};

export const updateOnlineStatus = async (data: any) => {
    try {
        if (toNull(data.socket_id) != null) {
            const { socket_id, in_chat } = data;
            const onlineStatusRepo = AppDataSource.getRepository(OnlineStatus);
            const onlineStatus = await onlineStatusRepo.findOne({ where: { socket_id } });
            if (!onlineStatus) {
                return false;
            }
            onlineStatus.in_chat = in_chat;
            const upateOnlineStatus = await onlineStatusRepo.update(onlineStatus.id, { in_chat });
            if (!upateOnlineStatus) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
};

export const deleteOnlineStatus = async (socket_id: any) => {
    try {
        if (toNull(socket_id) != null) {
            const onlineStatusRepo = AppDataSource.getRepository(OnlineStatus);
            const onlineStatus = await onlineStatusRepo.findOne({ where: { socket_id: socket_id } });
            if (onlineStatus) {
                const deleteOnlineStatus = await onlineStatusRepo.delete({ socket_id: socket_id });
                if (!deleteOnlineStatus) {
                    return false;
                }
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
};