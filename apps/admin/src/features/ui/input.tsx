import * as React from "react";

import { cn } from "@/lib/utils";
import type { HTMLInputTypeAttribute } from "react";
import { Button } from "@/features/ui/button.tsx";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [currentType, setCurrentType] = React.useState<
    HTMLInputTypeAttribute | undefined
  >(type);

  return (
    <div className="relative w-full">
      <input
        type={currentType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
          {
            "pr-9": type === "password",
          },
        )}
        {...props}
      />
      {type === "password" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="bg-background absolute h-7 w-7 right-1 top-1/2 -translate-y-1/2 text-muted-foreground focus:text-primary"
          onClick={() =>
            setCurrentType(currentType === "password" ? "text" : "password")
          }
        >
          {currentType === "password" ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
      )}
    </div>
  );
}

export { Input };
