import { useRef, useCallback, useEffect, useState } from 'react';

interface UseResizablePanelsReturn {
  videoWidth: number;
  isDragging: boolean;
  startResize: (e: React.MouseEvent) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useResizablePanels = (initialVideoWidth: number = 60): UseResizablePanelsReturn => {
  const [videoWidth, setVideoWidth] = useState(initialVideoWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newVideoWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain to reasonable bounds (20% to 80%)
    const constrainedWidth = Math.max(20, Math.min(80, newVideoWidth));
    setVideoWidth(constrainedWidth);
  }, [isDragging]);

  const stopResize = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, stopResize]);

  return {
    videoWidth,
    isDragging,
    startResize,
    containerRef
  };
};
