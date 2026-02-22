import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, GripHorizontal } from 'lucide-react';

interface DraggableModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    initialPosition?: { x: number; y: number };
    className?: string; // Allow custom cleanup
    width?: string;
}

// Global Z-Index counter to manage stacking order
let globalZIndex = 1000;

export const DraggableModal: React.FC<DraggableModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    initialPosition = { x: 100, y: 100 },
    className = "",
    width = "400px",
    zIndex: externalZIndex
}: DraggableModalProps & { zIndex?: number }) => {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 }); // Relative position of cursor within the header
    const [internalZIndex, setInternalZIndex] = useState(globalZIndex);
    const modalRef = useRef<HTMLDivElement>(null);

    // Use external zIndex if provided, otherwise use internal state
    const currentZIndex = externalZIndex ?? internalZIndex;

    useEffect(() => {
        if (isOpen && externalZIndex === undefined) {
            // Bring to front on open only if not controlled externally
            globalZIndex += 1;
            setInternalZIndex(globalZIndex);
        }
    }, [isOpen, externalZIndex]);

    const bringToFront = () => {
        if (externalZIndex !== undefined) return; // Managed externally

        if (internalZIndex !== globalZIndex) {
            globalZIndex += 1;
            setInternalZIndex(globalZIndex);
        }
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        bringToFront();
        setIsDragging(true);
        setRel({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            // Calculate new position
            let newX = e.clientX - rel.x;
            let newY = e.clientY - rel.y;

            // Optional: Boundary checks (keep at least header visible)
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Allow some flexibility but prevent losing it completely
            if (newY < 0) newY = 0; // Don't go above top
            // if (newY > windowHeight - 50) newY = windowHeight - 50;
            // if (newX < -300) newX = -300; 

            setPosition({
                x: newX,
                y: newY
            });
            e.stopPropagation();
            e.preventDefault();
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: currentZIndex }}
        >
            <div
                ref={modalRef}
                className={`pointer-events-auto absolute neo-modal flex flex-col max-h-[90vh] ${className}`}
                style={{
                    left: position.x,
                    top: position.y,
                    width: width
                }}
                onMouseDown={bringToFront} // Bring to front when clicking anywhere on the modal
            >
                <div
                    className="neo-modal-header p-3 cursor-move flex items-center justify-between select-none"
                    onMouseDown={onMouseDown}
                >
                    <div className="flex items-center gap-2 font-display font-bold">
                        <GripHorizontal className="w-5 h-5 text-muted-foreground" />
                        <span>{title}</span>
                    </div>
                    <button
                        onClick={onClose}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                        className="p-1 hover:bg-black/10 rounded-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-white rounded-b-xl">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
