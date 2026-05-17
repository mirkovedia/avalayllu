"use client";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = "" }: PageTransitionProps) => (
  <div className={`animate-fade-in-up ${className}`}>
    {children}
  </div>
);

export const StaggerContainer = ({ children, className = "" }: PageTransitionProps) => (
  <div className={className}>
    {children}
  </div>
);

export const StaggerItem = ({ children, className = "" }: PageTransitionProps) => (
  <div className={`animate-fade-in-up ${className}`}>
    {children}
  </div>
);
