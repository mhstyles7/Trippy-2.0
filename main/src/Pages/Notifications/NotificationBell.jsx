import API_BASE from '../../api';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Users, ShoppingBag, CheckCircle, X, BellOff } from 'lucide-react';

const TYPE_ICON = {
    friend_request: <Users size={14} className="text-primary" />,
    friend_accepted: <CheckCircle size={14} className="text-success" />,
    new_offer: <ShoppingBag size={14} className="text-secondary" />,
    offer_accepted: <CheckCircle size={14} className="text-warning" />,
};

const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const panelRef = useRef(null);

    // Read user once and whenever localStorage changes
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?._id) setUserId(user._id);
    }, []);

    // Poll every 10s
    useEffect(() => {
        if (!userId) return;
        const fetchNotifs = async () => {
            try {
                const res = await axios.get(`${API_BASE}/notifications/${userId}`);
                setNotifications(res.data);
            } catch (e) { /* silent */ }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async () => {
        if (!userId || unreadCount === 0) return;
        try {
            await axios.post(`${API_BASE}/notifications/mark-read/${userId}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { /* silent */ }
    };

    if (!userId) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(!open); if (!open) markRead(); }}
                className="btn btn-ghost btn-circle relative hover:bg-white/10 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className={unreadCount > 0 ? 'text-primary' : 'text-base-content/60'} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none border border-base-100 animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl shadow-black/30 border border-white/[0.08] z-[60] overflow-hidden animate-scale-in"
                    style={{ background: 'rgba(15,14,26,0.97)', backdropFilter: 'blur(20px)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            <Bell size={14} className="text-primary" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="badge badge-primary badge-xs">{unreadCount} new</span>
                            )}
                        </h3>
                        <button onClick={() => setOpen(false)} className="btn btn-ghost btn-xs btn-circle opacity-40 hover:opacity-100">
                            <X size={14} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
                                <BellOff size={32} />
                                <p className="text-xs">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] transition-colors ${!notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/[0.03]'}`}
                                >
                                    <div className="mt-0.5 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                                        {TYPE_ICON[notif.type] || <Bell size={14} className="text-base-content/40" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-relaxed ${!notif.read ? 'text-base-content/90' : 'text-base-content/50'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-base-content/30 mt-1">{timeAgo(notif.createdAt)}</p>
                                    </div>
                                    {!notif.read && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-white/[0.06]">
                            <button
                                onClick={markRead}
                                className="text-xs text-base-content/40 hover:text-primary transition-colors w-full text-left"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
