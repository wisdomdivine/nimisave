import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown01Icon, Tick01Icon } from 'hugeicons-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs text-neutral-400">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-neutral-900 hover:bg-neutral-850 text-neutral-100 px-4 py-3 text-sm rounded-xl flex items-center justify-between transition-colors cursor-pointer"
      >
        <span className="truncate mr-2">{selectedOption ? selectedOption.label : 'Select option'}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-neutral-400 flex-shrink-0"
        >
          <ArrowDown01Icon size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-neutral-900 p-2 rounded-2xl flex flex-col gap-1 max-h-64 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-neutral-100'
                  }`}
                >
                  <div className="flex flex-col pr-2">
                    <span className="truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="text-xs text-neutral-400 truncate">{opt.description}</span>
                    )}
                  </div>
                  {isSelected && <Tick01Icon size={16} className="text-neutral-100 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
