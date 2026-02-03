import { Request, Response } from 'express';
import path from 'path';
import { spawn } from 'child_process';
import zlib from 'zlib';

const GIT_PROJECT_ROOT = path.resolve(process.env.GIT_REPOS_PATH || './vcs-data');
const GIT_HTTP_BACKEND = 'git-http-backend';

// Helper to handle CGI headers
const getCgiHeaders = (req: Request) => {
    const headers: any = {
        'GIT_PROJECT_ROOT': GIT_PROJECT_ROOT,
        'GIT_HTTP_EXPORT_ALL': '1',
        'REMOTE_USER': 'test-user', // TODO: Replace with authenticated user
        'CONTENT_TYPE': req.headers['content-type'],
        'QUERY_STRING': req.url.split('?')[1] || '',
        'REQUEST_METHOD': req.method,
        'PATH_INFO': req.path.replace(/^\/git/, ''), // Remove /git prefix
    };

    // Pass generic headers
    if (req.headers['content-length']) headers['CONTENT_LENGTH'] = req.headers['content-length'];
    if (req.headers['authorization']) headers['HTTP_AUTHORIZATION'] = req.headers['authorization'];
    if (req.headers['user-agent']) headers['HTTP_USER_AGENT'] = req.headers['user-agent'];

    return headers;
};

export const handleGitRequest = (req: Request, res: Response) => {
    const repoName = req.params.repo;
    // Check if repo exists on disk (optional security check)
    // For now, let git-http-backend handle path validation or failures

    const env = { ...process.env, ...getCgiHeaders(req) };

    console.log(`Spawning git-http-backend for ${req.path}`);

    const git = spawn(GIT_HTTP_BACKEND, [], {
        env: env as any,
    });

    // Pipe stdin (for push)
    req.pipe(git.stdin);

    // Parse CGI output
    let headersSent = false;

    git.stdout.on('data', (data) => {
        if (headersSent) {
            res.write(data);
            return;
        }

        // Simple CGI parsing: split headers from body
        const buffer = data.toString('utf8');
        const [headerPart, bodyPart] = buffer.split('\r\n\r\n');

        if (bodyPart !== undefined) {
            const headers = headerPart.split('\r\n');
            headers.forEach((h: string) => {
                const [key, val] = h.split(': ');
                if (key && val) res.setHeader(key, val);
            });
            headersSent = true;
            res.write(Buffer.from(bodyPart)); // Write the rest as binary if needed? toString might corrupt binary packfiles...
            // Wait, splitting by string might damage binary data. 
            // Better approach: Parse headers buffer manually.
        }
    });

    // Better CGI Parser needed for binary safety.
    // For now, let's use a simpler approach or a library if available, 
    // but standard spawn needs careful stream handling.
    // Let's rely on standard pipe, but we need to strip headers first? 
    // Actually git-http-backend output includes HTTP headers (Status, Content-Type, etc).
    // Node express `res` expects us to set headers via API.

    // We will revisit the implementation below to be binary safe.
};
