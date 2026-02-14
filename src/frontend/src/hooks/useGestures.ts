import { useRef, useCallback, useEffect } from 'react';

export interface GestureHandlers {
  onSwipe?: (deltaX: number, deltaY: number) => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  onTap?: () => void;
  onCircular?: (angle: number) => void;
}

export function useGestures(handlers: GestureHandlers) {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialDistance = useRef<number>(0);
  const centerPoint = useRef<{ x: number; y: number } | null>(null);
  const lastAngle = useRef<number>(0);

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: TouchList) => {
    if (touches.length < 2) return null;
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const getAngle = (x: number, y: number, centerX: number, centerY: number) => {
    return Math.atan2(y - centerY, x - centerX);
  };

  const handleStart = useCallback((e: TouchEvent | PointerEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      // Pinch start
      initialDistance.current = getTouchDistance(e.touches);
      centerPoint.current = getTouchCenter(e.touches);
    } else {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      startPos.current = { x: clientX, y: clientY };
      lastPos.current = { x: clientX, y: clientY };
      touchStartTime.current = Date.now();

      // Long press detection
      if (handlers.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          handlers.onLongPress?.();
        }, 500);
      }
    }
  }, [handlers]);

  const handleMove = useCallback((e: TouchEvent | PointerEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      // Pinch gesture
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const currentDistance = getTouchDistance(e.touches);
      if (initialDistance.current > 0 && handlers.onPinch) {
        const scale = currentDistance / initialDistance.current;
        handlers.onPinch(scale);
      }

      // Circular gesture detection
      const center = getTouchCenter(e.touches);
      if (center && centerPoint.current && handlers.onCircular) {
        const angle = getAngle(
          e.touches[0].clientX,
          e.touches[0].clientY,
          centerPoint.current.x,
          centerPoint.current.y
        );
        
        if (lastAngle.current !== 0) {
          let angleDiff = angle - lastAngle.current;
          // Normalize angle difference
          if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          handlers.onCircular(angleDiff);
        }
        lastAngle.current = angle;
      }
    } else if (startPos.current && lastPos.current) {
      // Swipe gesture
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (handlers.onSwipe) {
        const deltaX = clientX - lastPos.current.x;
        const deltaY = clientY - lastPos.current.y;
        handlers.onSwipe(deltaX, deltaY);
      }

      lastPos.current = { x: clientX, y: clientY };
    }
  }, [handlers]);

  const handleEnd = useCallback((e: TouchEvent | PointerEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (startPos.current && lastPos.current) {
      const timeDiff = Date.now() - touchStartTime.current;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
      
      const dx = clientX - startPos.current.x;
      const dy = clientY - startPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Tap detection
      if (timeDiff < 300 && distance < 10 && handlers.onTap) {
        handlers.onTap();
      }
    }

    startPos.current = null;
    lastPos.current = null;
    initialDistance.current = 0;
    centerPoint.current = null;
    lastAngle.current = 0;
  }, [handlers]);

  return {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onPointerDown: handleStart,
    onPointerMove: handleMove,
    onPointerUp: handleEnd,
  };
}
