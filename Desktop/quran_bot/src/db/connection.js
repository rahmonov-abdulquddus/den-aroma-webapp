// src/db/connection.js

import mongoose from 'mongoose';
import config from '../config.js'; // src/config.js ga yo'l

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('MongoDB ga muvaffaqiyatli ulanildi!');
    } catch (err) {
        console.error('MongoDB ga ulanishda xato:', err);
        process.exit(1); // Ulanishda xato bo'lsa, ilovani to'xtatish
    }
};

export default connectDB;

// Agar buni ishlatsangiz, src/app.js dagi mongoose.connect qatorini
// import connectDB from './db/connection.js';
// ...
// await connectDB();
// ga o'zgartirishingiz kerak bo'ladi.