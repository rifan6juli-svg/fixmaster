import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Plain text on purpose: the owner reads it out or sends it to the staff member.
export function TempPasswordField({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  return (
    <Field
      label="Password sementara"
      hint="Minimal 8 karakter. Staf wajib menggantinya saat login."
      error={error}
    >
      {(control) => (
        <Input
          {...control}
          name="tempPassword"
          autoComplete="off"
          defaultValue={defaultValue}
          required
        />
      )}
    </Field>
  );
}
