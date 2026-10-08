"use client";

import React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ checked, onChange, disabled, className = "" }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    checked={checked}
    onCheckedChange={onChange}
    disabled={disabled}
    className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full bg-zinc-200 outline-none transition-colors data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 ${className}`}
  >
    <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
  </SwitchPrimitive.Root>
));

Switch.displayName = "Switch";

export default Switch;
