"use client";

import * as React from "react";

import {
  InputMessages,
  InputPrefix,
  InputTrailing,
} from "@/components/ui/input-adornments";
import {
  inputShellVariants,
  resolveInputVariant,
  type InputSize,
  type InputVariant,
} from "@/components/ui/input-variants";
import { cn } from "@/utils/cn";

/**
 * Audient Input — `components/ui/input`
 *
 * Figma `Input` / `Text Field` (COMPONENT_MAPPING) + shared INP-* rules
 * (COMPONENT_BEHAVIOR) + WCAG 2.2 AA (ACCESSIBILITY.md):
 * visible label, `aria-invalid` + `aria-describedby`, focus ring,
 * ≥44px control height, never color-only errors.
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  variant?: InputVariant;
  size?: InputSize;
  /** Visible label (placeholder is not a substitute). */
  label?: string;
  /** Hint below the field (`aria-describedby`). */
  helperText?: string;
  /** Error copy — `aria-invalid` + error chrome (text + color). */
  errorMessage?: string;
  /** Success copy when no error. */
  successMessage?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  /** Eye toggle (default on when `type="password"`). */
  showPasswordToggle?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  /** Requires `maxLength`. */
  showCharacterCount?: boolean;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      variant = "default",
      size = "md",
      label,
      helperText,
      errorMessage,
      successMessage,
      prefixIcon,
      suffixIcon,
      showPasswordToggle,
      showClearButton = false,
      onClear,
      showCharacterCount = false,
      id: idProp,
      type = "text",
      disabled = false,
      readOnly = false,
      required,
      maxLength,
      value,
      defaultValue,
      onChange,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = idProp ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;
    const counterId = `${inputId}-counter`;

    const [internalValue, setInternalValue] = React.useState(() =>
      String(value ?? defaultValue ?? ""),
    );
    const [revealed, setRevealed] = React.useState(false);
    const isControlled = value !== undefined;

    React.useEffect(() => {
      if (isControlled) setInternalValue(String(value ?? ""));
    }, [isControlled, value]);

    const currentValue = isControlled ? String(value ?? "") : internalValue;
    const hasError = Boolean(errorMessage);
    const hasSuccess = Boolean(successMessage) && !hasError;
    const resolvedVariant = resolveInputVariant(variant, {
      disabled,
      readOnly,
      hasError,
      hasSuccess,
    });

    const enablePasswordToggle =
      showPasswordToggle !== false &&
      (type === "password" || showPasswordToggle === true);
    const inputType = enablePasswordToggle
      ? revealed
        ? "text"
        : "password"
      : type;

    const describedBy =
      [
        helperText ? helperId : null,
        hasError ? errorId : null,
        hasSuccess ? successId : null,
        showCharacterCount && maxLength != null ? counterId : null,
        props["aria-describedby"] ?? null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(event.target.value);
      onChange?.(event);
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
        return;
      }
      if (!isControlled) setInternalValue("");
      onChange?.({
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const showClear =
      showClearButton && currentValue.length > 0 && !disabled && !readOnly;

    return (
      <div className={cn("flex w-full flex-col gap-sm", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-info font-semibold text-foreground sm:text-body-sm"
          >
            {label}
            {required ? (
              <span className="text-error" aria-hidden="true">
                {" "}
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div
          className={cn(
            inputShellVariants({ variant: resolvedVariant, size }),
            className,
          )}
          data-disabled={disabled || undefined}
          data-readonly={readOnly || undefined}
        >
          <InputPrefix icon={prefixIcon} />

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            value={currentValue}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-foreground",
              "placeholder:text-muted-foreground outline-none",
              "disabled:cursor-not-allowed read-only:cursor-default",
            )}
            {...props}
          />

          <InputTrailing
            suffixIcon={suffixIcon}
            showClear={showClear}
            showToggle={enablePasswordToggle && !disabled}
            passwordRevealed={revealed}
            onClear={handleClear}
            onTogglePassword={() => setRevealed((prev) => !prev)}
          />
        </div>

        <InputMessages
          errorId={errorId}
          successId={successId}
          helperId={helperId}
          counterId={counterId}
          errorMessage={errorMessage}
          successMessage={successMessage}
          helperText={helperText}
          showCharacterCount={showCharacterCount}
          maxLength={maxLength}
          characterCount={currentValue.length}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputShellVariants };
