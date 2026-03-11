const mongoose = require('mongoose');
require('dotenv').config();

// Replace process.env.MONGO_URI with your own URI if not using .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));
