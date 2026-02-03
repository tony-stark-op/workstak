'use client';

import {
    Folder,
    FileText,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface FileTreeProps {
    items: any[];
    onSelect: (item: any) => void;
    selectedSha?: string;
}

const FileTree = ({ items, onSelect, selectedSha }: FileTreeProps) => {
    // Simple flat list for now, ideally recursive for folders
    // Mapped to Glass Style

    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Explorer</div>
            {items.map((item) => {
                const isSelected = selectedSha === item.sha;
                const icon = item.type === 'tree'
                    ? <Folder size={16} className="text-teal-400 fill-teal-400/20" />
                    : <FileText size={16} className="text-blue-400" />;

                return (
                    <button
                        key={item.sha}
                        onClick={() => onSelect(item)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all text-left group ${isSelected
                            ? 'bg-teal-50 text-teal-800 font-medium'
                            : 'text-gray-600 hover:bg-white/40 hover:text-teal-700'}`}
                    >
                        {icon}
                        <span className="truncate">{item.name}</span>
                    </button>
                );
            })}
            {items.length === 0 && (
                <div className="px-4 py-4 text-xs text-center text-gray-400 italic">Empty directory</div>
            )}
        </div>
    );
};

export default FileTree;
