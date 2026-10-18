import React from "react";
import { BrandAmbientBackground } from "./brand-ambient-background";

export interface AuthBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function AuthBackground({ className = "", children }: AuthBackgroundProps) {
  return (
    <BrandAmbientBackground contentClassName={className}>
      {children}
    </BrandAmbientBackground>
  );
}