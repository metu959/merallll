const express = require('express');
const mongoose = require('./config');
const cors = require('cors');
const dotenv = require('dotenv');
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');

dotenv.config();

const app = express();
const buildPath = path.join(__dirname, "../Frontend/build");

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', fileRoutes);

// Serve frontend
app.use(express.static(buildPath));

// Serve frontend for unknown routes
app.get("/*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"), (err) => {
        if (err) res.status(500).send(err);
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Database Connection Check
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
