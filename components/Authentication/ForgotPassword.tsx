"use client";

import { useState } from 'react';
import { Mail, KeyRound, Lock } from 'lucide-react';
import Stepper, { Step } from "./Stepper";
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();

  // Validation functions
  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isOtpValid = (otp: string) => {
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const isPasswordValid = () => {
    return newPassword.length >= 8 && newPassword === confirmPassword;
  };

  // Handle form submissions
  const handleEmailSubmit = () => {
    if (isEmailValid(email)) {
      // Here you would typically send the OTP to the email
      console.log('Sending OTP to:', email);
    }
  };

  const handleOtpSubmit = () => {
    if (isOtpValid(otp)) {
      // Here you would typically verify the OTP
      console.log('Verifying OTP:', otp);
    }
  };

  const handlePasswordReset = () => {
    if (isPasswordValid()) {
      // Here you would typically reset the password
      console.log('Resetting password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Go Back Button */}
      <span className="absolute top-[1rem] right-[1rem] z-10">
        <button 
          onClick={() => router.back()} 
          className="bg-white text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group" 
          type="button"
        >
          <div className="bg-blue-900 rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              height="25px"
              width="25px"
            >
              <path
                d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                fill="#FFFFFF"
              ></path>
              <path
                d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                fill="#FFFFFF"
              ></path>
            </svg>
          </div>
          <p className="translate-x-2">Go Back</p>
        </button>
      </span>

      <Stepper
        initialStep={1}
        nextButtonProps={(step: number) => ({
          disabled: 
            (step === 1 && !isEmailValid(email)) ||
            (step === 2 && !isOtpValid(otp)) ||
            (step === 3 && !isPasswordValid()),
          className: `duration-350 flex items-center justify-center rounded-full py-1.5 px-3.5 font-medium tracking-tight text-white transition transform hover:scale-[1.02] font-['Archiv_Grotesk'] ${
            (step === 1 && !isEmailValid(email)) ||
            (step === 2 && !isOtpValid(otp)) ||
            (step === 3 && !isPasswordValid())
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600'
          }`
        })}
      >
        <Step>
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2 font-['Archiv_Grotesk']">Forgot Password</h2>
            <p className="text-gray-300 font-['Archiv_Grotesk']">Enter your email address to receive an OTP.</p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200 font-['Archiv_Grotesk']"
            />
            <button
              onClick={handleEmailSubmit}
              disabled={!isEmailValid(email)}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200 transform hover:scale-[1.02] font-['Archiv_Grotesk'] ${
                isEmailValid(email)
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600'
                  : 'bg-gray-500 cursor-not-allowed text-gray-300'
              }`}
            >
              Send OTP
            </button>
          </div>
        </Step>

        <Step>
          <div className="text-center mb-8">
            <KeyRound className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2 font-['Archiv_Grotesk']">Verify OTP</h2>
            <p className="text-gray-300 font-['Archiv_Grotesk']">Enter OTP which has been sent to your email</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200 font-['Archiv_Grotesk']"
            />
            <button
              onClick={handleOtpSubmit}
              disabled={!isOtpValid(otp)}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200 transform hover:scale-[1.02] font-['Archiv_Grotesk'] ${
                isOtpValid(otp)
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600'
                  : 'bg-gray-500 cursor-not-allowed text-gray-300'
              }`}
            >
              Verify OTP
            </button>
          </div>
        </Step>

        <Step>
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2 font-['Archiv_Grotesk']">Reset Password</h2>
            <p className="text-gray-300 font-['Archiv_Grotesk']">Enter your new password and confirm it.</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200 font-['Archiv_Grotesk']"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200 font-['Archiv_Grotesk']"
            />
            <button
              onClick={handlePasswordReset}
              disabled={!isPasswordValid()}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200 transform hover:scale-[1.02] font-['Archiv_Grotesk'] ${
                isPasswordValid()
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600'
                  : 'bg-gray-500 cursor-not-allowed text-gray-300'
              }`}
            >
              Reset Password
            </button>
          </div>
        </Step>
      </Stepper>
    </div>
  );
};

export default ForgotPassword;
