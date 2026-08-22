"use client";

import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inputShellVariants } from "@/components/ui/input-variants";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { Caption } from "@/components/ui/typography";
import {
  INVITE_MEMBER_MESSAGE_MAX_LENGTH,
  INVITE_MEMBER_MOCK_DELAY_MS,
  INVITE_MEMBER_MODAL_COPY,
  INVITE_MEMBER_ROLE_LABELS,
  INVITE_MEMBER_ROLES,
  type InviteMemberModalState,
  type InviteMemberRole,
} from "@/config/invite-member-modal";
import { inviteMemberModalAnalytics } from "@/lib/analytics/invite-member-modal-events";
import {
  emptyInviteMemberForm,
  hasInviteMemberFieldErrors,
  isInviteMemberRole,
  normalizeInviteMemberMessage,
  validateInviteMemberForm,
  type InviteMemberFieldErrors,
  type InviteMemberFormValues,
} from "@/utils/invite-member-modal";
import { cn } from "@/utils/cn";

const selectClass = cn(
  inputShellVariants({ variant: "default", size: "md" }),
  "w-full cursor-pointer appearance-none bg-background",
);

const textareaClass = cn(
  inputShellVariants({ variant: "default", size: "md" }),
  "min-h-24 w-full resize-y py-sm",
);

export type InviteMemberPayload = {
  email: string;
  role: InviteMemberRole;
  message?: string;
};

export type InviteMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Mock invite handler — must not send real email or call backend APIs.
   */
  onSend: (payload: InviteMemberPayload) => void | Promise<void>;
  /** External state override; omit for internal machine. */
  state?: InviteMemberModalState;
  defaultRole?: InviteMemberRole | "";
  onCancel?: () => void;
};

/**
 * COMPONENT-053 — Invite Member Modal.
 * Mock Business invite — no email integration / no backend.
 */
export function InviteMemberModal({
  open,
  onOpenChange,
  onSend,
  state: stateProp,
  defaultRole = "",
  onCancel,
}: InviteMemberModalProps) {
  const emailRef = React.useRef<HTMLInputElement>(null);
  const openedForSession = React.useRef(false);

  const [internalState, setInternalState] =
    React.useState<InviteMemberModalState>("default");
  const [values, setValues] = React.useState<InviteMemberFormValues>(() =>
    emptyInviteMemberForm(defaultRole),
  );
  const [errors, setErrors] = React.useState<InviteMemberFieldErrors>({});

  const state = stateProp ?? internalState;
  const isControlled = stateProp != null;
  const setState = (next: InviteMemberModalState) => {
    if (!isControlled) setInternalState(next);
  };

  const loading = state === "loading";
  const isError = state === "error";

  React.useEffect(() => {
    if (!open) {
      openedForSession.current = false;
      return;
    }
    if (!openedForSession.current) {
      openedForSession.current = true;
      inviteMemberModalAnalytics.opened();
      setValues(emptyInviteMemberForm(defaultRole));
      setErrors({});
      if (!isControlled) setInternalState("default");
    }
    const frame = window.requestAnimationFrame(() => {
      emailRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [defaultRole, isControlled, open]);

  const dismiss = () => {
    if (loading) return;
    inviteMemberModalAnalytics.cancelled();
    onCancel?.();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) dismiss();
  };

  const handleSend = async () => {
    if (loading) return;
    const nextErrors = validateInviteMemberForm(values);
    setErrors(nextErrors);
    if (hasInviteMemberFieldErrors(nextErrors)) return;
    if (!isInviteMemberRole(values.role)) return;

    const payload: InviteMemberPayload = {
      email: values.email.trim(),
      role: values.role,
      message: normalizeInviteMemberMessage(values.message),
    };

    if (isControlled) {
      await onSend(payload);
      return;
    }

    setState("loading");
    try {
      await Promise.resolve(onSend(payload));
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, INVITE_MEMBER_MOCK_DELAY_MS);
      });
      inviteMemberModalAnalytics.sent({ role: payload.role });
      toast.success(INVITE_MEMBER_MODAL_COPY.success);
      setState("success");
      onOpenChange(false);
    } catch {
      inviteMemberModalAnalytics.failed({ role: payload.role });
      setState("error");
      toast.error(INVITE_MEMBER_MODAL_COPY.error);
    }
  };

  const roleLabelId = "invite-member-role-label";
  const messageLabelId = "invite-member-message-label";

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      variant="confirmation"
      size="md"
      title={INVITE_MEMBER_MODAL_COPY.title}
      description={INVITE_MEMBER_MODAL_COPY.description}
      showCloseButton={!loading}
      preventDismiss={loading}
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={loading}
            onClick={dismiss}
          >
            {INVITE_MEMBER_MODAL_COPY.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="min-h-11 text-primary-foreground"
            isLoading={loading}
            disabled={loading}
            onClick={() => void handleSend()}
          >
            {loading
              ? INVITE_MEMBER_MODAL_COPY.sending
              : INVITE_MEMBER_MODAL_COPY.send}
          </Button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-md"
        aria-busy={loading || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
      >
        <Input
          ref={emailRef}
          type="email"
          label={INVITE_MEMBER_MODAL_COPY.email}
          value={values.email}
          autoComplete="email"
          inputMode="email"
          required
          disabled={loading}
          errorMessage={errors.email}
          onChange={(e) => {
            const email = e.target.value;
            setValues((prev) => ({ ...prev, email }));
            if (errors.email) {
              setErrors((prev) => ({
                ...prev,
                email: validateInviteMemberForm({ ...values, email }).email,
              }));
            }
          }}
          onBlur={() => {
            setErrors((prev) => ({
              ...prev,
              email: validateInviteMemberForm(values).email,
            }));
          }}
        />

        <div className="flex flex-col gap-sm">
          <Caption
            id={roleLabelId}
            className="font-semibold text-foreground"
          >
            {INVITE_MEMBER_MODAL_COPY.role}
          </Caption>
          <select
            id="invite-member-role"
            className={selectClass}
            value={values.role}
            disabled={loading}
            required
            aria-labelledby={roleLabelId}
            aria-invalid={errors.role ? true : undefined}
            aria-describedby={errors.role ? "invite-member-role-error" : undefined}
            onChange={(e) => {
              const next = e.target.value;
              const role = isInviteMemberRole(next) ? next : "";
              setValues((prev) => ({ ...prev, role }));
              setErrors((prev) => ({
                ...prev,
                role: validateInviteMemberForm({
                  ...values,
                  role,
                }).role,
              }));
            }}
          >
            <option value="">
              {INVITE_MEMBER_MODAL_COPY.rolePlaceholder}
            </option>
            {INVITE_MEMBER_ROLES.map((role) => (
              <option key={role} value={role}>
                {INVITE_MEMBER_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          {errors.role ? (
            <Caption
              id="invite-member-role-error"
              className="text-error"
              role="alert"
            >
              {errors.role}
            </Caption>
          ) : null}
        </div>

        <div className="flex flex-col gap-sm">
          <Caption
            id={messageLabelId}
            className="font-semibold text-foreground"
          >
            {INVITE_MEMBER_MODAL_COPY.message}{" "}
            <span className="font-normal text-muted-foreground">
              ({INVITE_MEMBER_MODAL_COPY.messageOptional})
            </span>
          </Caption>
          <textarea
            id="invite-member-message"
            className={textareaClass}
            value={values.message}
            disabled={loading}
            maxLength={INVITE_MEMBER_MESSAGE_MAX_LENGTH}
            placeholder={INVITE_MEMBER_MODAL_COPY.messagePlaceholder}
            aria-labelledby={messageLabelId}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, message: e.target.value }))
            }
          />
        </div>

        {isError ? (
          <Alert variant="error" role="alert">
            {INVITE_MEMBER_MODAL_COPY.error}
          </Alert>
        ) : null}
      </form>
    </Modal>
  );
}
