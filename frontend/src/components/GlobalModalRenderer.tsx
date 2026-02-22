import React, { useMemo } from 'react';
import { useModal, ModalType } from '../context/ModalContext';
import NewOrderModal from '../components/NewOrderModal';
import PromotionModal from '../components/PromotionModal';
import TransferModal from '../components/TransferModal';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import ReportViewerModal from '../components/ReportViewerModal';
import { UserDetailsModal } from '../components/UserDetailsModal';
import CustomerModal from '../components/CustomerModal';
import SupplierModal from '../components/SupplierModal';
import ProductModal from '../components/ProductModal';
import SupplierDetailsModal from '../components/SupplierDetailsModal';
import PurchaseModal from '../components/PurchaseModal';
import PurchasePaymentsModal from '../components/PurchasePaymentsModal';
import ExpenseModal from '../components/ExpenseModal';
import StaffModal from '../components/StaffModal';
import PrivilegeModal from '../components/PrivilegeModal';
import BranchModal from '../components/BranchModal';
import DeviceManagementModal from '../components/DeviceManagementModal';
import DeviceEditModal from '../components/DeviceEditModal';
import PaymentModal from '../components/PaymentModal';
import ReturnModal from '../components/ReturnModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Explicitly map types to components
const MODAL_COMPONENTS: Record<ModalType, React.ComponentType<any>> = {
    'NEW_ORDER': NewOrderModal,
    'PROMOTION': PromotionModal,
    'TRANSFER': TransferModal,
    'CUSTOMER_DETAILS': CustomerDetailsModal,
    'REPORT_VIEWER': ReportViewerModal,
    'USER_DETAILS': UserDetailsModal,
    'PRODUCT': ProductModal,
    'CUSTOMER': CustomerModal,
    'SUPPLIER': SupplierModal,
    'SUPPLIER_DETAILS': SupplierDetailsModal,
    'PURCHASE': PurchaseModal,
    'PURCHASE_PAYMENTS': PurchasePaymentsModal,
    'EXPENSE': ExpenseModal,
    'STAFF': StaffModal,
    'PRIVILEGES': PrivilegeModal,
    'BRANCH': BranchModal,
    'DEVICE_MANAGEMENT': DeviceManagementModal,
    'DEVICE_EDIT': DeviceEditModal,
    'PAYMENT': PaymentModal,
    'RETURN': ReturnModal,
    'CONFIRMATION': ConfirmationModal,
};

export function GlobalModalRenderer() {
    const { modals, closeModal, bringToFront } = useModal();

    return (
        <>
            {modals.map((modal) => {
                const Component = MODAL_COMPONENTS[modal.type];
                if (!Component) return null;

                return (
                    <div
                        key={modal.id}
                        className="absolute inset-0 pointer-events-none"
                        style={{ zIndex: modal.zIndex }}
                    >
                        {/* Wrapper to handle pointer events and coordinate "bring to front" on click */}
                        <div
                            className="pointer-events-auto"
                            onMouseDownCapture={() => bringToFront(modal.id)}
                        >
                            <Component
                                {...modal.props}
                                open={true} // Always valid since we only render if active
                                onClose={() => closeModal(modal.id)}
                                // Inject zIndex if component needs it directly
                                zIndex={modal.zIndex}
                            />
                        </div>
                    </div>
                );
            })}
        </>
    );
}
