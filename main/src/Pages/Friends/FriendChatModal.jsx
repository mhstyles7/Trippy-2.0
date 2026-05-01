import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Loader, MessageCircle } from 'lucide-react';
import API_BASE from '../../api';

// Deterministic room ID — same formula as backend
const getRoomId = (idA, idB) => [String(idA), String(idB)].sort().join('_');

const timeStr = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dayStr = (d) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const FriendChatModal = ({ friend, currentUser, onClose }) => {
    const roomId = getRoomId(currentUser._id, friend._id);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_BASE}/friend-chat/${roomId}`);
            setMessages(res.data);
            // Mark as read
            axios.patch(`${API_BASE}/friend-chat/${roomId}/read`, { userId: currentUser._id });
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        // Optimistic UI
        const optimistic = {
            _id: `opt-${Date.now()}`,
            senderId: currentUser._id,
            senderName: currentUser.name,
            text,
            createdAt: new Date().toISOString(),
            optimistic: true,
        };
        setMessages(prev => [...prev, optimistic]);
        setInput('');
        try {
            await axios.post(`${API_BASE}/friend-chat/${roomId}`, {
                senderId: currentUser._id,
                senderName: currentUser.name,
                senderPhoto: currentUser.photoURL || '',
                receiverId: friend._id,
                text,
            });
            await fetchMessages();
        } catch { /* silent */ } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // Group messages by day
    const grouped = messages.reduce((acc, msg) => {
        const day = dayStr(msg.createdAt);
        if (!acc[day]) acc[day] = [];
        acc[day].push(msg);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div
                className="relative z-10 w-full sm:w-[420px] h-[580px] max-h-[95vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08]"
                style={{ background: 'rgba(14,13,25,0.98)', backdropFilter: 'blur(30px)' }}
            >
                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-r from-primary/10 to-secondary/10 shrink-0">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                            <img
                                src={friend.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.name}`}
                                alt={friend.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{friend.name}</h3>
                        <p className="text-[10px] text-success/80">Active now</p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm opacity-40 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-full gap-2 opacity-40">
                            <Loader size={18} className="animate-spin" />
                            <span className="text-sm">Loading messages...</span>
                        </div>
                    ) : Object.keys(grouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                            <MessageCircle size={44} />
                            <p className="text-sm text-center">No messages yet.<br />Say hello to {friend.name.split(' ')[0]}!</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([day, msgs]) => (
                            <div key={day}>
                                {/* Day separator */}
                                <div className="flex items-center gap-3 my-3">
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <span className="text-[10px] text-base-content/30 px-2">{day}</span>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                </div>
                                {msgs.map((msg) => {
                                    const isMe = msg.senderId === currentUser._id;
                                    return (
                                        <div key={msg._id} className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!isMe && (
                                                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 shrink-0 self-end mb-1">
                                                    <img
                                                        src={friend.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.name}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className={`max-w-[72%] group`}>
                                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                    isMe
                                                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white rounded-br-sm'
                                                        : 'bg-white/[0.08] text-base-content/85 border border-white/[0.05] rounded-bl-sm'
                                                } ${msg.optimistic ? 'opacity-70' : ''}`}>
                                                    {msg.text}
                                                </div>
                                                <p className={`text-[10px] text-base-content/20 mt-0.5 ${isMe ? 'text-right' : 'text-left ml-1'}`}>
                                                    {timeStr(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
                    <div className="flex gap-2 items-end">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={`Message ${friend.name.split(' ')[0]}...`}
                            rows={1}
                            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-base-content/20 transition-colors max-h-28"
                            disabled={sending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="btn btn-circle btn-sm bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg shadow-primary/20 disabled:opacity-30 hover:scale-105 transition-transform flex items-center justify-center shrink-0"
                        >
                            {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendChatModal;
