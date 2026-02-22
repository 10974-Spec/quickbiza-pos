import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ModalProvider } from "@/context/ModalContext";
import { GlobalModalRenderer } from "@/components/GlobalModalRenderer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { setupAPI } from "@/services/setup";
import SetupWizard from "./pages/SetupWizard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Purchases from "./pages/Purchases";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import Staff from "./pages/Staff";
import Branches from "./pages/Branches";
import Transfers from "./pages/Transfers";
import Returns from "./pages/Returns";
import Accounting from "./pages/Accounting";
import Promotions from "./pages/Promotions";
import OnlineOrders from "./pages/OnlineOrders";
import Loyalty from "./pages/Loyalty";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
import Devices from "./pages/Devices";
import ExtraFeatures from "./pages/ExtraFeatures";
import FleetDashboard from "./pages/Fleet/Dashboard";
import PayrollSettings from './pages/Payroll/PayrollSettings';
import PayrollRun from './pages/Payroll/PayrollRun';
import PayrollEmployees from './pages/Payroll/PayrollEmployees';
import Payslips from './pages/Payroll/Payslips';
import NotFound from "./pages/NotFound";
import { toast } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";

const queryClient = new QueryClient();

// Deep Link Handler Component
const DeepLinkHandler = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    try {
      // @ts-ignore
      const { ipcRenderer } = window.require('electron');

      // Test IPC connection
      ipcRenderer.send('renderer-log', 'DeepLinkHandler attached and waiting for events');

      const handleDeepLink = (_: any, url: string) => {
        ipcRenderer.send('renderer-log', `Received deep link: ${url}`);
        console.log("Deep link received in renderer:", url);

        try {
          const urlObj = new URL(url);
          const params = new URLSearchParams(urlObj.search);
          const customProtocol = 'quickbiza://';

          // Handle 'quickbiza://setup-complete?token=...'
          if (url.startsWith(customProtocol + 'setup-complete')) {
            const token = params.get('token');
            const username = params.get('username');

            if (token && username) {
              ipcRenderer.send('renderer-log', `Processing setup-complete for user: ${username}`);
              loginWithToken(token, {
                id: 0, // Placeholder
                username,
                full_name: username,
                role: 'admin',
                permissions: []
              });
              toast.success("Setup Verified! Continuing configuration...");
              // Navigate to Setup Wizard but skip to branding
              ipcRenderer.send('renderer-log', `Navigating to /setup?step=4`);
              navigate('/setup?step=4');
            }
          }
          // Handle 'quickbiza://login?token=...'
          else if (url.startsWith(customProtocol + 'login')) {
            ipcRenderer.send('renderer-log', `Processing login`);
            const token = params.get('token');
            const username = params.get('username') || 'User';
            const userId = parseInt(params.get('userId') || '0');

            if (token) {
              loginWithToken(token, {
                id: userId,
                username,
                full_name: username,
                role: 'admin', // Assume admin permissions for now or fetch
                permissions: []
              });
              toast.success("Login via Browser Successful!");
              navigate('/');
            }
          }
          // Handle 'quickbiza://license-verified?key=...'
          else if (url.startsWith(customProtocol + 'license-verified')) {
            ipcRenderer.send('renderer-log', `Processing license verification`);
            const key = params.get('key');
            const token = params.get('token');
            const username = params.get('username') || 'Admin';
            const userId = parseInt(params.get('userId') || '1');

            if (key) {
              setupAPI.activateLicense(key)
                .then(() => {
                  toast.success("License Activated Successfully!");
                  if (token) {
                    loginWithToken(token, {
                      id: userId,
                      username: username,
                      full_name: username,
                      role: 'admin'
                    });
                    navigate('/');
                  } else {
                    navigate('/login');
                  }
                })
                .catch((err: any) => {
                  console.error("License activation failed via deep link", err);
                  toast.error("License Activation Failed: " + (err.response?.data?.error || err.message));
                });
            }
          }
        } catch (error) {
          // @ts-ignore
          ipcRenderer.send('renderer-log', `Error parsing deep link: ${error.message}`);
          console.error("Error parsing deep link:", error);
        }
      };

      ipcRenderer.on('deep-link', handleDeepLink);

      return () => {
        ipcRenderer.removeListener('deep-link', handleDeepLink);
      };
    } catch (error) {
      // Silent fail in browser mode - this is expected
      // console.warn("Electron IPC not available (Browser Mode?)");
    }
  }, [navigate, loginWithToken]);

  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ModalProvider>
            <GlobalModalRenderer />
            <HashRouter>
              <AuthProvider>
                <DeepLinkHandler />
                <Routes>
                  {/* Setup Route */}
                  <Route path="/setup" element={<SetupWizard />} />

                  {/* Authenticated Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                  <Route path="/production" element={<ProtectedRoute><Production /></ProtectedRoute>} />
                  <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                  <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                  <Route path="/staff" element={<ProtectedRoute requireRole={['admin']}><Staff /></ProtectedRoute>} />
                  <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
                  <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
                  <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
                  <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
                  <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
                  <Route path="/online-orders" element={<ProtectedRoute><OnlineOrders /></ProtectedRoute>} />
                  <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
                  <Route path="/extra-features" element={<ProtectedRoute><ExtraFeatures /></ProtectedRoute>} />
                  <Route path="/fleet" element={<ProtectedRoute requireModule="fleet"><FleetDashboard /></ProtectedRoute>} />

                  {/* Payroll Routes */}
                  <Route path="/payroll/settings" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />
                  <Route path="/payroll/employees" element={<ProtectedRoute><PayrollEmployees /></ProtectedRoute>} />
                  <Route path="/payroll/run" element={<ProtectedRoute><PayrollRun /></ProtectedRoute>} />
                  <Route path="/payroll/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />

                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </HashRouter>
          </ModalProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
