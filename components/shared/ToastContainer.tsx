"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeToast } from '@/store/slices/uiSlice';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export function ToastContainer() {
    const toasts = useAppSelector(state => state.ui.toasts);
    const dispatch = useAppDispatch();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(removeToast(toast.id))} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: any, onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />,
        error: <XCircle className="text-red-500 w-5 h-5 shrink-0" />,
        warning: <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0" />,
        info: <Info className="text-blue-500 w-5 h-5 shrink-0" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-md p-4 flex flex-row items-center gap-3 rounded-md pointer-events-auto"
        >
            {icons[toast.type as keyof typeof icons] || icons.info}
            <p className="text-[var(--text-sm)] text-[var(--color-text-primary)] font-medium flex-1 m-0">{toast.message}</p>
            <button onClick={onClose} className="p-1 shrink-0 opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors">
                <X className="w-4 h-4 text-[var(--color-text-primary)]" />
            </button>
        </motion.div>
    );
}
