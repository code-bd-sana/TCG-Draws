"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseDraggableModalOptions {
  resetKey?: any;
  minVisibleX?: number;
  minVisibleY?: number;
  lockScroll?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

export function useDraggableModal(
  isOpen: boolean,
  options: UseDraggableModalOptions = {}
) {
  const {
    resetKey,
    minVisibleX = 80,
    minVisibleY = 40,
    lockScroll = true,
    closeOnEscape = true,
    onClose,
  } = options;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Clamp position to ensure modal stays comfortably within the viewport
  const clampPosition = useCallback(
    (x: number, y: number) => {
      if (typeof window === "undefined") return { x, y };

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const modalWidth = modalRef.current?.offsetWidth || 400;
      const modalHeight = modalRef.current?.offsetHeight || 300;

      // Allow dragging but keep at least minVisibleX visible on left/right
      const minX = -screenWidth / 2 + minVisibleX;
      const maxX = screenWidth / 2 - minVisibleX;

      // Keep header visible: don't let modal slip above top edge or below bottom edge
      const minY = -screenHeight / 2 + minVisibleY;
      const maxY = screenHeight / 2 - minVisibleY;

      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      };
    },
    [minVisibleX, minVisibleY]
  );

  // Reset position whenever modal opens or resetKey changes
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, resetKey]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!lockScroll) return;

    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    }
  }, [isOpen, lockScroll]);

  // Close on Escape key press
  useEffect(() => {
    if (!closeOnEscape || !isOpen || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Clamp position on window resize to ensure responsiveness across orientation/viewport changes
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setPosition((prev) => {
        if (prev.x === 0 && prev.y === 0) return prev;
        return clampPosition(prev.x, prev.y);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, clampPosition]);

  // Drag listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      const rawX = dragStartRef.current.initialX + dx;
      const rawY = dragStartRef.current.initialY + dy;

      setPosition(clampPosition(rawX, rawY));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (e.cancelable) {
        e.preventDefault(); // Prevent page scroll during modal drag
      }

      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;

      const rawX = dragStartRef.current.initialX + dx;
      const rawY = dragStartRef.current.initialY + dy;

      setPosition(clampPosition(rawX, rawY));
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isDragging, clampPosition]);

  const handleStartDrag = (
    clientX: number,
    clientY: number,
    target: EventTarget | null
  ) => {
    // Prevent dragging when clicking interactive elements
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, input, select, textarea, label, [role='button']")
    ) {
      return;
    }

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
    setIsDragging(true);
  };

  const dragHandleProps = {
    onMouseDown: (e: React.MouseEvent) => {
      if (e.button === 0) {
        handleStartDrag(e.clientX, e.clientY, e.target);
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    },
    onDoubleClick: () => setPosition({ x: 0, y: 0 }),
  };

  const modalStyle: React.CSSProperties = {
    transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0)`,
    transition: isDragging
      ? "none"
      : "transform 0.12s ease-out, box-shadow 0.2s ease",
  };

  const isMoved = position.x !== 0 || position.y !== 0;

  return {
    modalRef,
    position,
    setPosition,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition: () => setPosition({ x: 0, y: 0 }),
  };
}
