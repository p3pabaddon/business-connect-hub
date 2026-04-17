import { useEffect, useRef, useState, CSSProperties } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealOptions {
  threshold?: number;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: RevealDirection;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    threshold = 0.15,
    delay = 0,
    duration = 700,
    distance = 40,
    direction = "up",
    once = true,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getTransform = (): string => {
    switch (direction) {
      case "up": return `translateY(${distance}px)`;
      case "down": return `translateY(-${distance}px)`;
      case "left": return `translateX(${distance}px)`;
      case "right": return `translateX(-${distance}px)`;
      case "none": return "scale(0.95)";
    }
  };

  const style: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0) translateX(0) scale(1)" : getTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return { ref, style, isVisible };
}

// Wrapper component for easy use
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 40,
  threshold = 0.15,
  as: Tag = "div",
}: ScrollRevealProps) {
  const { ref, style } = useScrollReveal<HTMLDivElement>({
    direction,
    delay,
    duration,
    distance,
    threshold,
  });

  return (
    // @ts-ignore
    <Tag ref={ref} style={style} className={className}>
      {children}
    </Tag>
  );
}
