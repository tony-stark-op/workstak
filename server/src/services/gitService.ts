import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class GitService {
    private repoRoot: string;

    constructor() {
        this.repoRoot = process.env.GIT_REPOS_PATH || './vcs-data';
        // Ensure absolute path
        if (!path.isAbsolute(this.repoRoot)) {
            this.repoRoot = path.resolve(process.cwd(), this.repoRoot);
        }
    }

    async initRepo(repoName: string): Promise<string> {
        const repoPath = path.join(this.repoRoot, repoName);

        try {
            await fs.mkdir(repoPath, { recursive: true });
            await execAsync(`git init --bare`, { cwd: repoPath });

            // Update server info for git-http-backend
            await execAsync(`git update-server-info`, { cwd: repoPath });

            // Enable git-http-backend by getting config
            await execAsync(`git config http.receivepack true`, { cwd: repoPath });

            return repoPath;
        } catch (error) {
            console.error('Failed to init repo:', error);
            throw new Error(`Failed to initialize repository: ${error}`);
        }
    }

    getRepoPath(repoName: string): string {
        return path.join(this.repoRoot, repoName);
    }


    async getCommits(repoName: string, branch: string = 'master'): Promise<any[]> {
        const repoPath = this.getRepoPath(repoName);
        try {
            const { stdout } = await execAsync(`git log --pretty=format:"%H|%an|%ae|%at|%s" -n 50 ${branch}`, { cwd: repoPath });
            return stdout.split('\n').filter(Boolean).map(line => {
                const [hash, author, email, timestamp, message] = line.split('|');
                return { hash, author, email, timestamp: parseInt(timestamp, 10) * 1000, message };
            });
        } catch (error) {
            console.error('Error getting commits:', error);
            return [];
        }
    }

    async getFileTree(repoName: string, treeSha: string = 'master'): Promise<any[]> {
        const repoPath = this.getRepoPath(repoName);
        try {
            // ls-tree -l: show size
            const { stdout } = await execAsync(`git ls-tree -l ${treeSha}`, { cwd: repoPath });
            return stdout.split('\n').filter(Boolean).map(line => {
                // Mode Type SHA Size\tName
                // 100644 blob 1234... 1024    README.md
                const [metadata, name] = line.split('\t');
                const [mode, type, sha, size] = metadata.split(/\s+/);
                return { mode, type, sha, size, name };
            });
        } catch (error) {
            console.error('Error getting file tree:', error);
            return [];
        }
    }

    async getFileContent(repoName: string, blobSha: string): Promise<string> {
        const repoPath = this.getRepoPath(repoName);
        try {
            const { stdout } = await execAsync(`git cat-file -p ${blobSha}`, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 });
            return stdout;
        } catch (error) {
            throw new Error('Failed to read file content');
        }
    }

    async listRepos(): Promise<string[]> {
        try {
            const files = await fs.readdir(this.repoRoot, { withFileTypes: true });
            return files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        } catch (e) {
            return [];
        }
    }
}
