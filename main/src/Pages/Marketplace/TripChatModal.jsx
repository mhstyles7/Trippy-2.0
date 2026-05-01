import API_BASE from '../../api';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, X, Loader } from 'lucide-react';

const timeStr = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const TripChatModal = ({ requestId, currentUser, destination, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_BASE}/trip-chat/${requestId}`);
            setMessages(res.data);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    // Initial load + polling every 4s
    useEffect(() => {
        if (!requestId) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000);
        return () => clearInterval(interval);
    }, [requestId]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            await axios.post(`${API_BASE}/trip-chat/${requestId}`, {
                senderId: currentUser._id,
                senderName: currentUser.name,
                text,
            });
            setInput('');
            await fetchMessages();
        } catch { /* silent */ } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div
                className="relative z-10 w-full sm:w-[420px] h-[520px] max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08] animate-scale-in"
                style={{ background: 'rgba(15,14,26,0.98)', backdropFilter: 'blur(24px)' }}
            >
                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-r from-primary/10 to-secondary/10 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                        <MessageCircle size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">Trip Chat</h3>
                        <p className="text-[10px] text-base-content/40 truncate">
                            {destination ? `Destination: ${destination}` : `Trip #${String(requestId).slice(-6)}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm opacity-40 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-full gap-2 opacity-40">
                            <Loader size={18} className="animate-spin" />
                            <span className="text-sm">Loading messages...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
                            <MessageCircle size={36} />
                            <p className="text-sm">No messages yet. Say hello!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUser._id;
                            return (
                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[78%] ${isMe ? '' : 'flex gap-2 items-end'}`}>
                                        {!isMe && (
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {msg.senderName?.[0] || '?'}
                                            </div>
                                        )}
                                        <div>
                                            {!isMe && (
                                                <p className="text-[10px] text-base-content/40 mb-1 ml-1">{msg.senderName}</p>
                                            )}
                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                isMe
                                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white rounded-br-sm'
                                                    : 'bg-white/[0.07] text-base-content/80 border border-white/[0.05] rounded-bl-sm'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <p className={`text-[10px] text-base-content/25 mt-1 ${isMe ? 'text-right' : 'text-left ml-1'}`}>
                                                {timeStr(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Type a message..."
                            rows={1}
                            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-base-content/20 transition-colors max-h-24"
                            disabled={sending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="btn btn-circle btn-sm bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg shadow-primary/20 disabled:opacity-30 hover:scale-105 transition-transform flex items-center justify-center"
                        >
                            {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripChatModal;
