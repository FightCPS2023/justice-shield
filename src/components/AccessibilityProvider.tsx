// Accessibility Provider and Utilities for WCAG 2.1 Level AA Compliance
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (elementId: string) => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (size: 'normal' | 'large' | 'x-large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  // Apply font size
  useEffect(() => {
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-x-large');
    document.documentElement.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  // Announce message to screen readers
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Focus management utility
  const focusElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
    }, 100);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        announceMessage,
        focusElement,
        highContrastMode,
        setHighContrastMode,
        reducedMotion,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Screen Reader Only Text Component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Skip to Content Link (for keyboard navigation)
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// Live Region Component for dynamic updates
export function LiveRegion({ 
  children, 
  priority = 'polite',
  atomic = true 
}: { 
  children: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Accessible Icon Button
export function AccessibleIconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={className}
      type="button"
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

// Focus Trap Component for modals
export function FocusTrap({ children, active }: { children: React.ReactNode; active: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

// Accessible Heading Component with proper hierarchy
export function AccessibleHeading({
  level,
  children,
  className = '',
  id,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  );
}
