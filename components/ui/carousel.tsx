"use client";

import {
  useState,
  useRef,
  useEffect,
  ReactNode,
  Children,
  useCallback,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
  children: ReactNode; // ✅ Corregido: ReactNode, no ReactNode[]
  itemWidth?: number;
  gap?: number;
  showControls?: boolean;
  className?: string;
  showDots?: boolean; // Nueva feature
  enableDrag?: boolean; // Nueva feature
  enableShiftScroll?: boolean; // Nueva feature
  showOverlays?: boolean; // Nueva feature (Netflix-style)
}

export function Carousel({
  children,
  itemWidth = 280,
  gap = 24,
  showControls = true,
  className = "",
  showDots = false,
  enableDrag = true,
  enableShiftScroll = true,
  showOverlays = true,
}: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ FIX 1: Convertir children a array correctamente
  const childrenArray = Children.toArray(children);
  const totalItems = childrenArray.length;

  console.log("[Carousel] childrenArray length:", totalItems);

  // ✅ FIX 2: Recalcular botones cuando children cambien O cuando animaciones terminen
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) {
      console.log("[Carousel] No scrollContainerRef");
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } =
      scrollContainerRef.current;

    console.log("[Carousel DEBUG] scrollWidth:", scrollWidth, "clientWidth:", clientWidth, "diff:", scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calcular índice actual basado en posición
    const itemTotalWidth = itemWidth + gap;
    const currentIdx = Math.round(scrollLeft / itemTotalWidth);
    setCurrentIndex(currentIdx);
  }, [itemWidth, gap]);

  // ✅ FIX 3: Ejecutar checkScrollButtons después de que animaciones terminen
  useEffect(() => {
    if (childrenArray.length === 0) return;

    // Ejecutar inmediatamente
    checkScrollButtons();

    // Re-ejecutar después de que las animaciones de motion terminen
    // Última card con index N-1 tarda: 300ms + (N-1) * 50ms
    const maxDelay = 300 + (childrenArray.length - 1) * 50;
    const timeoutId = setTimeout(checkScrollButtons, maxDelay + 100);

    // Listener para resize
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [childrenArray.length, checkScrollButtons]);

  // ✅ FIX 4: Observar cambios en el contenedor con ResizeObserver
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScrollButtons();
    });

    resizeObserver.observe(scrollContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollButtons]);

  // Scroll function - sin conflicto con snap
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = (itemWidth + gap) * 3; // Scroll 3 items
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });

    setTimeout(checkScrollButtons, 300);
  };

  // ✅ NUEVA FEATURE: Drag Scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDrag || !scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);

    // Cambiar cursor
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grabbing";
      scrollContainerRef.current.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplicador para más sensibilidad
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "auto";
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
        scrollContainerRef.current.style.userSelect = "auto";
      }
    }
  };

  // ✅ NUEVA FEATURE: Shift+Scroll horizontal
  const handleWheel = (e: React.WheelEvent) => {
    if (!enableShiftScroll || !scrollContainerRef.current) return;

    // Si presiona Shift, convertir scroll vertical en horizontal
    // NOTA: No podemos usar preventDefault() en wheel events pasivos
    if (e.shiftKey) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      checkScrollButtons();
    }
  };

  // ✅ NUEVA FEATURE: Touch drag para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableDrag || !scrollContainerRef.current) return;

    const touch = e.touches[0];
    setStartX(touch.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || startX === 0) return;

    const touch = e.touches[0];
    const x = touch.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (childrenArray.length === 0) {
    console.log("[Carousel] No children, returning null");
    return null;
  }

  console.log("[Carousel] Rendering carousel wrapper with", totalItems, "items");
  console.log("[Carousel] canScrollLeft:", canScrollLeft, "canScrollRight:", canScrollRight);

  return (
    <div className={`relative group ${className}`} style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      {/* ✅ FIX 5: Botones siempre visibles en desktop, ocultos en mobile */}
      {showControls && canScrollLeft && (
        <Button
          onClick={() => scroll("left")}
          variant="outline"
          size="icon"
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-gray-900/95 backdrop-blur-md border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 shadow-2xl rounded-full w-10 h-10 hidden md:flex items-center justify-center transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {showControls && canScrollRight && (
        <Button
          onClick={() => scroll("right")}
          variant="outline"
          size="icon"
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-gray-900/95 backdrop-blur-md border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 shadow-2xl rounded-full w-10 h-10 hidden md:flex items-center justify-center transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {/* ✅ NUEVA FEATURE: Gradient overlays estilo Netflix */}
      {showOverlays && (
        <>
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B0F1A] to-transparent pointer-events-none z-20 hidden md:block" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B0F1A] to-transparent pointer-events-none z-20 hidden md:block" />
          )}
        </>
      )}

      {/* ✅ FIX 7: Width-constrained wrapper - min-width: 0 prevents flex expansion */}
      <div className="w-full overflow-hidden" style={{ minWidth: 0 }}>
        {/* ✅ FIX 8: Carousel Container - SIN snap, SIN scroll-smooth de CSS */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onWheel={handleWheel}
          className={`flex overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 ${enableDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            minWidth: 0,
          }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: itemWidth,
                marginRight: index < childrenArray.length - 1 ? gap : 0,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ NUEVA FEATURE: Dots pagination */}
      {showDots && totalItems > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(totalItems / 3) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollContainerRef.current) {
                  const targetScroll = idx * (itemWidth + gap) * 3;
                  scrollContainerRef.current.scrollTo({
                    left: targetScroll,
                    behavior: "smooth",
                  });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 3) === idx
                  ? "bg-purple-500 w-8"
                  : "bg-gray-600 w-2 hover:bg-gray-500"
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
