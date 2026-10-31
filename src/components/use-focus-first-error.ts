import * as React from "react";

/**
 * Moves focus to the first invalid field after a submit. On a phone it can be
 * off-screen, and focus is what makes a screen reader read the error out.
 */
export function useFocusFirstError(
  formRef: React.RefObject<HTMLFormElement | null>,
  state: unknown,
) {
  React.useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [formRef, state]);
}
