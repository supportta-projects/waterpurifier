import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onClick, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      // For date inputs, open the picker when clicking anywhere on the field
      if (type === "date" && inputRef.current && !props.disabled) {
        // Always open the picker when clicking on date input (including the custom icon area)
        event.preventDefault();
        requestAnimationFrame(() => {
          if (inputRef.current) {
            // Try to open the date picker using the showPicker API if available
            if ("showPicker" in HTMLInputElement.prototype && typeof inputRef.current.showPicker === "function") {
              try {
                inputRef.current.showPicker();
                return;
              } catch (err) {
                // showPicker might throw if input is disabled or not allowed by user gesture
                // Fallback to focus and click
              }
            }
            // Fallback: focus the input which should trigger native picker behavior
            inputRef.current.focus();
            // Trigger a click event on the input to open the picker
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            inputRef.current.dispatchEvent(clickEvent);
          }
        });
      }
      onClick?.(event);
    };

    // Special styling for date inputs to position calendar icon on the right
    const isDateInput = type === "date";
    
    return (
      <div className={cn("relative", isDateInput && "w-full")}>
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-full border border-input bg-white/90 text-sm text-foreground shadow-inner shadow-black/5 transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
            isDateInput ? "pr-12 pl-5 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden" : "px-5",
            className,
          )}
          ref={combinedRef}
          onClick={handleClick}
          {...props}
        />
        {isDateInput && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

