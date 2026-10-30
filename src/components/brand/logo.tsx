import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  /** Mark size in px (DBD section 6: 32px in the app header). */
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 32, showWordmark = true, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.svg"
        alt={showWordmark ? "" : "Fixmaster"}
        width={size}
        height={size}
        unoptimized
      />
      {showWordmark && (
        <span className="text-h2 font-semibold text-text">Fixmaster</span>
      )}
    </span>
  );
}
