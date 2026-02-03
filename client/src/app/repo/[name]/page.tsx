'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTree, getCommits, getBlob } from '@/lib/api';
import {
    GitCommit,
    Copy,
    Download,
    Code,
    Clock,
    Layout,
    Search,
    FileText
} from 'lucide-react';
import FileTree from '@/components/FileTree';
import { motion } from 'framer-motion';

export default function RepoPage() {
    const { name } = useParams();

    // State
    const [activeTab, setActiveTab] = useState('code');
    const [items, setItems] = useState<any[]>([]);
    const [commits, setCommits] = useState<any[]>([]);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [showClone, setShowClone] = useState(false);

    useEffect(() => {
        if (activeTab === 'code') {
            loadTree();
        } else {
            loadCommits();
        }
    }, [name, activeTab]);

    const loadTree = async (sha = 'master') => {
        try {
            const data = await getTree(name as string, sha);
            // Sort: folders first
            data.sort((a: any, b: any) => (b.type === 'tree' ? 1 : 0) - (a.type === 'tree' ? 1 : 0));
            setItems(data);
            setFileContent(null);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
        }
    };

    const loadCommits = async () => {
        try {
            const data = await getCommits(name as string);
            setCommits(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleItemClick = async (item: any) => {
        if (item.type === 'tree') {
            loadTree(item.sha);
        } else {
            setSelectedFile(item);
            const content = await getBlob(name as string, item.sha);
            setFileContent(content);
        }
    };

    const cloneUrl = `http://localhost:4000/git/${name}`;

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="glass-panel px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                        <Code size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">{name}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><GitCommit size={12} /> master</span>
                            <span>•</span>
                            <span>Updated 2 days ago</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex p-1 bg-gray-100/50 rounded-lg mr-4">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'code' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Code
                        </button>
                        <button
                            onClick={() => setActiveTab('commits')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'commits' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            History
                        </button>
                    </div>

                    <button
                        onClick={() => { navigator.clipboard.writeText(cloneUrl); setShowClone(true); setTimeout(() => setShowClone(false), 2000) }}
                        className="glass-button flex items-center gap-2 text-xs"
                    >
                        <Copy size={14} /> {showClone ? 'Copied!' : 'Clone'}
                    </button>
                    <button className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                        Download
                    </button>
                </div>
            </div>

            {activeTab === 'code' ? (
                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Sidebar File Tree */}
                    <div className="w-64 glass-panel p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                            <input type="text" placeholder="Search files..." className="w-full bg-gray-50 border-none rounded-lg pl-9 p-2 text-xs outline-none focus:ring-1 focus:ring-teal-300" />
                        </div>
                        <FileTree items={items} onSelect={handleItemClick} selectedSha={selectedFile?.sha} />
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
                        {fileContent ? (
                            <div className="flex flex-col h-full">
                                <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white/40">
                                    <div className="flex items-center gap-2 text-sm font-mono text-gray-600">
                                        <FileText size={14} className="text-blue-500" />
                                        {selectedFile?.name}
                                    </div>
                                    <div className="text-xs text-gray-400">{selectedFile?.size} bytes</div>
                                </div>
                                <div className="flex-1 overflow-auto p-6 bg-white/30 font-mono text-sm leading-relaxed text-gray-800">
                                    <pre>{fileContent}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Layout size={32} className="opacity-50" />
                                </div>
                                <p>Select a file to view content</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="glass-panel flex-1 overflow-hidden flex flex-col p-0">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white/40 font-bold text-gray-700">Commit History</div>
                    <div className="overflow-y-auto flex-1">
                        {commits.map((commit, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={commit.hash}
                                className="px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-colors flex gap-4 group"
                            >
                                <div className="mt-1 flex flex-col items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-teal-400 transition-colors"></div>
                                    <div className="w-0.5 h-full bg-gray-100 group-last:hidden"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">{commit.message}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span className="font-medium text-gray-700">{commit.author}</span>
                                        <span>•</span>
                                        <span>{new Date(commit.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="font-mono text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 h-fit bg-white/50">
                                    {commit.hash.substring(0, 7)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
