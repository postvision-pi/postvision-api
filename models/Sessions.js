import mongoose from 'mongoose';



const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercice', required: true },
    date: { type: Date, required: true },
    durationInSeconds: { type: Number, required: true },
    report: {
        correctReps: { type: Number, required: true },
        incorrectReps: { type: Number, required: true },
        averageAccuracy: { type: Number, required: true },
        comment: {
            text: { type: String }
        }
    },
    landmarksPath: { type: String, required: true }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

export default Session;