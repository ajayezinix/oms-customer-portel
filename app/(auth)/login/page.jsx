"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toMaskedEmail } from "@/lib/format";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const sendOtp = async () => {
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
    router.push("/dashboard");
  };

  const onOtpInput = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    const token = next.join("");
    if (token.length === 6 && !next.includes("")) verifyOtp(token);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-[#1e1e2e] bg-[#13131a] p-6">
        <h1 className="mb-1 text-2xl font-semibold text-[#6c63ff]">Ezinix OMS</h1>
        <p className="mb-6 text-slate-400">Customer Portal Login</p>
        {step === 1 ? (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-[#2e2e3e] bg-[#1e1e2e] p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOtp}
              disabled={loading || !email}
              className="w-full rounded-lg bg-[#6c63ff] px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Code sent to {toMaskedEmail(email)}</p>
            <div className="flex gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  value={digit}
                  onChange={(e) => onOtpInput(idx, e.target.value)}
                  maxLength={1}
                  className="h-12 w-12 rounded-lg border border-[#2e2e3e] bg-[#1e1e2e] text-center text-lg"
                />
              ))}
            </div>
            <button
              onClick={() => verifyOtp(otp.join(""))}
              disabled={loading || otp.join("").length !== 6}
              className="w-full rounded-lg bg-[#6c63ff] px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              onClick={sendOtp}
              disabled={counter > 0}
              className="text-sm text-slate-300 disabled:opacity-50"
            >
              {counter > 0 ? `Resend OTP in ${counter}s` : "Resend OTP"}
            </button>
            <button onClick={() => setStep(1)} className="block text-sm text-slate-400">
              ← Change email
            </button>
          </div>
        )}
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
