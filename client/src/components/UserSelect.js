'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Search, Check, ChevronDown, User } from 'lucide-react';
import clsx from 'clsx';

export default function UserSelect({
    selectedUserId,
    onChange,
    placeholder = "Unassigned"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    // Fetch all users
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/auth/users')).data, // Need to ensure endpoint exists
        staleTime: 5 * 60 * 1000
    });

    const selectedUser = users.find(u => u._id === selectedUserId);

    // Filter users
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (userId) => {
        onChange(userId);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-zinc-700 transition-colors focus:ring-2 focus:ring-purple-500 outline-none"
            >
                <div className="flex items-center space-x-2 overflow-hidden">
                    {selectedUser ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white shrink-0">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start truncate">
                                <span className="text-sm font-medium leading-tight">{selectedUser.name}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                <User size={14} className="text-zinc-400" />
                            </div>
                            <span className="text-sm text-zinc-400">{placeholder}</span>
                        </>
                    )}
                </div>
                <ChevronDown size={16} className="text-zinc-500 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="p-2 border-b border-zinc-800">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-2.5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full bg-zinc-800 text-sm pl-8 pr-3 py-1.5 rounded border border-transparent focus:border-purple-500 outline-none placeholder-zinc-500 text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="overflow-y-auto flex-1 p-1">
                        <button
                            type="button"
                            onClick={() => handleSelect(null)}
                            className="w-full flex items-center px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 rounded transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-2">
                                <User size={12} />
                            </div>
                            Unassigned
                        </button>

                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() => handleSelect(user._id)}
                                    className={clsx(
                                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors",
                                        selectedUserId === user._id ? "bg-purple-900/20 text-purple-200" : "text-zinc-300 hover:bg-zinc-800"
                                    )}
                                >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white shrink-0">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-start truncate">
                                            <span className="font-medium leading-tight">{user.name}</span>
                                            <span className="text-[10px] text-zinc-500">{user.email}</span>
                                        </div>
                                    </div>
                                    {selectedUserId === user._id && <Check size={14} className="text-purple-500 shrink-0" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-zinc-500">No users found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
