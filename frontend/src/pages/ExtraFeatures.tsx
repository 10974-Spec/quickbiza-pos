import { AppLayout } from "@/components/AppLayout";
import { Truck, Crown, Check, Shield, X, Loader2, CreditCard, Phone, Bed } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";
import { useNavigate } from "react-router-dom";
import { useLicense } from "@/hooks/useLicense";
import axios from "axios";
import Draggable from "react-draggable";
import { useQueryClient } from "@tanstack/react-query";

const ExtraFeatures = () => {
    const { openModal } = useModal();
    const navigate = useNavigate();
    const { hasModule } = useLicense();
    const queryClient = useQueryClient();

    // Check real license state
    const isFleetActive = hasModule('fleet');

    const nodeRef = useRef(null);
    const notifyRef = useRef(null);

    const [showPayment, setShowPayment] = useState(false);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSubscribe = () => {
        setShowPayment(true);
    };

    const processPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate M-Pesa STK Push
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call Backend to Unlock
            const res = await axios.post('/api/setup/license/upgrade', { module: 'fleet' });

            if (res.data.success) {
                toast.success("Payment Successful! Fleet Management Unlocked.");
                // Invalidate query to refresh license
                await queryClient.invalidateQueries({ queryKey: ['licenseModules'] });
                setShowPayment(false);
                // Optional: Auto-redirect
                // navigate('/fleet');
            } else {
                throw new Error(res.data.error || "Unlock failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Payment Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-up relative">
                <div>
                    <h1 className="text-2xl font-display font-bold">Extra Features</h1>
                    <p className="text-sm text-muted-foreground">Supercharge your POS with premium add-ons</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Fleet Management Card */}
                    <div className="neo-card p-6 flex flex-col h-full border-2 border-primary/20 hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Truck className="w-8 h-8 text-primary" />
                            </div>
                            <span className="neo-badge bg-primary text-primary-foreground">
                                Premium
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-xl mb-2">Fleet Management</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow">
                            Monitor and manage your company vehicles in real-time. Track drivers, optimize routes, monitor fuel usage, and reduce operational costs.
                        </p>

                        <div className="space-y-3 mb-6">
                            {[
                                "Real-time vehicle tracking",
                                "Route playback & history",
                                "Maintenance alerts",
                                "Driver performance monitoring",
                                "Theft prevention"
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-end gap-1 mb-4">
                                <span className="text-2xl font-bold">KES 2,000</span>
                                <span className="text-sm text-muted-foreground mb-1">/ month</span>
                            </div>

                            {isFleetActive ? (
                                <button
                                    onClick={() => navigate('/fleet')}
                                    className="neo-button w-full bg-success text-success-foreground hover:bg-success/90"
                                >
                                    <Shield className="w-4 h-4 mr-2 inline" />
                                    Go to Dashboard
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    className="neo-button w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <Crown className="w-4 h-4 mr-2 inline" />
                                    Subscribe Now
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Placeholder for future features */}
                    <div className="neo-card p-6 flex flex-col h-full opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-muted rounded-xl">
                                <Crown className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <span className="neo-badge">
                                Coming Soon
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-xl mb-2">Advanced Analytics</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow">
                            Deep dive into your business performance with AI-powered insights and forecasting.
                        </p>

                        <button className="neo-button w-full mt-auto" onClick={() => setShowNotify(true)}>
                            Notify Me
                        </button>
                    </div>

                    {/* Room Booking System (Coming Soon) */}
                    <div className="neo-card p-6 flex flex-col h-full opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-muted rounded-xl">
                                <Bed className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <span className="neo-badge">
                                Coming Soon
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-xl mb-2">Room Booking System</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow">
                            Manage room availability, reservations, payments, and check-ins for hotels, offices, or Airbnb-style accommodations.
                        </p>

                        <button className="neo-button w-full mt-auto" onClick={() => setShowNotify(true)}>
                            Notify Me
                        </button>
                    </div>
                </div>

                {/* Payment Floating Window */}
                {showPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <Draggable handle=".modal-handle" nodeRef={nodeRef}>
                            <div ref={nodeRef} className="pointer-events-auto bg-card text-foreground rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border">
                                {/* Header (Draggable Handle) */}
                                <div className="modal-handle p-6 border-b border-border flex justify-between items-center cursor-move bg-muted/30">
                                    <h3 className="font-display font-bold text-lg">Unlock Fleet Management</h3>
                                    <button
                                        onClick={() => setShowPayment(false)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-primary">Total Amount</span>
                                            <span className="text-lg font-bold text-primary">KES 2,000</span>
                                        </div>
                                        <p className="text-xs text-primary/80">Monthly subscription. Cancel anytime.</p>
                                    </div>

                                    <form onSubmit={processPayment} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">M-Pesa Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="tel"
                                                    placeholder="07..."
                                                    required
                                                    value={phoneNumber}
                                                    onChange={e => setPhoneNumber(e.target.value)}
                                                    className="w-full pl-10 p-2.5 bg-background border border-input rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full neo-button bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Pay with M-Pesa
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <div className="p-4 bg-muted/50 border-t border-border text-center text-xs text-muted-foreground">
                                    Secure payment processed by M-Pesa.
                                </div>
                            </div>
                        </Draggable>
                    </div>
                )}

                {/* Notify Me Floating Window */}
                {showNotify && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <Draggable handle=".modal-handle" nodeRef={notifyRef}>
                            <div ref={notifyRef} className="pointer-events-auto bg-card text-foreground rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-border">
                                <div className="modal-handle p-6 border-b border-border flex justify-between items-center cursor-move bg-muted/30">
                                    <h3 className="font-display font-bold text-lg">Get Notified</h3>
                                    <button onClick={() => setShowNotify(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-muted-foreground mb-4">Enter your email to get early access when this feature launches.</p>
                                    <input
                                        type="email"
                                        placeholder="Enter your best email address"
                                        value={notifyEmail}
                                        onChange={(e) => setNotifyEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!notifyEmail || !notifyEmail.includes('@')) return toast.error("Please enter a valid email address");
                                            toast.success("Thanks! We'll notify you soon.");
                                            setShowNotify(false);
                                            setNotifyEmail('');
                                        }}
                                        className="neo-button w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </Draggable>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default ExtraFeatures;
