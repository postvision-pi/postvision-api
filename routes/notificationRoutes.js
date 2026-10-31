import express from "express";
import NotificationController from "../controllers/notificationsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ATENÇÃO: o postvision-web não chama esta rota de criação hoje. Se algum
// serviço do sistema (cron de lembrete, streak_warning, etc.) cria
// notificações para outros usuários sem login, essa exigência de token
// vai quebrar isso — avise para trocarmos por uma chave de API interna.
router.post("/notifications/", authMiddleware, NotificationController.CreateNotification);

// buscar não lidas
router.get("/notifications/unread/:userId", authMiddleware, NotificationController.GetUnreadNotifications);

// buscar todas
router.get("/notifications/:userId", authMiddleware, NotificationController.GetNotifications);

// marcar uma como lida
router.put("/notifications/:id/read", authMiddleware, NotificationController.MarkAsRead);

// marcar todas como lidas
router.put("/notifications/read/all/:userId", authMiddleware, NotificationController.MarkAllAsRead);

// deletar
router.delete("/notifications/:id", authMiddleware, NotificationController.DeleteNotification);

export default router;
