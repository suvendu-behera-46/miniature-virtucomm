"use client";

import { createContext, useContext, useRef, useState, useTransition, type ReactNode } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { buttonClass, dangerButtonClass } from "@/components/admin/ui";

export type ActionState = { error?: string; success?: string };
type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

const PendingContext = createContext(false);

// Submits through a transition instead of <form action> so React does not reset
// the fields when the action returns a validation error.
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  confirmMessage,
}: {
  action: ServerAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  confirmMessage?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await action(state, formData);
          setState(result ?? {});
          if (result?.success && resetOnSuccess) formRef.current?.reset();
        });
      }}
    >
      <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>
      {state.error && <p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{state.error}</p>}
      {state.success && !pending && (
        <p role="status" className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" /> {state.success}</p>
      )}
    </form>
  );
}

export function SubmitButton({ children, className = buttonClass, danger = false }: { children: ReactNode; className?: string; danger?: boolean }) {
  const pending = useContext(PendingContext);
  return (
    <button type="submit" disabled={pending} className={danger ? dangerButtonClass : className}>
      {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// A one-button form for actions like delete, with a confirmation prompt.
export function ActionButton({
  action,
  fields,
  children,
  confirmMessage,
  danger = false,
  className,
}: {
  action: ServerAction;
  fields: Record<string, string>;
  children: ReactNode;
  confirmMessage?: string;
  danger?: boolean;
  className?: string;
}) {
  return (
    <ActionForm action={action} confirmMessage={confirmMessage} className="inline">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton danger={danger} className={className}>{children}</SubmitButton>
    </ActionForm>
  );
}
