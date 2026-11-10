import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-5xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full ${maxWidth} bg-neutral-900 p-6 sm:p-10 lg:p-12 rounded-3xl flex flex-col gap-6 sm:gap-8 my-auto max-h-[92vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl sm:text-2xl text-neutral-100 font-light pr-2">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-100 p-2.5 rounded-xl cursor-pointer transition-colors flex-shrink-0 bg-neutral-950 hover:bg-neutral-800"
              >
                <Cancel01Icon size={20} />
              </button>
            </div>
            <div>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
