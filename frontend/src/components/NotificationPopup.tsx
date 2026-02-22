import { X, Eye, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'device';
    is_read: number;
    action_url?: string;
    created_at: string;
}

interface NotificationPopupProps {
    notification: Notification | null;
    onClose: () => void;
    onView: () => void;
}

export default function NotificationPopup({ notification, onClose, onView }: NotificationPopupProps) {
    const navigate = useNavigate();

    if (!notification) return null;

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-success text-success';
            case 'warning':
                return 'border-warning text-warning';
            case 'error':
                return 'border-destructive text-destructive';
            case 'device':
                return 'border-info text-info';
            default:
                return 'border-primary text-primary';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'device':
                return <Bell className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const handleView = () => {
        onView();
        if (notification.action_url) {
            navigate(notification.action_url);
        } else {
            navigate('/notifications');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 animate-fade-in backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-scale-in">
                <div className={`neo-card bg-card p-0 overflow-hidden border shadow-xl ${getTypeStyles(notification.type)}`}>
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl border border-border shrink-0 ${getTypeStyles(notification.type)} bg-white dark:bg-black`}>
                                {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className="font-display font-bold text-xl mb-2 leading-tight">{notification.title}</h3>
                                <p className="text-base text-muted-foreground leading-relaxed">{notification.message}</p>
                                <p className="text-xs font-mono text-muted-foreground mt-3 opacity-70">
                                    {new Date(notification.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
                        <button
                            onClick={onClose}
                            className="neo-button flex-1 bg-background hover:bg-muted text-foreground"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={handleView}
                            className="neo-button flex-[2] bg-primary text-primary-foreground hover:brightness-110 flex items-center justify-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
