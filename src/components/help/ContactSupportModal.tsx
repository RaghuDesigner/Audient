"use client";

import * as React from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BodySmall } from "@/components/ui/typography";
import { toast } from "@/components/ui/toast";
import {
  HELP_SUPPORT_COPY,
  HELP_SUPPORT_MOCK_SUBMIT_DELAY_MS,
} from "@/config/help-support-screen";
import { inputShellVariants } from "@/components/ui/input-variants";
import { cn } from "@/utils/cn";

const textareaClass = cn(
  inputShellVariants({ variant: "default", size: "md" }),
  "min-h-28 w-full resize-y bg-background py-sm",
);

export type ContactSupportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (payload: { subject: string; message: string }) => void;
};

/**
 * SCREEN-023 — Contact Support modal.
 * Mock submit only — toast confirmation; no backend.
 */
export function ContactSupportModal({
  open,
  onOpenChange,
  onSubmitted,
}: ContactSupportModalProps) {
  const subjectRef = React.useRef<HTMLInputElement>(null);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [subjectError, setSubjectError] = React.useState<string | null>(null);
  const [messageError, setMessageError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setSubject("");
    setMessage("");
    setSubjectError(null);
    setMessageError(null);
    queueMicrotask(() => subjectRef.current?.focus());
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const nextSubjectError = trimmedSubject
      ? null
      : HELP_SUPPORT_COPY.contactValidationSubject;
    const nextMessageError = trimmedMessage
      ? null
      : HELP_SUPPORT_COPY.contactValidationMessage;
    setSubjectError(nextSubjectError);
    setMessageError(nextMessageError);
    if (nextSubjectError || nextMessageError) return;

    setSubmitting(true);
    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, HELP_SUPPORT_MOCK_SUBMIT_DELAY_MS);
      });
      onSubmitted?.({ subject: trimmedSubject, message: trimmedMessage });
      toast.success(HELP_SUPPORT_COPY.contactSuccess);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      variant="confirmation"
      size="md"
      scrollable
      title={HELP_SUPPORT_COPY.contactModalTitle}
      description={HELP_SUPPORT_COPY.contactModalDescription}
      preventDismiss={submitting}
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            {HELP_SUPPORT_COPY.contactCancel}
          </Button>
          <Button
            type="submit"
            form="contact-support-form"
            variant="primary"
            isLoading={submitting}
            className="text-primary-foreground"
          >
            {submitting
              ? HELP_SUPPORT_COPY.contactSubmitting
              : HELP_SUPPORT_COPY.contactSubmit}
          </Button>
        </div>
      }
    >
      <form
        id="contact-support-form"
        className="flex flex-col gap-md"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Input
          ref={subjectRef}
          label={HELP_SUPPORT_COPY.contactSubjectLabel}
          placeholder={HELP_SUPPORT_COPY.contactSubjectPlaceholder}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          errorMessage={subjectError ?? undefined}
          disabled={submitting}
          required
        />
        <div className="flex flex-col gap-sm">
          <label htmlFor="contact-support-message" className="text-body-sm font-medium text-foreground">
            {HELP_SUPPORT_COPY.contactMessageLabel}
          </label>
          <textarea
            id="contact-support-message"
            className={textareaClass}
            placeholder={HELP_SUPPORT_COPY.contactMessagePlaceholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={submitting}
            aria-invalid={messageError ? true : undefined}
            aria-describedby={
              messageError ? "contact-support-message-error" : undefined
            }
            required
          />
          {messageError ? (
            <BodySmall id="contact-support-message-error" className="text-error">
              {messageError}
            </BodySmall>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
