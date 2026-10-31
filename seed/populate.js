import bcrypt from 'bcryptjs';
import User from '../models/Users.js';
import Exercice from '../models/Exercices.js';
import Session from '../models/Sessions.js';
import Notification from '../models/Notifications.js';
import { buildDemoData } from './demoData.js';

export async function populateDemo(password, now = new Date()) {
    const data = buildDemoData(now);
    const passwordHash = await bcrypt.hash(password, 10);
    const groups = [
        ['users', User, data.users.map(user => ({ ...user, password: passwordHash }))],
        ['exercises', Exercice, data.exercises],
        ['sessions', Session, data.sessions],
        ['notifications', Notification, data.notifications]
    ];
    const result = {};

    for (const [name, Model, documents] of groups) {
        await Model.init();
        let inserted = 0;
        for (const document of documents) {
            await new Model(document).validate();
            const { _id, ...fields } = document;
            const update = await Model.updateOne(
                { _id },
                { $setOnInsert: fields },
                { upsert: true, runValidators: true, setDefaultsOnInsert: true }
            );
            inserted += update.upsertedCount;
        }
        result[name] = { inserted, examples: documents.length };
    }

    return result;
}
