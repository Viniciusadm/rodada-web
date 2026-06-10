import { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = React.ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  trailing?: React.ReactNode;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ id, label, error, className, trailing, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              trailing && "pr-10",
              className,
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AuthField.displayName = "AuthField";
