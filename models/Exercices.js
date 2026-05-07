import mongoose from 'mongoose';

const exerciceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    muscleGroup: { type: String, required: true }
})

const Exercice = mongoose.model('Exercice', exerciceSchema);

export default Exercice;