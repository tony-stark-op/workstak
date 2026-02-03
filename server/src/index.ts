import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import repoRoutes from './routes/repoRoutes';
import gitRoutes from './routes/gitRoutes';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import pullRequestRoutes from './routes/pullRequestRoutes';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/repos/:repoName/prs', pullRequestRoutes);
app.use('/git', gitRoutes); // Mount git routes at /git

app.get('/', (req, res) => {
    res.json({ message: 'Enterprise VCS API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
