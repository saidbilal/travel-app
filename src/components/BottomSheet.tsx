import { useEffect, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from 'react';

interface Props {
  open: boolean;
  onClose(): void;
  children: ReactNode;
  /** Accessible label for the dialog */
  label: string;
  className?: string;
  /** Element rendered above the scrollable body (stays put while scrolling) */
  header?: ReactNode;
}

/**
 * Mobile bottom sheet (becomes a floating side panel on wide screens).
 * Drag the handle/header down to dismiss.
 */
export function BottomSheet({ open, onClose, children, label, className = '', header }: Props) {
  const [dragY, setDragY] = useState(0);
  const start = useRef<{ y: number; t: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Keep closed sheets out of the tab order / accessibility tree.
  useEffect(() => {
    if (sectionRef.current) sectionRef.current.inert = !open;
  }, [open]);

  useEffect(() => {
    if (open) bodyRef.current?.scrollTo({ top: 0 });
    setDragY(0);
  }, [open, children]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onPointerDown = (e: RPointerEvent) => {
    if (window.matchMedia('(min-width: 768px)').matches) return;
    if ((e.target as HTMLElement).closest('button, a')) return;
    start.current = { y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent) => {
    if (!start.current) return;
    setDragY(Math.max(0, e.clientY - start.current.y));
  };
  const onPointerUp = (e: RPointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    const v = dy / Math.max(1, performance.now() - start.current.t);
    start.current = null;
    if (dy > 90 || (dy > 30 && v > 0.5)) onClose();
    else setDragY(0);
  };

  return (
    <section
      className={`sheet ${open ? 'is-open' : ''} ${dragY ? 'is-dragging' : ''} ${className}`}
      style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      role="dialog"
      aria-label={label}
      ref={sectionRef}
      aria-hidden={!open}
    >
      <div
        className="sheet__grab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="sheet__handle" aria-hidden />
        {header}
      </div>
      <div className="sheet__body" ref={bodyRef}>
        {children}
      </div>
    </section>
  );
}
