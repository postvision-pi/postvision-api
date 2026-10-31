import NotificationService from "../services/notificationsService.js";

const CreateNotification = async (req, res) => {
    try {
        const { type, title, message, data } = req.body;

        // A notificação é sempre criada para o próprio usuário autenticado.
        // (Se no futuro vocês precisarem que um serviço do sistema crie
        // notificações para outros usuários — ex: lembretes automáticos,
        // "streak_warning" via cron — essa rota vai precisar de uma
        // autenticação separada por chave de serviço, não por JWT de usuário.)
        const userId = req.userId;

        const notification = await NotificationService.Create(
            userId,
            type,
            title,
            message,
            data
        );

        res.status(201).json(notification);
    } catch (err) {
        console.log("Erro ao criar notificação:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

const GetNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.userId !== userId) {
            return res.status(403).json({ error: "Você não tem permissão para ver essas notificações." });
        }

        const notifications = await NotificationService.GetByUserId(userId);

        res.status(200).json(notifications);
    } catch (err) {
        console.log("Erro ao buscar notificações:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

const GetUnreadNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.userId !== userId) {
            return res.status(403).json({ error: "Você não tem permissão para ver essas notificações." });
        }

        const notifications = await NotificationService.GetUnreadByUserId(userId);

        res.status(200).json(notifications);
    } catch (err) {
        console.log("Erro ao buscar notificações não lidas:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

const MarkAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await NotificationService.GetById(id);
        if (!existing) {
            return res.status(404).json({ error: "Notificação não encontrada" });
        }
        if (existing.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Você não tem permissão para alterar esta notificação." });
        }

        const notification = await NotificationService.MarkAsRead(id);

        res.status(200).json(notification);
    } catch (err) {
        console.log("Erro ao marcar como lida:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

const MarkAllAsRead = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.userId !== userId) {
            return res.status(403).json({ error: "Você não tem permissão para alterar essas notificações." });
        }

        await NotificationService.MarkAllAsRead(userId);

        res.status(200).json({ message: "Todas notificações marcadas como lidas" });
    } catch (err) {
        console.log("Erro ao marcar todas como lidas:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

const DeleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await NotificationService.GetById(id);
        if (!existing) {
            return res.status(404).json({ error: "Notificação não encontrada" });
        }
        if (existing.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Você não tem permissão para apagar esta notificação." });
        }

        await NotificationService.Delete(id);

        res.status(200).json({ message: "Notificação deletada" });
    } catch (err) {
        console.log("Erro ao deletar notificação:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

export default {
    CreateNotification,
    GetNotifications,
    GetUnreadNotifications,
    MarkAsRead,
    MarkAllAsRead,
    DeleteNotification
};
