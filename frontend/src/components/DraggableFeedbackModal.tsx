import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Image as ImageIcon, CheckCircle, Lightbulb } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

export const DraggableFeedbackModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    const [message, setMessage] = useState('');
    const [type, setType] = useState('suggestion');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPosition({
                x: Math.max(0, Math.min(window.innerWidth - 400, dragRef.current.initialX + dx)),
                y: Math.max(0, Math.min(window.innerHeight - 500, dragRef.current.initialY + dy))
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y };
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return toast.error("Please enter your feedback");

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', 'feedback');
            formData.append('feedbackType', type);
            formData.append('message', message);
            formData.append('user_id', user?.id || 'unknown');
            formData.append('username', user?.username || 'unknown');
            formData.append('company', 'QuickBiza POS Instance');

            if (screenshot) {
                formData.append('screenshot', screenshot);
            }

            await api.post('/feedback', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setMessage('');
                setScreenshot(null);
            }, 2000);
        } catch (err) {
            toast.error("Failed to send feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed z-[100] w-[380px] neo-card shadow-2xl bg-card border-2 border-primary overflow-hidden transition-shadow"
            style={{ left: position.x, top: position.y, cursor: isDragging ? 'grabbing' : 'default' }}
        >
            {/* Draggable Header */}
            <div
                className="bg-primary px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing text-primary-foreground"
                onMouseDown={handleDragStart}
            >
                <div className="flex items-center gap-2 font-display font-bold">
                    <Lightbulb className="w-4 h-4" />
                    Feedback & Suggestions
                </div>
                <button onClick={onClose} className="hover:bg-primary-foreground/20 p-1 rounded transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5">
                {submitted ? (
                    <div className="text-center py-8 animate-fade-in">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Thank you!</h3>
                        <p className="text-sm text-muted-foreground">Your feedback has been sent to our development team.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold mb-2">Category</label>
                            <select
                                className="neo-input w-full p-2"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="suggestion">Idea / Suggestion</option>
                                <option value="bug">Report a Bug / Error</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-2">Your Message</label>
                            <textarea
                                className="neo-input w-full p-3 min-h-[100px] resize-none"
                                placeholder="What's happening? Be as detailed as possible..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <div className="border-2 border-dashed border-border rounded p-4 text-center hover:bg-muted/50 transition-colors">
                            <input
                                type="file"
                                id="screenshot-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                <span className="text-xs font-semibold text-primary">
                                    {screenshot ? screenshot.name : "Attach Screenshot (Optional)"}
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="neo-button bg-primary text-primary-foreground w-full flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? "Sending..." : "Send Feedback"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
