"use client"

import { Switch } from "@/components/ui/switch"

// Add this to your globals.css or component styles
const switchStyles = `
  /* Enhanced Switch Animations */
  @keyframes switch-thumb {
    0% { transform: translateX(0); }
    100% { transform: translateX(1.25rem); }
  }
  
  @keyframes switch-thumb-reverse {
    0% { transform: translateX(1.25rem); }
    100% { transform: translateX(0); }
  }
  
  .switch-thumb-animate {
    animation: switch-thumb 0.2s ease-in-out;
  }
  
  .switch-thumb-animate-reverse {
    animation: switch-thumb-reverse 0.2s ease-in-out;
  }

  /* Enhanced Progress Animations */
  @keyframes progress-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .progress-shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: progress-shimmer 2s infinite;
  }

  /* Enhanced Glow Effects */
  .glow-primary {
    box-shadow: 0 0 20px rgba(var(--primary), 0.3);
  }
  
  .glow-pulse {
    animation: pulse-glow 2s infinite;
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(var(--primary), 0.2); }
    50% { box-shadow: 0 0 30px rgba(var(--primary), 0.4); }
  }
`

export const EnhancedStyles = () => {
  return (
    <style jsx global>{switchStyles}</style>
  )
}