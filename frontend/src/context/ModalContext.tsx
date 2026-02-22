import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ModalType =
    | 'NEW_ORDER'
    | 'PROMOTION'
    | 'TRANSFER'
    | 'CUSTOMER_DETAILS'
    | 'REPORT_VIEWER'
    | 'USER_DETAILS'
    | 'SUPPLIER_DETAILS'
    | 'DEVICE_MANAGEMENT'
    | 'PRODUCT'
    | 'CUSTOMER'
    | 'SUPPLIER'
    | 'PURCHASE'
    | 'PURCHASE_PAYMENTS'
    | 'EXPENSE'
    | 'STAFF'
    | 'PRIVILEGES'
    | 'BRANCH'
    | 'PAYMENT'
    | 'DEVICE_MANAGEMENT'
    | 'DEVICE_EDIT'
    | 'RETURN'
    | 'CONFIRMATION';

export interface ModalInstance {
    id: string;
    type: ModalType;
    props: any;
    zIndex: number;
}

interface ModalContextType {
    modals: ModalInstance[];
    openModal: <T = any>(type: ModalType, props?: T) => string;
    closeModal: (id: string) => void;
    bringToFront: (id: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modals, setModals] = useState<ModalInstance[]>([]);
    const [baseZIndex, setBaseZIndex] = useState(1000);

    const openModal = useCallback(<T = any>(type: ModalType, props?: T) => {
        const id = Math.random().toString(36).substr(2, 9);
        setBaseZIndex(prev => prev + 1);

        const newModal: ModalInstance = {
            id,
            type,
            props: props || {},
            zIndex: baseZIndex + 1
        };

        setModals(prev => [...prev, newModal]);
        return id;
    }, [baseZIndex]);

    const closeModal = useCallback((id: string) => {
        setModals(prev => prev.filter(modal => modal.id !== id));
    }, []);

    const bringToFront = useCallback((id: string) => {
        setBaseZIndex(prev => {
            const newZ = prev + 1;
            setModals(prevModals =>
                prevModals.map(m => m.id === id ? { ...m, zIndex: newZ } : m)
            );
            return newZ;
        });
    }, []);

    return (
        <ModalContext.Provider value={{ modals, openModal, closeModal, bringToFront }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
