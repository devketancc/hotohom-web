'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { isStaffRole } from '@/lib/staffRoles';

const OTP_LEN = 6;
const OTP_RESEND_SECONDS = 45;

type Step = 'phone' | 'otp';

const emptyOtpCells = () => Array<string>(OTP_LEN).fill('');

const formatCountdown = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const digitsOnly = (value: string, maxLen: number) => value.replace(/\D/g, '').slice(0, maxLen);

export function StaffLoginClient() {
  const router = useRouter();
  const { user, isAuthenticated, sendOtp, resendOtp, verifyStaffOtp } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otpCells, setOtpCells] = useState<string[]>(emptyOtpCells);
  const [phoneStepError, setPhoneStepError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpResendSecondsRemaining, setOtpResendSecondsRemaining] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);
  const verifyInFlightRef = useRef(false);

  const otp = otpCells.join('');
  const otpComplete = otpCells.every((c) => c.length === 1);

  useEffect(() => {
    if (!isAuthenticated || !user || !isStaffRole(user.role)) return;
    router.replace('/admin');
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (step !== 'otp') return;
    setOtpResendSecondsRemaining(OTP_RESEND_SECONDS);
  }, [step]);

  useEffect(() => {
    if (step !== 'otp') return;
    const id = window.setInterval(() => {
      setOtpResendSecondsRemaining((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step]);

  const focusOtpIndex = useCallback((i: number) => {
    const el = otpInputRefs.current[Math.max(0, Math.min(i, OTP_LEN - 1))];
    el?.focus();
    el?.select();
  }, []);

  useEffect(() => {
    if (step !== 'otp') return;
    const t = requestAnimationFrame(() => focusOtpIndex(0));
    return () => cancelAnimationFrame(t);
  }, [step, focusOtpIndex]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(digitsOnly(e.target.value, 10));
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
        return;
      }
      setStep('otp');
      setOtpCells(emptyOtpCells());
      setLoginError(null);
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
      await verifyStaffOtp(phone, otp);
      router.replace('/admin');
    } catch (err) {
      const e = err as Error & { code?: string };
      setLoginError(e.message || 'Could not verify. Try again.');
      verifyingRef.current = false;
    } finally {
      verifyInFlightRef.current = false;
      setVerifyingOtp(false);
    }
  }, [phone, otp, verifyStaffOtp, router]);

  useEffect(() => {
    if (!otpComplete) verifyingRef.current = false;
  }, [otpComplete]);

  useEffect(() => {
    if (step !== 'otp' || !otpComplete) return;
    void runVerify();
  }, [step, otpComplete, runVerify]);

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
      const result = await resendOtp(phone, { purpose: 'login' });
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

  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-stitch-background px-4 py-12 text-stitch-on-background">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="font-headline text-3xl font-black uppercase tracking-tighter text-stitch-primary-container"
        >
          Motohom
        </Link>
        <p className="mt-2 font-body text-xs font-semibold uppercase tracking-widest text-stitch-on-surface-variant">
          Staff
        </p>
      </div>

      <div className="glass-panel-login w-full max-w-md rounded-xl p-8 shadow-2xl sm:p-10">
        {step === 'phone' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both">
            <div className="mb-8 text-center">
              <h1 className="font-headline text-2xl font-bold leading-tight tracking-tight text-stitch-on-background">
                Staff sign in
              </h1>
              <p className="mt-3 text-sm font-medium text-stitch-on-surface-variant">
                Enter your registered mobile number. We will send a verification code.
              </p>
            </div>

            <form className="space-y-8" onSubmit={submitPhone}>
              <div className="space-y-2">
                <label className="ml-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-stitch-on-surface-variant">
                  Mobile number
                </label>
                <div className="input-gradient-border-login flex items-center">
                  <span className="px-2 pb-2 font-headline text-lg font-bold text-stitch-primary-container">+91</span>
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

              {phoneStepError ? (
                <p className="text-center text-sm text-destructive" role="alert">
                  {phoneStepError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={phone.length < 10 || sendingOtp}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-md font-headline font-bold shadow-lg transition-all enabled:gradient-cta enabled:text-stitch-on-primary enabled:shadow-lg enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:border disabled:border-stitch-outline/25 disabled:bg-stitch-surface-highest/70 disabled:text-stitch-on-background disabled:opacity-100"
              >
                <Send className="size-5 shrink-0" aria-hidden />
                {sendingOtp ? 'Sending OTP…' : 'Send OTP via WhatsApp'}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both">
            <div className="mb-8 space-y-2 text-center">
              <h1 className="font-headline text-2xl font-extrabold uppercase tracking-tight text-stitch-on-background">
                Enter verification code
              </h1>
              <p className="font-body text-sm text-stitch-on-surface-variant">
                We sent a 6-digit code to your registered mobile number.
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

              {loginError ? (
                <p className="text-center text-sm text-destructive" role="alert">
                  {loginError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!otpComplete || verifyingOtp}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-md font-headline font-bold shadow-lg transition-all enabled:gradient-cta enabled:text-stitch-on-primary enabled:shadow-lg enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:border disabled:border-stitch-outline/25 disabled:bg-stitch-surface-highest/70 disabled:text-stitch-on-background disabled:opacity-100"
              >
                <span className="tracking-wide">{verifyingOtp ? 'Verifying…' : 'Verify & continue'}</span>
                <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setLoginError(null);
                  setOtpCells(emptyOtpCells());
                  setStep('phone');
                }}
                className="font-body text-xs uppercase tracking-widest text-stitch-on-surface-variant transition-colors hover:text-stitch-on-background"
              >
                Change phone number
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center font-body text-xs text-stitch-on-surface-variant">
        <Link href="/" className="text-stitch-primary-container underline-offset-4 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
