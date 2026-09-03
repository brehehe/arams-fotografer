import React, { useLayoutEffect, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    autoResize?: boolean;
    minRows?: number;
    maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            autoResize = true,
            minRows = 2,
            maxRows,
            value,
            defaultValue,
            onChange,
            rows,
            style,
            ...props
        },
        forwardedRef
    ) => {
        const innerRef = useRef<HTMLTextAreaElement | null>(null);

        useImperativeHandle(forwardedRef, () => innerRef.current!);

        const adjustHeight = useCallback(() => {
            const textarea = innerRef.current;
            if (!textarea || !autoResize) return;

            // Temporarily set height to auto to get the exact scrollHeight
            textarea.style.height = 'auto';

            const scrollHeight = textarea.scrollHeight;
            if (scrollHeight > 0) {
                textarea.style.height = `${scrollHeight}px`;
            }
        }, [autoResize]);

        useLayoutEffect(() => {
            adjustHeight();
            // Call in animation frame for when layout settles or fonts load
            const frameId = requestAnimationFrame(adjustHeight);
            return () => cancelAnimationFrame(frameId);
        }, [value, defaultValue, adjustHeight]);

        useEffect(() => {
            const textarea = innerRef.current;
            if (!textarea) return;

            const handleResize = () => adjustHeight();
            window.addEventListener('resize', handleResize);

            // Also observe element size mutations if supported
            let resizeObserver: ResizeObserver | null = null;
            if (typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(() => {
                    adjustHeight();
                });
                resizeObserver.observe(textarea);
            }

            return () => {
                window.removeEventListener('resize', handleResize);
                resizeObserver?.disconnect();
            };
        }, [adjustHeight]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            adjustHeight();
            if (onChange) {
                onChange(e);
            }
        };

        return (
            <textarea
                ref={innerRef}
                rows={rows ?? minRows}
                value={value}
                defaultValue={defaultValue}
                onChange={handleChange}
                style={{
                    fieldSizing: 'content',
                    overflowY: maxRows ? 'auto' : 'hidden',
                    ...style,
                    ...(maxRows ? { maxHeight: `${maxRows * 1.5}rem` } : {}),
                }}
                className={cn(
                    'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-[border-color,box-shadow]',
                    className
                )}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';
