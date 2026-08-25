import Notification from "../models/Notifications.js";

const Create = async (userId, type, title, message, data = {}) => {
    return await Notification.create({
        userId,
        type,
        title,
        message,
        data
    });
};

const GetById = async (notificationId) => {
    return await Notification.findById(notificationId);
};

const GetByUserId = async (userId) => {
    return await Notification
        .find({ userId })
        .sort({ createdAt: -1 });
};

const GetUnreadByUserId = async (userId) => {
    return await Notification
        .find({ userId, read: false })
        .sort({ createdAt: -1 });
};

const MarkAsRead = async (notificationId) => {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );
};

const MarkAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { userId, read: false },
        { read: true }
    );
};

const Delete = async (notificationId) => {
    return await Notification.findByIdAndDelete(notificationId);
};

export default {
    Create,
    GetById,
    GetByUserId,
    GetUnreadByUserId,
    MarkAsRead,
    MarkAllAsRead,
    Delete
};
