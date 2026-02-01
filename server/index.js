require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);
const projectRoutes = require('./routes/projects');
app.use('/api/v1/projects', projectRoutes);
const taskRoutes = require('./routes/tasks');
app.use('/api/v1/tasks', taskRoutes);
const sprintRoutes = require('./routes/sprints');
app.use('/api/v1/sprints', sprintRoutes);
const fileRoutes = require('./routes/files');
app.use('/api/v1/files', fileRoutes);

app.use('/uploads', express.static('uploads'));

const analyticsRoutes = require('./routes/analytics');
app.use('/api/v1/analytics', analyticsRoutes);

const aiRoutes = require('./routes/ai');
app.use('/api/v1/ai', aiRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('WorkStak API Running');
});

// Socket.IO Setup
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
