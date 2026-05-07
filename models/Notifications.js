import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: [
            "reminder",
            "streak_warning",
            "feedback",
            "achievement",
            "system"
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    data: {
        type: Object,
        default: {}
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true 
});

notificationSchema.index({ userId: 1, createdAt: -1 });

//  auto deletar após X dias
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;