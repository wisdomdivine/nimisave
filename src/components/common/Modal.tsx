import React, { useEffect, useState } from 'react';
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
  const [isMouseDownOnBackdrop, setIsMouseDownOnBackdrop] = useState(false);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsMouseDownOnBackdrop(true);
    } else {
      setIsMouseDownOnBackdrop(false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDownOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
    setIsMouseDownOnBackdrop(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-sm overflow-y-auto cursor-pointer"
        >
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} bg-neutral-900 p-6 sm:p-10 lg:p-12 rounded-3xl flex flex-col gap-6 sm:gap-8 my-auto max-h-[92vh] overflow-y-auto cursor-default`}
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
