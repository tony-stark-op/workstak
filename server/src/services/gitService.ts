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
        // Ensure repoName has .git extension
        if (!repoName.endsWith('.git')) {
            repoName += '.git';
        }
        const repoPath = path.join(this.repoRoot, repoName);

        try {
            await fs.mkdir(repoPath, { recursive: true });
            await execAsync(`git init --bare`, { cwd: repoPath });

            // Update server info for git-http-backend
            await execAsync(`git update-server-info`, { cwd: repoPath });

            // Enable git-http-backend by getting config
            await execAsync(`git config http.receivepack true`, { cwd: repoPath });

            // SEED REPO: Clone, Add README, Push to create 'master'
            const tempDir = path.join(this.repoRoot, `temp_init_${repoName}_${Date.now()}`);
            try {
                // Determine absolute path for cloning to avoid confusion
                const absRepoPath = path.resolve(repoPath);

                // Clone the empty repo
                await execAsync(`git clone "${absRepoPath}" "${tempDir}"`);

                // Configure User
                await execAsync(`git config user.email "bot@workstack.com"`, { cwd: tempDir });
                await execAsync(`git config user.name "WorkStack Bot"`, { cwd: tempDir });

                // Create README
                await fs.writeFile(path.join(tempDir, 'README.md'), `# ${repoName.replace('.git', '')}\n\nInitialized by WorkStack.`);

                // Commit and Push
                await execAsync(`git add .`, { cwd: tempDir });
                await execAsync(`git commit -m "Initial commit"`, { cwd: tempDir });
                await execAsync(`git push origin master`, { cwd: tempDir });

            } catch (seedError) {
                console.error('Failed to seed repo:', seedError);
                // We don't throw here, as the bare repo is created. It just might be empty.
            } finally {
                // Cleanup temp
                try {
                    await fs.rm(tempDir, { recursive: true, force: true });
                } catch (e) { console.error('Cleanup error', e); }
            }

            return repoPath;
        } catch (error) {
            console.error('Failed to init repo:', error);
            throw new Error(`Failed to initialize repository: ${error}`);
        }
    }

    getRepoPath(repoName: string): string {
        // Automatically append .git if missing, as directories now have .git extension
        if (!repoName.endsWith('.git')) {
            repoName += '.git';
        }
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
        } catch (error: any) {
            // If branch doesn't exist or repo is empty, return empty array instead of failing
            if (error.stderr && (error.stderr.includes('does not have any commits') || error.stderr.includes('Not a valid object name'))) {
                return [];
            }
            console.error('Error getting commits:', error);
            return [];
        }
    }

    async getCommitsBetween(repoName: string, base: string, head: string): Promise<any[]> {
        const repoPath = this.getRepoPath(repoName);
        try {
            // git log base..head shows commits reachable from head that are NOT reachable from base
            const { stdout } = await execAsync(`git log --pretty=format:"%H|%an|%ae|%at|%s" ${base}..${head}`, { cwd: repoPath });
            return stdout.split('\n').filter(Boolean).map(line => {
                const [hash, author, email, timestamp, message] = line.split('|');
                return { hash, author, email, timestamp: parseInt(timestamp, 10) * 1000, message };
            });
        } catch (error) {
            console.error('Error getting range commits:', error);
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
        } catch (error: any) {
            if (error.stderr && (error.stderr.includes('Not a valid object name'))) {
                return [];
            }
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
            return files
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name.replace(/\.git$/, '')); // Strip .git for display
        } catch (e) {
            return [];
        }
    }

    async getDiff(repoName: string, source: string, target: string): Promise<string> {
        const repoPath = this.getRepoPath(repoName);
        try {
            // git diff target...source (3-dot diff: what is in source that is not in target)
            const { stdout } = await execAsync(`git diff ${target}...${source}`, { cwd: repoPath });
            return stdout;
        } catch (error) {
            console.error('Diff error:', error);
            return '';
        }
    }

    async mergeBranches(repoName: string, source: string, target: string): Promise<void> {
        const repoPath = this.getRepoPath(repoName);
        const tempDir = path.join(this.repoRoot, `temp_merge_${repoName}_${Date.now()}`);

        try {
            // 1. Clone the repo
            await execAsync(`git clone "${repoPath}" "${tempDir}"`);

            // 2. Configure user (needed for merge commit)
            await execAsync(`git config user.email "bot@workstack.com"`, { cwd: tempDir });
            await execAsync(`git config user.name "WorkStack Bot"`, { cwd: tempDir });

            // 3. Checkout target branch
            await execAsync(`git checkout ${target}`, { cwd: tempDir });

            // 4. Merge source branch
            // --no-ff to always create a merge commit for history visibility
            await execAsync(`git merge origin/${source} --no-ff -m "Merge pull request: ${source} into ${target}"`, { cwd: tempDir });

            // 5. Push changes
            await execAsync(`git push origin ${target}`, { cwd: tempDir });

        } catch (error: any) {
            console.error('Merge branches error:', error);
            // Check for conflicts
            if (error.stderr && error.stderr.includes('CONFLICT')) {
                throw new Error('Merge conflict detected');
            }
            throw new Error(`Failed to merge branches: ${error.message}`);
        } finally {
            // 6. Cleanup
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (e) {
                console.error('Failed to cleanup temp dir:', e);
            }
        }
    }

    async getBranches(repoName: string): Promise<string[]> {
        const repoPath = this.getRepoPath(repoName);
        try {
            const { stdout } = await execAsync(`git branch -a`, { cwd: repoPath });
            return stdout.split('\n')
                .filter(Boolean)
                .map(line => line.trim().replace('* ', '').replace('remotes/origin/', ''))
                .filter((v, i, a) => a.indexOf(v) === i); // Unique
        } catch (error) {
            console.error('Error getting branches:', error);
            return ['master'];
        }
    }

    async createBranch(repoName: string, branchName: string, sourceBranch: string = 'master'): Promise<void> {
        const repoPath = this.getRepoPath(repoName);
        try {
            await execAsync(`git branch ${branchName} ${sourceBranch}`, { cwd: repoPath });
        } catch (error: any) {
            console.error('Error creating branch:', error);
            if (error.stderr && error.stderr.includes('already exists')) {
                throw new Error('Branch already exists');
            }
            if (error.stderr && error.stderr.includes('not a valid object name')) {
                throw new Error(`Source branch '${sourceBranch}' does not exist. The repository might be empty.`);
            }
            throw new Error(`Failed to create branch: ${error.message}`);
        }
    }

    async updateFile(repoName: string, filePath: string, content: string, message: string, user: any): Promise<void> {
        const repoPath = this.getRepoPath(repoName);
        try {
            // Write to file (simple fs write, but for bare repo this is tricky)
            // Bare repos don't have a working directory.
            // WE ASSUME NON-BARE REPO FOR SIMPLICITY in this phase or we use git hash-object + git update-index + git write-tree + git commit-tree
            // However, initRepo uses --bare.
            // If we are using bare repos, we can't just fs.writeFile.
            // We need to use temporary index or a worktree.

            // SIMPLIFICATION FOR PROTOTYPE:
            // We'll treat the repo as a standard non-bare repo for editing or use a temp clone.
            // But `initRepo` makes it `--bare`.
            // Let's use the low-level porcelain commands for bare repo editing if possible, or easier:
            // 1. Create a temporary worktree/clone
            // 2. Modify file
            // 3. Commit & Push
            // 
            // OR simpler:
            // 1. Git `hash-object -w --stdin` to create blob
            // 2. Git `mktree` or read-tree to update
            // 
            // APPROACH: Worktree is easiest to reason about.
            const tempDir = path.join(this.repoRoot, `temp_${repoName}_${Date.now()}`);
            await execAsync(`git clone "${repoPath}" "${tempDir}"`);

            // Write file
            const absoluteFilePath = path.join(tempDir, filePath);
            await fs.writeFile(absoluteFilePath, content);

            // Config User
            await execAsync(`git config user.email "${user.email}"`, { cwd: tempDir });
            await execAsync(`git config user.name "${user.firstName} ${user.lastName}"`, { cwd: tempDir });

            // Commit & Push
            await execAsync(`git add .`, { cwd: tempDir });
            await execAsync(`git commit -m "${message}"`, { cwd: tempDir });
            await execAsync(`git push origin master`, { cwd: tempDir }); // Assuming master for now or need branch arg

            // Cleanup
            await fs.rm(tempDir, { recursive: true, force: true });

        } catch (error) {
            console.error('Error updating file:', error);
            throw new Error('Failed to update file');
        }
    }
}
