import path from 'path';
import { spawn } from 'child_process';
import Repository from '../models/Repository';
import Branch from '../models/Branch';
import Commit from '../models/Commit';
import Blob from '../models/Blob';

const GIT_ROOT = path.resolve(process.env.GIT_REPOS_PATH || './vcs-data');

export class GitService {

    // Helper to run git commands
    private async gitExec(repoName: string, args: string[]): Promise<string> {
        const repoPath = path.join(GIT_ROOT, repoName);
        // Ensure repo exists
        try {
            require('fs').accessSync(repoPath);
        } catch (e) {
            return ''; // or throw
        }

        return new Promise((resolve, reject) => {
            const git = spawn('git', args, { cwd: repoPath });
            let stdout = '';
            let stderr = '';

            git.stdout.on('data', d => stdout += d.toString());
            git.stderr.on('data', d => stderr += d.toString());

            git.on('close', code => {
                if (code === 0) resolve(stdout.trim());
                else {
                    resolve('');
                }
            });
        });
    }

    private async gitExecEnv(repoName: string, args: string[], env: any): Promise<string> {
        const repoPath = path.join(GIT_ROOT, repoName);
        return new Promise((resolve, reject) => {
            const git = spawn('git', args, { cwd: repoPath, env });
            let stdout = '';
            git.stdout.on('data', d => stdout += d.toString());
            git.on('close', code => code === 0 ? resolve(stdout.trim()) : resolve(''));
        });
    }

    private async pipeToGit(repoName: string, args: string[], input: string): Promise<string> {
        return this.pipeToGitEnv(repoName, args, input, {});
    }

    private async pipeToGitEnv(repoName: string, args: string[], input: string, env: any): Promise<string> {
        const repoPath = path.join(GIT_ROOT, repoName);
        // Merge process.env with custom env
        const finalEnv = { ...process.env, ...env };

        return new Promise((resolve, reject) => {
            const git = spawn('git', args, { cwd: repoPath, env: finalEnv });
            let stdout = '';
            git.stdout.on('data', d => stdout += d.toString());
            git.stdin.write(input);
            git.stdin.end();
            git.on('close', code => code === 0 ? resolve(stdout.trim()) : reject(new Error('Pipe failed')));
        });
    }

    async initRepo(repoName: string): Promise<string> {
        const repoPath = path.join(GIT_ROOT, repoName);

        // 1. Create Dir
        require('fs').mkdirSync(repoPath, { recursive: true });

        // 2. Git Init --bare
        await new Promise((resolve, reject) => {
            const init = spawn('git', ['init', '--bare'], { cwd: repoPath });
            init.on('close', code => {
                if (code === 0) resolve(true);
                else reject(new Error(`git init failed with code ${code}`));
            });
        });

        // 3. Create Initial Commit (so master exists)
        // This fails if we don't set user/email
        const env = {
            ...process.env,
            GIT_AUTHOR_NAME: 'WorkStack System',
            GIT_AUTHOR_EMAIL: 'system@workstack.com',
            GIT_COMMITTER_NAME: 'WorkStack System',
            GIT_COMMITTER_EMAIL: 'system@workstack.com'
        };

        try {
            // Write empty tree
            // const tree = await this.gitExec(repoName, ['mktree'], { input: '' }); // mktree might hang on stdin if not handled right
            // Easier: hash-object -t tree /dev/null
            // But we don't have /dev/null file. 
            // We can use `git mktree` with empty input.

            // Actually, simply:
            // git commit-tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904 -m "Initial commit"
            // (The magic SHA for empty tree is 4b825dc642cb6eb9a060e54bf8d69288fbee4904)
            const emptyTreeSha = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

            const commitSha = await this.pipeToGitEnv(repoName, ['commit-tree', emptyTreeSha, '-m', 'Initial commit'], '', env);

            // Update master
            await this.gitExec(repoName, ['update-ref', 'refs/heads/master', commitSha]);
            await this.gitExec(repoName, ['symbolic-ref', 'HEAD', 'refs/heads/master']);

        } catch (e) {
            console.error('Failed to create initial commit:', e);
            // Non-fatal, return anyway
        }

        return 'fs-vcs';
    }

    async getBranches(repoName: string): Promise<string[]> {
        // git for-each-ref --format='%(refname:short)' refs/heads/
        const out = await this.gitExec(repoName, ['for-each-ref', '--format=%(refname:short)', 'refs/heads/']);
        const branches = out.split('\n').filter(Boolean);

        // Also check/fix HEAD if it points to non-existent branch (e.g. master when only develop exists)
        if (branches.length > 0) {
            try {
                // Check where HEAD points
                const headRef = await this.gitExec(repoName, ['symbolic-ref', '--short', 'HEAD']);
                if (!branches.includes(headRef)) {
                    // HEAD is broken (e.g. master). Point it to first available branch (e.g. develop)
                    await this.gitExec(repoName, ['symbolic-ref', 'HEAD', `refs/heads/${branches[0]}`]);
                }
            } catch (e) {
                // symbolic-ref fails if detached HEAD or other issues, ignore
            }
        }

        return branches;
    }

    async createBranch(repoName: string, branchName: string, sourceBranch: string = 'master'): Promise<void> {
        // Validation: Verify source branch exists
        let validSource = sourceBranch;
        const branches = await this.getBranches(repoName);

        if (!branches.includes(sourceBranch)) {
            // If source is master but it's missing, try 'develop' or 'main' or the first available
            if (sourceBranch === 'master') {
                if (branches.includes('develop')) validSource = 'develop';
                else if (branches.includes('main')) validSource = 'main';
                else if (branches.length > 0) validSource = branches[0];
                else throw new Error('Repository is empty (no branches)');
            } else {
                throw new Error(`Source branch '${sourceBranch}' does not exist`);
            }
        }

        // git branch <name> <start-point>
        await this.gitExec(repoName, ['branch', branchName, validSource]);
    }

    async getCommits(repoName: string, branchName: string = 'master'): Promise<any[]> {
        // git log --pretty=format:'%H|%an|%ae|%at|%s' -n 50 <branch>
        const out = await this.gitExec(repoName, ['log', '--pretty=format:%H|%an|%ae|%at|%s', '-n', '50', branchName]);
        if (!out) return [];

        return out.split('\n').map(line => {
            const [hash, author, email, timestamp, ...msgParts] = line.split('|');
            return {
                hash,
                author,
                email,
                timestamp: new Date(parseInt(timestamp) * 1000),
                message: msgParts.join('|')
            };
        });
    }

    async getFileTree(repoName: string, ref: string = 'master'): Promise<any[]> {
        // Parse ref. Check if it has path like "master:src"
        let branch = ref;
        let folder = '';
        if (ref.includes(':')) {
            const parts = ref.split(':');
            branch = parts[0];
            folder = parts[1];
        }

        // Clean folder path. "src/" -> "src"
        if (folder.endsWith('/')) folder = folder.slice(0, -1);

        const treeRef = folder ? `${branch}:${folder}` : branch;
        const out = await this.gitExec(repoName, ['ls-tree', '-l', treeRef]);

        if (!out) return [];

        return out.split('\n').map(line => {
            const [meta, name] = line.split('\t');
            if (!meta) return null;
            // meta: "100644 blob sha size"
            const parts = meta.split(' ').filter(Boolean);
            const mode = parts[0];
            const type = parts[1];
            const sha = parts[2];
            const size = parts[3] === '-' ? '0' : parts[3];

            return {
                mode,
                type,
                sha,
                size,
                name
            };
        }).filter(Boolean);
    }

    async getBlob(repoName: string, sha: string): Promise<string> {
        // git cat-file -p <sha>
        return await this.gitExec(repoName, ['cat-file', '-p', sha]);
    }

    async getFileContent(repoName: string, sha: string): Promise<string> {
        return this.getBlob(repoName, sha);
    }

    async deleteBranch(repoName: string, branchName: string): Promise<void> {
        if (branchName === 'master') throw new Error('Cannot delete master');
        await this.gitExec(repoName, ['branch', '-D', branchName]);
    }

    async updateFile(repoName: string, filePath: string, content: string, message: string, user: any, branchName: string = 'master'): Promise<void> {
        // 1. Create Blob
        const blobSha = await this.pipeToGit(repoName, ['hash-object', '-w', '--stdin'], content);

        // 2. Setup Env for temp index
        const indexFile = path.resolve(GIT_ROOT, repoName, `temp_index_${Date.now()}`);
        const env = { ...process.env, GIT_INDEX_FILE: indexFile };

        try {
            // 3. Read HEAD to temp index (if branch exists)
            const branchExists = await this.gitExec(repoName, ['rev-parse', '--verify', branchName]);
            if (branchExists) {
                await this.gitExecEnv(repoName, ['read-tree', branchName], env);
            }

            // 4. Update Index with new file
            // --cacheinfo <mode> <object> <path>
            await this.gitExecEnv(repoName, ['update-index', '--add', '--cacheinfo', '100644', blobSha, filePath], env);

            // 5. Write Tree
            const treeSha = await this.gitExecEnv(repoName, ['write-tree'], env);

            // 6. Commit Tree
            const parentArgs = branchExists ? ['-p', branchExists] : [];
            const commitEnv = {
                ...env,
                GIT_AUTHOR_NAME: `${user.firstName} ${user.lastName}`,
                GIT_AUTHOR_EMAIL: user.email,
                GIT_COMMITTER_NAME: `${user.firstName} ${user.lastName}`,
                GIT_COMMITTER_EMAIL: user.email
            };

            const commitSha = await this.pipeToGitEnv(repoName, ['commit-tree', treeSha, '-m', message, ...parentArgs], '', commitEnv);

            // 7. Update Ref
            await this.gitExec(repoName, ['update-ref', `refs/heads/${branchName}`, commitSha]);

        } finally {
            if (require('fs').existsSync(indexFile)) {
                require('fs').unlinkSync(indexFile);
            }
        }
    }

    async getCommitsBetween(repoName: string, base: string, head: string): Promise<any[]> {
        // git log base..head
        const range = `${base}..${head}`;
        const out = await this.gitExec(repoName, ['log', '--pretty=format:%H|%an|%ae|%at|%s', range]);
        if (!out) return [];
        return out.split('\n').map(line => {
            const [hash, author, email, timestamp, ...msgParts] = line.split('|');
            return { hash, author, email, timestamp: new Date(parseInt(timestamp) * 1000), message: msgParts.join('|') };
        });
    }

    async getDiff(repoName: string, source: string, target: string): Promise<string> {
        // git diff target...source
        return await this.gitExec(repoName, ['diff', `${target}...${source}`]);
    }

    async mergeBranches(repoName: string, source: string, target: string): Promise<void> {
        const worktreePath = path.resolve(GIT_ROOT, `${repoName}_worktree_${Date.now()}`);
        try {
            // Create worktree
            await this.gitExec(repoName, ['worktree', 'add', worktreePath, target]);

            // Merge in worktree
            const mergeProc = spawn('git', ['merge', source, '--no-ff', '-m', `Merge ${source} into ${target}`], { cwd: worktreePath });

            await new Promise((resolve, reject) => {
                mergeProc.on('close', code => code === 0 ? resolve(true) : reject(new Error('Merge failed (conflict?)')));
            });
            // worktree checkout updates the branch ref if you commit.
        } finally {
            // Cleanup
            await this.gitExec(repoName, ['worktree', 'remove', '-f', worktreePath]);
        }
    }

    async listRepos(): Promise<string[]> {
        return [];
    }
}
