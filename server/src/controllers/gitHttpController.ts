import { Request, Response } from 'express';
import path from 'path';
import { spawn } from 'child_process';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const GIT_PROJECT_ROOT = path.resolve(process.env.GIT_REPOS_PATH || './vcs-data');
const GIT_HTTP_BACKEND = '/opt/homebrew/opt/git/libexec/git-core/git-http-backend';

export const handleGitRequest = async (req: Request, res: Response) => {
    // Basic Auth Check
    const authHeader = req.headers['authorization'];
    let user = null;

    if (authHeader) {
        const [scheme, credentials] = authHeader.split(' ');
        if (scheme === 'Basic' && credentials) {
            const [email, password] = Buffer.from(credentials, 'base64').toString().split(':');
            try {
                const dbUser = await User.findOne({ email });
                if (dbUser && await bcrypt.compare(password, dbUser.passwordHash)) {
                    user = dbUser;
                }
            } catch (error) {
                console.error('Auth error:', error);
            }
        }
    }

    // Access Control Logic
    // For MVP: Require Auth for Push (receive-pack), Allow Public Pull (upload-pack) unless private repo.
    // To keep it simple: Require Auth for everything or just Write?
    // User requested "Secure Git Operations". Let's secure WRITE operations at minimum.
    // Actually, "Enterprise VCS" implies Private by default. Let's protect EVERYTHING for now to test the Auth flow.
    // Or better: Let's follow standard pattern:
    // If request asks for auth (401), git client prompts.

    // We strictly enforce auth for now to verify it Works.
    if (!user) {
        res.setHeader('WWW-Authenticate', 'Basic realm="WorkStack VCS"');
        return res.status(401).send('Authentication required');
    }

    const pathInfo = req.path; // query string is stripped automatically

    const env = {
        ...process.env,
        'GIT_PROJECT_ROOT': GIT_PROJECT_ROOT,
        'GIT_HTTP_EXPORT_ALL': '1',
        'REMOTE_USER': user.email,
        'CONTENT_TYPE': req.headers['content-type'] || '',
        'QUERY_STRING': req.originalUrl.split('?')[1] || '',
        'REQUEST_METHOD': req.method,
        'PATH_INFO': pathInfo,
    };

    // Pass standard headers
    if (req.headers['content-length']) {
        Object.assign(env, { 'CONTENT_LENGTH': req.headers['content-length'] });
    }

    console.log(`[Git] Spawning ${GIT_HTTP_BACKEND} for ${pathInfo} (User: ${user.email})`);

    const git = spawn(GIT_HTTP_BACKEND, [], { env: env as any });

    req.pipe(git.stdin);

    let headersSent = false;
    let buffer = Buffer.alloc(0);
    const HEADER_SEPARATOR = Buffer.from('\r\n\r\n');

    git.stdout.on('data', (chunk) => {
        if (headersSent) {
            res.write(chunk);
            return;
        }

        buffer = Buffer.concat([buffer, chunk]);
        const separatorIndex = buffer.indexOf(HEADER_SEPARATOR);

        if (separatorIndex !== -1) {
            const headerPart = buffer.subarray(0, separatorIndex).toString('utf8');
            const bodyPart = buffer.subarray(separatorIndex + HEADER_SEPARATOR.length);

            // Parse and set headers
            headerPart.split('\r\n').forEach(line => {
                const [key, value] = line.split(': ');
                if (key && value) {
                    if (key.toLowerCase() === 'status') {
                        const statusCode = parseInt(value.split(' ')[0], 10);
                        if (!isNaN(statusCode)) res.status(statusCode);
                    } else {
                        res.setHeader(key, value);
                    }
                }
            });

            headersSent = true;
            if (bodyPart.length > 0) {
                res.write(bodyPart);
            }
        }
    });

    git.stdout.on('end', () => {
        res.end();
    });

    git.stderr.on('data', (data) => {
        console.error(`[Git Error] ${data}`);
    });

    git.on('exit', (code) => {
        if (code !== 0) {
            console.error(`[Git] Exited with code ${code}`);
            if (!headersSent) res.status(500).end();
        }
    });
};
