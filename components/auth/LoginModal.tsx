'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Clock, Send, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { MotohomLogo } from '@/components/brand/MotohomLogo';

export type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

type Step = 'login-phone' | 'register-form' | 'otp';

type OtpFlow = 'login' | 'register';

const OTP_LEN = 6;
const OTP_RESEND_SECONDS = 45;

const emptyOtpCells = () => Array<string>(OTP_LEN).fill('');

const formatCountdown = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const emailLooksValid = (value: string) => {
  const t = value.trim();
  if (t.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { sendOtp, resendOtp, verifyOtp, register, verifyRegistrationOtp } = useAuth();
  const [step, setStep] = useState<Step>('login-phone');
  const [otpFlow, setOtpFlow] = useState<OtpFlow>('login');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  /** One character per OTP box (fixed positions, matches Stitch 6-cell UX). */
  const [otpCells, setOtpCells] = useState<string[]>(emptyOtpCells);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [phoneStepError, setPhoneStepError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  /** Login OTP send indicated this phone is not registered yet. */
  const [loginSuggestedSignup, setLoginSuggestedSignup] = useState(false);
  const [otpResendSecondsRemaining, setOtpResendSecondsRemaining] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);
  const otp = otpCells.join('');
  const otpComplete = otpCells.every((c) => c.length === 1);
  const verifyingRef = useRef(false);
  const verifyInFlightRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setStep('login-phone');
    setOtpFlow('login');
    setPhone('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setOtpCells(emptyOtpCells());
    setLoginError(null);
    setPhoneStepError(null);
    setLoginSuggestedSignup(false);
    setOtpResendSecondsRemaining(0);
    setResendingOtp(false);
    verifyingRef.current = false;
    verifyInFlightRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'otp') return;
    setOtpResendSecondsRemaining(OTP_RESEND_SECONDS);
  }, [open, step]);

  useEffect(() => {
    if (!open || step !== 'otp') return;
    const id = window.setInterval(() => {
      setOtpResendSecondsRemaining((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, step]);

  const panelRef = useClickOutside<HTMLDivElement>(() => {
    if (open) onClose();
  });

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digitsOnly = (value: string, maxLen: number) => value.replace(/\D/g, '').slice(0, maxLen);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(digitsOnly(e.target.value, 10));
  };

  const goToRegisterWithPhone = () => {
    setPhoneStepError(null);
    setLoginSuggestedSignup(false);
    setOtpFlow('register');
    setStep('register-form');
  };

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || sendingOtp) return;
    setPhoneStepError(null);
    setSendingOtp(true);
    try {
      const result = await sendOtp(phone);
      if (!result.ok) {
        setPhoneStepError(result.message);
        setLoginSuggestedSignup(Boolean(result.notRegistered));
        return;
      }
      setLoginSuggestedSignup(false);
      setOtpFlow('login');
      setStep('otp');
    } finally {
      setSendingOtp(false);
    }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || sendingOtp) return;
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setPhoneStepError('Please enter your first and last name.');
      return;
    }
    if (!emailLooksValid(email)) {
      setPhoneStepError('Please enter a valid email address.');
      return;
    }
    setPhoneStepError(null);
    setSendingOtp(true);
    try {
      await register({
        first_name: fn,
        last_name: ln,
        phone,
        email: email.trim(),
      });
      setOtpFlow('register');
      setStep('otp');
    } catch (err) {
      setPhoneStepError(err instanceof Error ? err.message : 'Could not send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const runVerify = useCallback(async () => {
    if (otp.length < OTP_LEN || verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
    verifyingRef.current = true;
    setLoginError(null);
    setVerifyingOtp(true);
    try {
      if (otpFlow === 'register') {
        await verifyRegistrationOtp(phone, otp);
      } else {
        await verifyOtp(phone, otp);
      }
    } catch (err) {
      const e = err as Error & { code?: string };
      setLoginError(e.message || 'Could not verify. Try again.');
      verifyingRef.current = false;
    } finally {
      verifyInFlightRef.current = false;
      setVerifyingOtp(false);
    }
  }, [phone, otp, otpFlow, verifyOtp, verifyRegistrationOtp]);

  useEffect(() => {
    if (!otpComplete) verifyingRef.current = false;
  }, [otpComplete]);

  useEffect(() => {
    if (!open || step !== 'otp' || !otpComplete) return;
    void runVerify();
  }, [open, step, otpComplete, runVerify]);

  const focusOtpIndex = useCallback((i: number) => {
    const el = otpInputRefs.current[Math.max(0, Math.min(i, OTP_LEN - 1))];
    el?.focus();
    el?.select();
  }, []);

  useEffect(() => {
    if (!open || step !== 'otp') return;
    const t = requestAnimationFrame(() => focusOtpIndex(0));
    return () => cancelAnimationFrame(t);
  }, [open, step, focusOtpIndex]);

  const modalTitleId =
    step === 'login-phone'
      ? 'login-modal-phone-title'
      : step === 'register-form'
        ? 'login-modal-register-title'
        : 'login-modal-otp-title';

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const d = digitsOnly(e.target.value, 1);
    const char = d.slice(-1) || '';
    setOtpCells((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < OTP_LEN - 1) {
      requestAnimationFrame(() => focusOtpIndex(index + 1));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setOtpCells((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = '';
          return next;
        }
        if (index > 0) {
          next[index - 1] = '';
          requestAnimationFrame(() => focusOtpIndex(index - 1));
        }
        return next;
      });
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) focusOtpIndex(index - 1);
    if (e.key === 'ArrowRight' && index < OTP_LEN - 1) focusOtpIndex(index + 1);
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = digitsOnly(e.clipboardData.getData('text'), OTP_LEN);
    if (!pasted) return;
    setOtpCells(() => {
      const next = emptyOtpCells();
      for (let i = 0; i < pasted.length && i < OTP_LEN; i++) next[i] = pasted[i]!;
      return next;
    });
    const nextIdx = Math.min(pasted.length, OTP_LEN - 1);
    requestAnimationFrame(() => focusOtpIndex(nextIdx));
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    void runVerify();
  };

  const handleResendOtp = async () => {
    if (phone.length < 10 || resendingOtp || otpResendSecondsRemaining > 0) return;
    setResendingOtp(true);
    setLoginError(null);
    try {
      const result = await resendOtp(phone, {
        purpose: otpFlow === 'register' ? 'register' : 'login',
      });
      if (!result.ok) {
        setLoginError(result.message);
        return;
      }
      setOtpCells(emptyOtpCells());
      verifyingRef.current = false;
      verifyInFlightRef.current = false;
      setOtpResendSecondsRemaining(OTP_RESEND_SECONDS);
    } finally {
      setResendingOtp(false);
    }
  };

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div className="absolute inset-0 bg-stitch-background/85 backdrop-blur-md" aria-hidden />

      <div
        ref={panelRef}
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full text-stitch-on-surface-variant transition-colors hover:bg-white/5 hover:text-stitch-primary"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="glass-panel-login rounded-xl p-10 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <MotohomLogo className="h-9 w-auto max-w-[min(100%,18rem)] sm:h-10" blendOnDark />
          </div>

          {(step === 'login-phone' || step === 'register-form') && (
            <div
              className="mb-8 grid grid-cols-2 gap-1 rounded-lg border border-stitch-outline/20 p-1"
              role="tablist"
              aria-label="Account"
            >
              <button
                type="button"
                role="tab"
                aria-selected={step === 'login-phone'}
                onClick={() => {
                  setStep('login-phone');
                  setPhoneStepError(null);
                  setLoginSuggestedSignup(false);
                }}
                className={cn(
                  'rounded-md py-2.5 font-body text-sm font-semibold transition-colors',
                  step === 'login-phone'
                    ? 'bg-stitch-primary/20 text-stitch-on-background'
                    : 'text-stitch-on-surface-variant hover:text-stitch-on-background'
                )}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={step === 'register-form'}
                onClick={() => {
                  setStep('register-form');
                  setPhoneStepError(null);
                }}
                className={cn(
                  'rounded-md py-2.5 font-body text-sm font-semibold transition-colors',
                  step === 'register-form'
                    ? 'bg-stitch-primary/20 text-stitch-on-background'
                    : 'text-stitch-on-surface-variant hover:text-stitch-on-background'
                )}
              >
                Sign up
              </button>
            </div>
          )}

          {step === 'login-phone' ? (
            <div
              key="login-phone"
              className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
            >
              <div className="mb-10 text-center">
                <h1
                  id="login-modal-phone-title"
                  className="font-headline text-2xl font-bold leading-tight tracking-tight text-stitch-on-background"
                >
                  Continue to Plan Your Journey
                </h1>
                <p className="mt-3 text-sm font-medium text-stitch-on-surface-variant">
                  Enter your phone number to proceed
                </p>
              </div>

              <form className="space-y-8" onSubmit={submitPhone}>
                <div className="space-y-2">
                  <label className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-stitch-on-surface-variant">
                    Mobile Number
                  </label>
                  <div className="input-gradient-border-login flex items-center">
                    <span className="px-2 pb-2 font-headline text-lg font-bold text-stitch-primary-container">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      className="w-full border-none bg-transparent pb-2 font-headline text-lg font-bold tracking-wider text-stitch-on-background placeholder:text-stitch-outline/50 focus:ring-0"
                    />
                  </div>
                </div>

                {phoneStepError && (
                  <p className="text-center text-sm text-destructive" role="alert">
                    {phoneStepError}
                  </p>
                )}

                {loginSuggestedSignup && (
                  <div
                    className="rounded-lg border border-stitch-outline/25 bg-stitch-surface-highest/40 px-4 py-3 text-center"
                    role="status"
                  >
                    <p className="text-sm text-stitch-on-background">
                      This number isn&apos;t registered yet. Create an account to continue.
                    </p>
                    <button
                      type="button"
                      onClick={goToRegisterWithPhone}
                      className="mt-3 font-body text-sm font-semibold text-stitch-primary-container underline-offset-4 hover:underline"
                    >
                      Create account
                    </button>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={phone.length < 10 || sendingOtp}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-md font-headline font-bold shadow-lg transition-all enabled:gradient-cta enabled:text-stitch-on-primary enabled:shadow-lg enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:border disabled:border-stitch-outline/25 disabled:bg-stitch-surface-highest/70 disabled:text-stitch-on-background disabled:opacity-100"
                  >
                    <Send className="size-5 shrink-0" aria-hidden />
                    {sendingOtp ? 'Sending OTP…' : 'Send OTP via WhatsApp'}
                  </button>
                </div>
              </form>

              <div className="mt-10 border-t border-white/5 pt-8 text-center">
                <p className="text-xs text-stitch-on-surface-variant">
                  By continuing, you agree to Motohom&apos;s{' '}
                  <a className="text-stitch-primary-container underline-offset-4 hover:underline" href="#">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a className="text-stitch-primary-container underline-offset-4 hover:underline" href="#">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="group inline-flex items-center gap-2 text-stitch-on-surface-variant transition-colors hover:text-stitch-on-background"
                >
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  <span className="font-body text-sm font-semibold uppercase tracking-widest">Back to Explore</span>
                </button>
              </div>
            </div>
          ) : step === 'register-form' ? (
            <div
              key="register-form"
              className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
            >
              <div className="mb-10 text-center">
                <h1
                  id="login-modal-register-title"
                  className="font-headline text-2xl font-bold leading-tight tracking-tight text-stitch-on-background"
                >
                  Create your account
                </h1>
                <p className="mt-3 text-sm font-medium text-stitch-on-surface-variant">
                  We&apos;ll send a code to verify your mobile number
                </p>
              </div>

              <form className="space-y-5" onSubmit={submitRegister}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-stitch-on-surface-variant">
                      First name
                    </label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="input-gradient-border-login w-full border-none bg-transparent px-3 pb-2 pt-2 font-body text-sm font-medium text-stitch-on-background placeholder:text-stitch-outline/50 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-stitch-on-surface-variant">
                      Last name
                    </label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="input-gradient-border-login w-full border-none bg-transparent px-3 pb-2 pt-2 font-body text-sm font-medium text-stitch-on-background placeholder:text-stitch-outline/50 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-stitch-on-surface-variant">
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-gradient-border-login w-full border-none bg-transparent px-3 pb-2 pt-2 font-body text-sm font-medium text-stitch-on-background placeholder:text-stitch-outline/50 focus:ring-0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-stitch-on-surface-variant">
                    Mobile Number
                  </label>
                  <div className="input-gradient-border-login flex items-center">
                    <span className="px-2 pb-2 font-headline text-lg font-bold text-stitch-primary-container">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      className="w-full border-none bg-transparent pb-2 font-headline text-lg font-bold tracking-wider text-stitch-on-background placeholder:text-stitch-outline/50 focus:ring-0"
                    />
                  </div>
                </div>

                {phoneStepError && (
                  <p className="text-center text-sm text-destructive" role="alert">
                    {phoneStepError}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={phone.length < 10 || sendingOtp}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-md font-headline font-bold shadow-lg transition-all enabled:gradient-cta enabled:text-stitch-on-primary enabled:shadow-lg enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:border disabled:border-stitch-outline/25 disabled:bg-stitch-surface-highest/70 disabled:text-stitch-on-background disabled:opacity-100"
                  >
                    <Send className="size-5 shrink-0" aria-hidden />
                    {sendingOtp ? 'Sending code…' : 'Send verification code'}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('login-phone');
                    setPhoneStepError(null);
                  }}
                  className="font-body text-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-on-background"
                >
                  Already have an account? <span className="font-semibold text-stitch-primary-container">Log in</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              key="otp"
              className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
            >
              <div className="mb-10 space-y-2 text-center">
                <h1
                  id="login-modal-otp-title"
                  className="font-headline text-3xl font-extrabold uppercase tracking-tight text-stitch-on-background"
                >
                  Enter Verification Code
                </h1>
                <p className="font-body text-stitch-on-surface-variant">
                  {otpFlow === 'register'
                    ? 'Enter the code we sent to finish signing up.'
                    : 'We&apos;ve sent a 6-digit code to your registered mobile number.'}
                </p>
              </div>

              <form className="space-y-8" onSubmit={handleVerify}>
                <div className="flex justify-center py-4">
                  <div className="mx-auto flex w-max gap-2 sm:gap-3 md:gap-4">
                    {Array.from({ length: OTP_LEN }, (_, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpInputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={otpCells[i] ?? ''}
                        placeholder="·"
                        onChange={(e) => handleOtpChange(i, e)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="h-16 w-11 rounded-none border-0 border-b-2 border-stitch-outline/80 bg-transparent text-center font-headline text-3xl font-bold text-stitch-primary transition-colors focus:border-stitch-primary focus:outline-none focus:ring-0 sm:h-20 sm:w-14"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  {otpResendSecondsRemaining > 0 ? (
                    <div className="flex items-center gap-2 font-body text-sm text-stitch-on-surface-variant">
                      <Clock className="size-4" aria-hidden />
                      <span>
                        Resend code in{' '}
                        <span className="font-bold text-stitch-primary">
                          {formatCountdown(otpResendSecondsRemaining)}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <p className="font-body text-sm text-stitch-on-surface-variant">Didn&apos;t get a code?</p>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleResendOtp()}
                    disabled={otpResendSecondsRemaining > 0 || resendingOtp || phone.length < 10}
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      otpResendSecondsRemaining > 0 || resendingOtp || phone.length < 10
                        ? 'cursor-not-allowed text-stitch-on-surface-variant opacity-50'
                        : 'text-stitch-primary-container hover:underline'
                    )}
                  >
                    {resendingOtp ? 'Sending…' : 'Resend code'}
                  </button>
                </div>

                {loginError && (
                  <p className="text-center text-sm text-destructive" role="alert">
                    {loginError}
                  </p>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!otpComplete || verifyingOtp}
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-md font-headline font-bold shadow-lg transition-all enabled:gradient-cta enabled:text-stitch-on-primary enabled:shadow-lg enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:border disabled:border-stitch-outline/25 disabled:bg-stitch-surface-highest/70 disabled:text-stitch-on-background disabled:opacity-100"
                  >
                    <span className="tracking-wide">
                      {verifyingOtp ? 'Verifying…' : 'Verify & Continue'}
                    </span>
                    <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                  </button>
                </div>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    setOtpCells(emptyOtpCells());
                    setStep(otpFlow === 'register' ? 'register-form' : 'login-phone');
                  }}
                  className="font-body text-xs uppercase tracking-widest text-stitch-on-surface-variant transition-colors hover:text-stitch-on-background"
                >
                  Change phone number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
