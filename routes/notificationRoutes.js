import express from "express";
import NotificationController from "../controllers/notificationsController.js";

const router = express.Router();

// criar
router.post("/notifications/", NotificationController.CreateNotification);

// buscar não lidas
router.get("/notifications/unread/:userId", NotificationController.GetUnreadNotifications);

// buscar todas
router.get("/notifications/:userId", NotificationController.GetNotifications);

// marcar uma como lida
router.put("/notifications/:id/read", NotificationController.MarkAsRead);

// marcar todas como lidas
router.put("/notifications/read/all/:userId", NotificationController.MarkAllAsRead);

// deletar
router.delete("/notifications/:id", NotificationController.DeleteNotification);

export default router;