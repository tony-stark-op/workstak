import dotenv from 'dotenv';

// ⚠️ CRITICAL: Load .env BEFORE other imports that use process.env
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import repoRoutes from './routes/repoRoutes';
import gitRoutes from './routes/gitRoutes';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import pullRequestRoutes from './routes/pullRequestRoutes';
import aiRoutes from './routes/aiRoutes';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Enterprise VCS API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/repos/:repoName/prs', pullRequestRoutes);
app.use('/api/ai', aiRoutes); // Mount AI routes
app.use('/git', gitRoutes); // Mount git routes at /git

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
