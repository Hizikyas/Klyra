// app/forgot-password/page.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import Stepper, { Step } from "./Stepper";
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  useEffect(() => {
    otpInputRefs.current = otpInputRefs.current.slice(0, 6);
  }, []);

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isOtpValid = (otp: string) => {
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const isPasswordValid = () => {
    return newPassword.length >= 8 && newPassword === confirmPassword;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = otp.split('');
    newOtp[index] = value;
    const newOtpStr = newOtp.join('');
    setOtp(newOtpStr);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedDigits.length === 6) {
      setOtp(pastedDigits);
      setTimeout(() => {
        otpInputRefs.current[5]?.focus();
      }, 0);
    }
  };

  const handleComplete = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-blue-900/30 via-blue-800/25 to-black/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-800/25 to-black/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-700/20 to-black/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/15 to-indigo-800/15 rounded-full blur-3xl" />
      </div>

      {/* Go Back Button */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      <Stepper
        initialStep={1}
        onFinalStepCompleted={handleComplete}
        nextButtonProps={(step: number) => ({
          disabled: (step === 1 && !isEmailValid(email)) || 
                   (step === 2 && !isOtpValid(otp)) || 
                   (step === 3 && !isPasswordValid())
        })}
      >
        <Step>
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
            <p className="text-gray-300">Enter your email address to receive an OTP.</p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200"
            />
          </div>
        </Step>

        <Step>
          <div className="text-center mb-8">
            <KeyRound className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
            <p className="text-gray-300">Enter OTP which has been sent to your email</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-14 h-14 text-center text-xl font-bold bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200"
                  placeholder="•"
                />
              ))}
            </div>
          </div>
        </Step>

        <Step>
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-300">Enter your new password and confirm it.</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200"
            />
          </div>
        </Step>
      </Stepper>
    </div>
  );
};

export default ForgotPassword;