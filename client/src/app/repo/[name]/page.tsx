'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTree, getCommits, getBlob, getBranches, updateFile, createBranch, deleteBranch, deleteRepo } from '@/lib/api';
import {
    GitCommit,
    Copy,
    Download,
    Code,
    Layout,
    Search,
    FileText,
    GitBranch,
    Edit2,
    Save,
    X,
    Folder,
    GitPullRequest,
    Plus,
    Trash2,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import FileTree from '@/components/FileTree';
import { motion, AnimatePresence } from 'framer-motion';

export default function RepoPage() {
    const { name } = useParams();
    const router = useRouter();

    // State
    const [activeTab, setActiveTab] = useState('code');
    const [branches, setBranches] = useState<string[]>(['master']);
    const [currentBranch, setCurrentBranch] = useState('master');
    const [currentPath, setCurrentPath] = useState(''); // Tracking path for navigation

    // File Browser State
    const [items, setItems] = useState<any[]>([]);
    const [commits, setCommits] = useState<any[]>([]);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [showClone, setShowClone] = useState(false);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [commitMessage, setCommitMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadBranches();
    }, [name]);

    useEffect(() => {
        if (activeTab === 'code') {
            loadTree(currentPath);
        } else {
            if (activeTab === 'commits') loadCommits();
            if (activeTab === 'code') loadTree(currentPath);
        }
    }, [name, activeTab, currentBranch, currentPath]);

    const loadBranches = async () => {
        try {
            const data = await getBranches(name as string);
            setBranches(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadTree = async (pathStr = currentPath) => {
        try {
            // Use path-based tree fetching
            // Backend getTree takes `treeSha`. We can pass `branch:path`
            // If pathStr is empty, use currentBranch
            // If pathStr is 'src/', use 'master:src/'

            // Clean path: remove trailing slash for git command if needed, but 'master:src' is better than 'master:src/'
            const cleanPath = pathStr.endsWith('/') ? pathStr.slice(0, -1) : pathStr;
            const ref = cleanPath ? `${currentBranch}:${cleanPath}` : currentBranch;

            const data = await getTree(name as string, ref);

            // Sort: folders first
            data.sort((a: any, b: any) => (b.type === 'tree' ? 1 : 0) - (a.type === 'tree' ? 1 : 0));
            setItems(data);
        } catch (err) {
            console.error(err);
            setItems([]); // Empty on error (e.g. empty folder or invalid path)
        }
    };

    const loadCommits = async () => {
        try {
            const data = await getCommits(name as string, currentBranch);
            setCommits(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleItemClick = async (item: any) => {
        if (item.type === 'tree') {
            // Folder clicked: navigate into it
            const newPath = currentPath + item.name + '/';
            setCurrentPath(newPath);
            setSelectedFile(null);
            setFileContent(null);
        } else {
            // File clicked
            setSelectedFile(item);
            setIsEditing(false); // Reset edit mode
            const content = await getBlob(name as string, item.sha);
            setFileContent(content);
            setEditContent(content);
        }
    };

    const navigateToPath = (pathStr: string) => {
        setCurrentPath(pathStr);
        setSelectedFile(null);
        setFileContent(null);
        setIsEditing(false);
    };

    const handleCreate = (type: 'file' | 'folder') => {
        const nameInput = prompt(`Enter ${type} name:`);
        if (!nameInput) return;

        if (type === 'file') {
            // Mock selected file to open editor
            // We need full path for saving
            const fullPath = currentPath + nameInput;
            setSelectedFile({ name: nameInput, pendingPath: fullPath }); // Store pending path
            setEditContent('');
            setFileContent(''); // Empty for new file
            setIsEditing(true);
        } else {
            // Create folder (via .gitkeep)
            createFolder(nameInput);
        }
    };

    const createFolder = async (folderName: string) => {
        try {
            const fullPath = currentPath + folderName + '/.gitkeep';
            await updateFile(name as string, {
                filePath: fullPath,
                content: '',
                message: `Create folder ${folderName}`,
                branch: currentBranch
            });
            // Refresh
            loadTree(currentPath);
        } catch (err) {
            console.error(err);
            alert('Failed to create folder');
        }
    }

    const handleSave = async () => {
        if (!commitMessage) return alert('Commit message required');
        setIsSaving(true);
        try {
            // Determine full path
            // If selectedFile has pendingPath (new file), use it
            // Else use currentPath + selectedFile.name
            const filePath = selectedFile.pendingPath || (currentPath + selectedFile.name);

            await updateFile(name as string, {
                filePath: filePath,
                content: editContent,
                message: commitMessage,
                branch: currentBranch
            });

            setIsEditing(false);
            setCommitMessage('');
            setIsSaving(false);

            // If we created a file, we should probably switch to the view mode of it
            // or just reload the tree.
            // If it was a new file, reload tree to show it
            if (selectedFile.pendingPath) {
                loadTree(currentPath);
                // Update selectedFile to match what it would be (without pendingPath)
                setSelectedFile({ ...selectedFile, pendingPath: undefined });
                setFileContent(editContent);
            } else {
                // Determine new SHA? logic is complex without backend return.
                // Optimistic update
                setFileContent(editContent);
            }

            alert('Committed successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
            setIsSaving(false);
        }
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const gitBase = baseUrl.replace(/\/api\/?$/, ''); // Strip /api suffix
    const cloneUrl = `${gitBase}/git/${name}.git`;

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600">
                        <Folder size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{name}</h1>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            {/* Branch Selector */}
                            <div className="relative group z-30">
                                <button className="flex items-center gap-1.5 hover:text-indigo-600 font-medium bg-white border border-gray-200 shadow-sm px-2.5 py-1 rounded-lg transition-all active:scale-95">
                                    <GitBranch size={14} className="text-gray-400 group-hover:text-indigo-500" />
                                    {currentBranch}
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-1 transform origin-top-left group-hover:scale-100 scale-95 origin-top-left">
                                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">Select Branch</div>
                                    <div className="max-h-48 overflow-y-auto mb-2">
                                        {branches.map(b => (
                                            <div key={b} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 group/item transition-colors">
                                                <button
                                                    onClick={() => setCurrentBranch(b)}
                                                    className="flex-1 text-left text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-2"
                                                >
                                                    {b}
                                                    {b === currentBranch && <CheckMarker />}
                                                </button>
                                                {b !== 'master' && b !== currentBranch && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`Delete branch ${b}?`)) {
                                                                try {
                                                                    await deleteBranch(name as string, b);
                                                                    loadBranches();
                                                                } catch (err) { alert('Failed to delete'); }
                                                            }
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-100 pt-2 px-2 pb-2">
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                const form = e.target as HTMLFormElement;
                                                const input = form.elements.namedItem('newBranch') as HTMLInputElement;
                                                const newBranchName = input.value.trim();
                                                if (!newBranchName) return;

                                                try {
                                                    await createBranch(name as string, { branchName: newBranchName, sourceBranch: currentBranch });
                                                    await loadBranches(); // Refresh list
                                                    setCurrentBranch(newBranchName); // Switch to new
                                                    input.value = '';
                                                } catch (err: any) {
                                                    const msg = err.response?.data?.error || 'Failed to create branch';
                                                    alert(msg);
                                                    console.error(err);
                                                }
                                            }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                name="newBranch"
                                                placeholder="New branch..."
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()} // Prevent closing dropdown if we handled that logic (css group-hover handles it though so interact carefully)
                                            />
                                            <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                                <Plus size={12} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span>Updated recently</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm mr-4">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'code' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            Code
                        </button>
                        <button
                            onClick={() => setActiveTab('commits')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'commits' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Settings size={14} />
                        </button>
                        <Link
                            href={`/repo/${name}/pull-requests`}
                            className="px-4 py-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-2"
                        >
                            <GitPullRequest size={14} /> Pull Requests
                        </Link>
                    </div>

                    <button
                        onClick={() => { navigator.clipboard.writeText(cloneUrl); setShowClone(true); setTimeout(() => setShowClone(false), 2000) }}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Copy size={14} /> {showClone ? 'Copied!' : 'Clone'}
                    </button>
                    <button className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center gap-2 active:scale-95">
                        <Download size={14} /> Download
                    </button>
                </div>
            </div>

            {activeTab === 'settings' && (
                <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Repository Settings</h2>

                    <div className="border border-red-100 bg-red-50 rounded-xl p-6">
                        <h3 className="text-red-800 font-bold mb-2">Danger Zone</h3>
                        <p className="text-sm text-red-600 mb-4">Once you delete a repository, there is no going back. Please be certain.</p>
                        <button
                            onClick={async () => {
                                if (confirm('Are you absolutely sure you want to delete this repository?')) {
                                    try {
                                        await deleteRepo(name as string);
                                        // Redirect to repositories
                                        window.location.href = '/repositories';
                                    } catch (err) {
                                        alert('Failed to delete repo');
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                        >
                            Delete Repository
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'code' ? (
                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Sidebar File Tree */}
                    <div className="w-72 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Search..." className="w-full bg-white border border-gray-200 rounded-xl pl-9 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-gray-400" />
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleCreate('file')}
                                    title="New File"
                                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                >
                                    <FileText size={14} />
                                    <span className="sr-only">New File</span>
                                </button>
                                <button
                                    onClick={() => handleCreate('folder')}
                                    title="New Folder"
                                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                >
                                    <Folder size={14} />
                                    <span className="sr-only">New Folder</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <FileTree items={items} onSelect={handleItemClick} selectedSha={selectedFile?.sha} />
                        </div>
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
                        {/* Breadcrumbs */}
                        {!isEditing && (
                            <div className="px-6 py-3 border-b border-gray-50 bg-white flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <button
                                    onClick={() => navigateToPath('')}
                                    className={`font-bold hover:text-indigo-600 transition-colors ${currentPath === '' ? 'text-gray-800' : 'text-gray-500'}`}
                                >
                                    {name}
                                </button>
                                {currentPath.split('/').filter(Boolean).map((part, index, arr) => {
                                    const pathTillNow = arr.slice(0, index + 1).join('/') + '/';
                                    return (
                                        <div key={pathTillNow} className="flex items-center gap-2">
                                            <span className="text-gray-300">/</span>
                                            <button
                                                onClick={() => navigateToPath(pathTillNow)}
                                                className={`font-medium hover:text-indigo-600 transition-colors ${index === arr.length - 1 && !selectedFile ? 'text-gray-800 font-bold' : 'text-gray-500'}`}
                                            >
                                                {part}
                                            </button>
                                        </div>
                                    );
                                })}
                                {selectedFile && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">/</span>
                                        <span className="text-gray-800 font-bold">{selectedFile.name}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {fileContent || isEditing ? (
                            <div className="flex flex-col h-full">
                                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{selectedFile?.name || (isEditing ? 'New File' : 'Selected File')}</div>
                                            {!isEditing && <div className="text-[10px] text-gray-400">{selectedFile?.size} bytes</div>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                <Edit2 size={12} /> Edit File
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <X size={12} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="flex-1 flex flex-col bg-white">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="flex-1 p-6 font-mono text-sm outline-none resize-none text-gray-800 leading-relaxed"
                                            spellCheck={false}
                                        />
                                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 items-center">
                                            <input
                                                placeholder="Commit message (e.g. Update readme)"
                                                value={commitMessage}
                                                onChange={e => setCommitMessage(e.target.value)}
                                                className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                                            />
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                <Save size={14} /> Commit Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-auto p-8 bg-white font-mono text-sm leading-relaxed text-gray-800">
                                        <pre>{fileContent}</pre>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                    <Layout size={32} className="opacity-40 text-gray-500" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-gray-900 font-bold text-lg mb-1">No File Selected</h3>
                                    <p className="text-sm">Select a file from the tree to view its content</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col p-0">
                    <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 font-bold text-gray-800 flex justify-between items-center">
                        <span className="flex items-center gap-2"><GitCommit size={18} className="text-indigo-500" /> Commit History</span>
                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-500 font-mono flex items-center gap-1 shadow-sm">
                            <GitBranch size={10} /> {currentBranch}
                        </span>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {commits.map((commit, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={commit.hash}
                                className="px-6 py-4 border-b border-gray-50/50 hover:bg-gray-50/80 rounded-xl transition-all flex gap-4 group cursor-default"
                            >
                                <div className="mt-1 flex flex-col items-center gap-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-indigo-500 transition-all group-hover:scale-125"></div>
                                    <div className="w-0.5 h-full bg-gray-100 group-last:hidden"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors text-sm">{commit.message}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1.5">
                                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                                            {commit.author?.[0] || 'U'}
                                        </div>
                                        <span className="font-medium text-gray-600">{commit.author}</span>
                                        <span>•</span>
                                        <span>{new Date(commit.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="font-mono text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-1 h-fit bg-gray-50 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                        {commit.hash.substring(0, 7)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function CheckMarker() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
    )
}
