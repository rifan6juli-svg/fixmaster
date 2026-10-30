"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  Toaster as Sonner,
  toast,
  type ExternalToast,
  type ToasterProps,
} from "sonner";

// sonner announces every toast politely. Errors must interrupt (DBD section 5),
// so toastError() announces through this assertive region instead.
const announceListeners = new Set<(message: string) => void>();

function AssertiveAnnouncer() {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const listener = (next: string) => {
      // Clear first so repeating the same message is announced again.
      setMessage("");
      requestAnimationFrame(() => setMessage(next));
    };
    announceListeners.add(listener);
    return () => {
      announceListeners.delete(listener);
    };
  }, []);

  return (
    <div role="alert" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

// Theme follows the OS (DBD section 2: no manual toggle), so no next-themes.
// Success and error use the badge rule (token color at 12% over the surface)
// so a failure never looks like a save.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      <Sonner
        theme="system"
        duration={4000}
        closeButton
        richColors
        containerAriaLabel="Notifikasi"
        mobileOffset={{
          bottom:
            "calc(16px + var(--fm-bottom-bar-height) + env(safe-area-inset-bottom))",
        }}
        className="toaster group"
        toastOptions={{
          closeButtonAriaLabel: "Tutup notifikasi",
          // 20px button, 44px hit area (DBD section 5).
          classNames: { closeButton: "before:absolute before:-inset-3" },
        }}
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        style={
          {
            "--normal-bg": "var(--color-surface-raised)",
            "--normal-text": "var(--color-text)",
            "--normal-border": "var(--color-border)",
            "--success-bg":
              "color-mix(in oklab, var(--color-success) 12%, var(--color-surface-raised))",
            "--success-text": "var(--color-success)",
            "--success-border":
              "color-mix(in oklab, var(--color-success) 40%, var(--color-surface-raised))",
            "--error-bg":
              "color-mix(in oklab, var(--color-danger) 12%, var(--color-surface-raised))",
            "--error-text": "var(--color-danger)",
            "--error-border":
              "color-mix(in oklab, var(--color-danger) 40%, var(--color-surface-raised))",
            "--border-radius": "var(--radius-lg)",
          } as React.CSSProperties
        }
        {...props}
      />
      <AssertiveAnnouncer />
    </>
  );
};

/**
 * Error toasts stay until closed (AFD section 5); success toasts use the 4s default.
 * Pass `action` for a recovery step, e.g. "Muat ulang" or "Tambah sebagai part non-stok".
 */
function toastError(
  message: string,
  options?: Pick<ExternalToast, "action" | "description">,
) {
  announceListeners.forEach((announce) => announce(message));
  // Hidden from assistive tech: the assertive region above already announced it.
  return toast.error(<span aria-hidden="true">{message}</span>, {
    duration: Infinity,
    ...options,
  });
}

export { Toaster, toast, toastError };
