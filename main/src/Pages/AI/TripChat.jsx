import React, { useState, useRef, useEffect } from "react";
import { getAIResponse, detectNavigationIntent, PLATFORM_PAGES } from "./tripChatService";
import { useNavigate } from "react-router-dom";

const TripChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hey! 👋 I'm **Trippy**, your AI travel assistant! Ask me about destinations, travel tips, or anything about the platform. Where shall we go? ✈️", isUser: false }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isTyping) return;

        const userMsg = { id: Date.now(), text, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const userContext = { user: user?._id ? user : null, currentPage: window.location.pathname.split('/')[1] || 'home' };
            const response = await getAIResponse(text, userContext, messages);

            // Check for navigation intent
            const navPage = detectNavigationIntent(text);

            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, text: response, isUser: false, navPage: navPage }
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, text: "Oops! Something went wrong. Try again? 😅", isUser: false }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNavigate = (page) => {
        const info = PLATFORM_PAGES[page];
        if (info) {
            navigate(info.path);
            setIsOpen(false);
        }
    };

    const renderMarkdown = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    const quickActions = [
        { label: "🏖️ Destinations", msg: "Suggest some amazing travel destinations" },
        { label: "💡 Tips", msg: "Give me some travel tips" },
        { label: "🧭 Navigate", msg: "Help me navigate the platform" },
    ];

    return (
        <>
            {/* Floating Chat Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group ${isOpen
                    ? 'bg-base-300 rotate-0 scale-90'
                    : 'bg-gradient-to-r from-primary to-secondary hover:scale-110 hover:shadow-primary/40'
                    }`}
                aria-label="Toggle Chat"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-base-content"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="white" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse border-2 border-base-100"></span>
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/[0.08] animate-scale-in"
                    style={{ background: 'rgba(15, 14, 26, 0.95)', backdropFilter: 'blur(20px)' }}>

                    {/* Header */}
                    <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-r from-primary/10 to-secondary/10">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="white" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">Trippy AI</h3>
                            <p className="text-[10px] text-success/80">Online • Powered by Gemini</p>
                        </div>
                        <button onClick={() => setMessages([messages[0]])} className="btn btn-ghost btn-circle btn-xs text-base-content/30 hover:text-base-content/60" title="Clear chat">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.isUser
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white rounded-br-md'
                                    : 'bg-white/[0.06] text-base-content/80 rounded-bl-md border border-white/[0.04]'
                                    }`}>
                                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />

                                    {/* Navigation button */}
                                    {msg.navPage && PLATFORM_PAGES[msg.navPage] && (
                                        <button
                                            onClick={() => handleNavigate(msg.navPage)}
                                            className="mt-2 btn btn-xs btn-primary btn-gradient gap-1 w-full"
                                        >
                                            🧭 Go to {PLATFORM_PAGES[msg.navPage].name}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md border border-white/[0.04]">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (show only when few messages) */}
                    {messages.length <= 2 && !isTyping && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(action.msg); }}
                                    className="btn btn-xs btn-outline border-white/10 hover:bg-white/5 whitespace-nowrap text-[11px] rounded-full"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="px-4 py-3 border-t border-white/[0.06]">
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Trippy anything..."
                                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-base-content/20 transition-colors max-h-20"
                                rows={1}
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="btn btn-circle btn-sm bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg shadow-primary/20 disabled:opacity-30 disabled:shadow-none hover:scale-105 transition-transform"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TripChat;
