import React, { useRef, useEffect, useCallback } from 'react';

interface CJKInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Input that correctly handles CJK IME composition by switching between
 * controlled and uncontrolled modes during composition.
 */
export default function CJKInput({ value, onValueChange, ...props }: CJKInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (inputRef.current && !isComposingRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    onValueChange(e.currentTarget.value);
  }, [onValueChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isComposingRef.current) {
      onValueChange(e.target.value);
    }
  }, [onValueChange]);

  return (
    <input
      ref={inputRef}
      {...props}
      defaultValue={value}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
    />
  );
}
