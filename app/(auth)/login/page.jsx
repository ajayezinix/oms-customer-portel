"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toMaskedEmail } from "@/lib/format";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, KeyRound, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [counter, setCounter] = useState(0);

  const tick = () => {
    let value = 30;
    setCounter(value);
    const id = setInterval(() => {
      value -= 1;
      setCounter(value);
      if (value <= 0) clearInterval(id);
    }, 1000);
  };

  const sendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (otpError) {
      setError("This email is not registered. Please contact Ezinix team.");
      return;
    }
    setStep(2);
    tick();
    toast.success("OTP sent to your email.");
  };

  const verifyOtp = async (token) => {
    setLoading(true);
    setError("");
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setLoading(false);
    if (verifyError) {
      setError("Invalid code. Please try again.");
      return;
    }
    toast.success("Login successful!");
    router.push("/dashboard");
  };

  const onOtpInput = (idx, val) => {
    // Only allow numbers
    if (!/^\d?$/.test(val)) return;
    
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    
    // Auto focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Check if fully entered
    const token = next.join("");
    if (token.length === 6 && !next.includes("")) {
      verifyOtp(token);
    }
  };

  const onKeyDown = (e, idx) => {
    // Handle backspace properly
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-${idx - 1}`);
      if (prevInput) {
        prevInput.focus();
        // Clear previous on backspace
        const next = [...otp];
        next[idx - 1] = "";
        setOtp(next);
      }
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] p-4 md:bg-[#0f0f18]">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 md:rounded-3xl md:border md:border-[#1e1e2e] md:bg-[#13131a] md:p-8 md:shadow-2xl">
        
        {/* Logo Header */}
        <div className="mb-8 text-center md:mb-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#5a52d5] shadow-lg shadow-[#6c63ff]/20">
            <span className="text-3xl font-bold text-white">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight md:text-3xl">Ezinix Portal</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage your B2B orders</p>
        </div>

        {step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <LogIn size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-14 w-full rounded-2xl border border-[#2e2e3e] bg-[#1e1e2e] pl-11 pr-4 text-white placeholder-slate-500 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-sm font-medium text-rose-400 border border-rose-500/20 text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !email}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#6c63ff] px-4 font-semibold text-white shadow-lg shadow-[#6c63ff]/20 transition-all hover:bg-[#5a52d5] active:scale-[0.98] disabled:opacity-60 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Sending Code...</span>
                </div>
              ) : (
                "Continue with Email"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e2e]">
                <KeyRound size={20} className="text-[#6c63ff]" />
              </div>
              <h2 className="text-xl font-semibold text-white">Check your email</h2>
              <p className="text-sm text-slate-400">
                We sent a 6-digit code to<br/>
                <span className="font-medium text-white">{toMaskedEmail(email)}</span>
              </p>
            </div>

            <div className="flex justify-between gap-2 px-1">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpInput(idx, e.target.value)}
                  onKeyDown={(e) => onKeyDown(e, idx)}
                  className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-[#2e2e3e] bg-[#1e1e2e] text-center text-xl font-bold text-white focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff] transition-all placeholder-slate-600"
                  placeholder="·"
                />
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-sm font-medium text-rose-400 border border-rose-500/20 text-center">
                {error}
              </div>
            )}

            <button
              onClick={() => verifyOtp(otp.join(""))}
              disabled={loading || otp.join("").length !== 6}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#6c63ff] px-4 font-semibold text-white shadow-lg shadow-[#6c63ff]/20 transition-all hover:bg-[#5a52d5] active:scale-[0.98] disabled:opacity-60 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={() => sendOtp()}
                disabled={counter > 0 || loading}
                className="text-sm font-medium text-[#6c63ff] hover:text-[#5a52d5] disabled:text-slate-500 transition-colors"
              >
                {counter > 0 ? `Resend code in ${counter}s` : "Didn&apos;t receive a code? Resend"}
              </button>
              
              <button 
                onClick={() => {
                  setStep(1);
                  setOtp(Array(6).fill(""));
                  setError("");
                }} 
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Change email address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
