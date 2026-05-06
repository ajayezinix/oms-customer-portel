"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Mail, ArrowLeft, XCircle, Loader2, CheckCircle2, KeyRound } from "lucide-react";

/* ── email mask: ajay@gmail.com → a***@gmail.com ── */
function maskEmail(email = "") {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [step, setStep] = useState(1);          // 1 = email, 2 = otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);

  const otpRefs = useRef([]);

  /* ── countdown timer ── */
  const startCountdown = useCallback(() => {
    let remaining = 30;
    setCountdown(remaining);
    const id = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
  }, []);

  /* ── STEP 1 — send OTP ── */
  const handleSendOtp = useCallback(async () => {
    if (!email || loading) return;
    setLoading(true);
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpError) {
        setError("This email is not registered. Please contact Ezinix team.");
        setLoading(false);
        return;
      }
      setStep(2);
      startCountdown();
      toast.success("OTP sent to your email.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }, [email, loading, supabase, startCountdown]);

  /* ── STEP 2 — verify OTP ── */
  const handleVerifyOtp = useCallback(async (token) => {
    if (token.length !== 6 || loading) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (verifyError) {
        setError("Invalid code. Please try again.");
        setOtp(Array(6).fill(""));
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        setLoading(false);
        return;
      }
      /* verify customer row exists */
      const { data: customer } = await supabase
        .from("customers")
        .select("customer_id")
        .eq("email_address", data.user?.email)
        .single();

      if (!customer) {
        setError("Account setup incomplete. Contact Ezinix team.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      /* success animation then redirect */
      setSuccess(true);
      toast.success("Login successful!");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }, [email, loading, supabase, router]);

  /* ── OTP input handlers ── */
  const onOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    const token = next.join("");
    if (token.length === 6 && !next.includes("")) handleVerifyOtp(token);
  };

  const onOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp];
      next[idx - 1] = "";
      setOtp(next);
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const onOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) handleVerifyOtp(pasted);
  };

  /* ── Success overlay ── */
  if (success) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4 animate-in zoom-in-50 duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-white">Login successful</p>
          <p className="text-sm text-slate-400">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6">
      {/* Card wrapper — invisible border on mobile, visible card on desktop */}
      <div className="w-full max-w-[420px] md:rounded-3xl md:border md:border-[#1e1e2e] md:bg-[#13131a] md:p-8 md:shadow-2xl">

        {/* ── Logo ── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image 
              src="/ezinix_logo.png" 
              alt="Ezinix Logo" 
              width={64} 
              height={64} 
              className="h-16 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Ezinix</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">Customer Portal</p>
        </div>

        {step === 1 ? (
          /* ════════════════ STEP 1 — EMAIL ════════════════ */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-[#94a3b8]">Sign in to view your orders</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-email" className="ml-1 text-sm font-medium text-[#94a3b8]">
                Email address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  className={`h-14 w-full rounded-2xl border bg-[#1e1e2e] pl-12 pr-4 text-base text-white placeholder-slate-500 outline-none transition-colors focus:ring-1 ${
                    error ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]" : "border-[#2e2e3e] focus:border-[#6c63ff] focus:ring-[#6c63ff]"
                  }`}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendOtp(); }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 p-3">
                <XCircle size={18} className="mt-0.5 shrink-0 text-[#ef4444]" />
                <p className="text-sm font-medium text-[#ef4444]">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#6c63ff] font-semibold text-white shadow-lg shadow-[#6c63ff]/20 transition-all hover:bg-[#5b52ee] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Sending…</span>
                </>
              ) : (
                "Send OTP"
              )}
            </button>

            <p className="text-center text-xs text-[#94a3b8]">
              Not registered? Contact your Ezinix sales team.
            </p>
          </div>
        ) : (
          /* ════════════════ STEP 2 — OTP ════════════════ */
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e2e]">
                <KeyRound size={22} className="text-[#6c63ff]" />
              </div>
              <h2 className="text-xl font-semibold text-white">Check your email</h2>
              <p className="mt-1 text-sm text-[#94a3b8]">
                We sent a code to{" "}
                <span className="font-medium text-white">{maskEmail(email)}</span>
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(e) => onOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => onOtpKeyDown(e, idx)}
                  onPaste={idx === 0 ? onOtpPaste : undefined}
                  className={`h-14 w-12 min-w-[44px] flex-1 rounded-xl border bg-[#1e1e2e] text-center text-xl font-bold text-white outline-none transition-colors focus:ring-1 ${
                    error ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]" : "border-[#2e2e3e] focus:border-[#6c63ff] focus:ring-[#6c63ff]"
                  }`}
                />
              ))}
            </div>

            <p className="text-center text-xs text-[#94a3b8]">
              Code expires in 10 minutes
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 p-3">
                <XCircle size={18} className="mt-0.5 shrink-0 text-[#ef4444]" />
                <p className="text-sm font-medium text-[#ef4444]">{error}</p>
              </div>
            )}

            <button
              onClick={() => handleVerifyOtp(otp.join(""))}
              disabled={loading || otp.join("").length !== 6}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#6c63ff] font-semibold text-white shadow-lg shadow-[#6c63ff]/20 transition-all hover:bg-[#5b52ee] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : (
                "Verify & Login"
              )}
            </button>

            {/* Resend + change email */}
            <div className="flex flex-col items-center gap-3 pt-1">
              <button
                onClick={handleSendOtp}
                disabled={countdown > 0 || loading}
                className="text-sm font-medium text-[#6c63ff] transition-colors hover:text-[#5b52ee] disabled:text-slate-500"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setOtp(Array(6).fill(""));
                  setError("");
                }}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm font-medium text-[#94a3b8] transition-colors hover:text-white"
              >
                <ArrowLeft size={16} /> Change email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
