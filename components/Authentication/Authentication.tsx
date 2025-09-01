"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import useInput from "./useInput";
import Image from "next/image";

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(false); // Default to sign up
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { inputHandler: fullNameHandler, inputBlurHandler: fullNameBlurHandler, enteredValue: fullName, enteredValid: fullNameIsValid, inValid: fullNameIsInvalid, reset: resetFullName } = useInput((value) => value.trim() !== "");
  const { inputHandler: usernameHandler, inputBlurHandler: usernameBlurHandler, enteredValue: username, enteredValid: usernameIsValid, inValid: usernameIsInvalid, reset: resetUsername } = useInput((value) => value.trim() !== "");
  const { inputHandler: emailHandler, inputBlurHandler: emailBlurHandler, enteredValue: email, enteredValid: emailIsValid, inValid: emailIsInvalid, reset: resetEmail } = useInput((value) => value.includes("@"));
  const { inputHandler: passwordHandler, inputBlurHandler: passwordBlurHandler, enteredValue: password, enteredValid: passwordIsValid, inValid: passwordIsInvalid, reset: resetPassword } = useInput((value) => value.length >= 5);
  const { inputHandler: confirmPasswordHandler, inputBlurHandler: confirmPasswordBlurHandler, enteredValue: confirmPassword, enteredValid: confirmPasswordIsValid, inValid: confirmPasswordIsInvalid, reset: resetConfirmPassword } = useInput((value) => value === password);
  const { inputHandler: phoneHandler, inputBlurHandler: phoneBlurHandler, enteredValue: phone, enteredValid: phoneIsValid, inValid: phoneIsInvalid, reset: resetPhone } = useInput((value) => /^\+?[\d\s\-\(\)]{10,}$/.test(value.trim()));

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  let formValidity = false;
  if (isLogin) {
    formValidity = usernameIsValid && passwordIsValid;
  } else {
    formValidity =
      fullNameIsValid &&
      usernameIsValid &&
      emailIsValid &&
      phoneIsValid &&
      passwordIsValid &&
      confirmPasswordIsValid;
  }

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidity) {
      return;
    }

    const userData = isLogin
      ? { username, password }
      : { fullName, username, email, phone, password };

    console.log("Form submitted:", userData);

    resetFullName();
    resetUsername();
    resetEmail();
    resetPhone();
    resetPassword();
    resetConfirmPassword();

    if (!isLogin) {
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Blue-Black Circular Gradient Background - Same as Features */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large blue-black circular gradient */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-blue-900/30 via-blue-800/25 to-black/20 rounded-full blur-3xl" />
        
        {/* Additional smaller blue-black gradients */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-800/25 to-black/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-700/20 to-black/15 rounded-full blur-3xl" />
        
        {/* Subtle accent gradients */}
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/15 to-indigo-800/15 rounded-full blur-3xl" />
      </div>

      {/* Go Back Button - Above the card, centered */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <button 
          onClick={() => router.push("/")} 
          className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200 font-['Archiv_Grotesk'] text-sm font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden w-full max-w-4xl min-h-[520px] relative border border-white/20">
        
        <div
          className={`absolute top-0 h-full transition-all duration-1000 ease-in-out ${
            isLogin ? "left-0 w-1/2" : "left-1/2 w-1/2"
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center px-10">
            <h1 className="text-2xl font-bold mb-3 font-['Archiv_Grotesk'] text-white mb-[2rem]">
              {isLogin ? "Login" : "Fill personal details to sign up"}
            </h1>

            <form onSubmit={submitHandler} className="w-full">
              {!isLogin && (
                <div className="relative w-full mb-4">
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    onChange={fullNameHandler}
                    onBlur={fullNameBlurHandler}
                    value={fullName}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-white placeholder-gray-400 focus:outline-none font-['Archiv_Grotesk'] transition-all duration-300 ${
                      fullNameIsInvalid
                        ? "border-red-400"
                        : "border-white/30"
                    }`}
                  />
                </div>
              )}

              <div className="relative w-full mb-4">
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  onChange={usernameHandler}
                  onBlur={usernameBlurHandler}
                  value={username}
                                      className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-white placeholder-gray-400 focus:outline-none font-['Archiv_Grotesk'] transition-all duration-300 ${
                      usernameIsInvalid
                        ? "border-red-400"
                        : "border-white/30"
                    }`}
                />
              </div>

              {!isLogin && (
                <div className="relative w-full mb-4">
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    onChange={emailHandler}
                    onBlur={emailBlurHandler}
                    value={email}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-white placeholder-gray-400 focus:outline-none font-['Archiv_Grotesk'] transition-all duration-300 ${
                      emailIsInvalid
                        ? "border-red-400"
                        : "border-white/30"
                    }`}
                  />
                </div>
              )}

              {!isLogin && (
                <div className="relative w-full mb-4">
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    onChange={phoneHandler}
                    onBlur={phoneBlurHandler}
                    value={phone}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-white placeholder-gray-400 focus:outline-none font-['Archiv_Grotesk'] transition-all duration-300 ${
                      phoneIsInvalid
                        ? "border-red-400"
                        : "border-white/30"
                    }`}
                  />
                </div>
              )}

              <div className="relative w-full mb-4">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (Minimum 5 characters)"
                    onChange={passwordHandler}
                    onBlur={passwordBlurHandler}
                    value={password}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 pr-12 text-white placeholder-gray-400 focus:outline-none font-['Archiv_Grotesk'] transition-all duration-300 ${
                      passwordIsInvalid
                        ? "border-red-400"
                        : "border-white/30"
                    }`}
                  />
                  <div
                    onClick={togglePassword}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {!isLogin && (
                <div className="relative w-full mb-4">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    onChange={confirmPasswordHandler}
                    onBlur={confirmPasswordBlurHandler}
                    value={confirmPassword}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-white placeholder-gray-400 focus:outline-none font-['Archiv_Grotesk'] transition-all duration-300 ${
                      confirmPasswordIsInvalid
                        ? "border-red-400"
                        : "border-white/30"
                    }`}
                  />
                  {confirmPasswordIsInvalid && (
                    <p className="text-[0.6rem] font-['Archiv_Grotesk'] font-light text-red-300 pl-4 mt-1">
                      Passwords did not match
                    </p>
                  )}
                </div>
              )}

              <div className="text-center mt-2 mb-1">
                {isLogin ? (
                  <button
                    disabled={!formValidity}
                    className={`w-1/2 h-10 rounded-full font-semibold mt-[3rem] font-['Archiv_Grotesk'] transition-all duration-200 ${
                      formValidity
                        ? "bg-gradient-to-r from-blue-900 to-purple-900 text-white cursor-pointer hover:shadow-lg hover:shadow-blue-500/25"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Login
                  </button>
                ) : (
                  <button
                    disabled={!formValidity}
                    className={`w-1/2 h-10 rounded-full font-semibold mt-[1rem] font-['Archiv_Grotesk'] transition-all duration-200 ${
                      formValidity
                        ? "bg-gradient-to-r from-blue-900 to-purple-900 text-white cursor-pointer hover:shadow-lg hover:shadow-blue-500/25"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Sign Up
                  </button>
                )}
              </div>
            </form>

            <div className="text-center text-xs mt-1">
              {isLogin && (
                <p className="font-['Archiv_Grotesk'] py-[10px] text-blue-100 ">
                  <a href="/forgot-password" className="hover:underline hover:text-blue-300">Forgot password?</a>
                </p>
              )}
            </div>
          </div>
          
        </div>

        <div
          className={`absolute top-0 h-full w-1/2 transition-all duration-1000 ease-in-out ${
            isLogin
              ? "left-1/2 bg-[#020817]/90   rounded-l-[7rem]"
              : "left-0 bg-[#020817]/90  rounded-r-[7rem]"
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center px-10 gap-[5rem] text-white">
            {isLogin ? (
              <h1 className="text-4xl font-['Archiv_Grotesk'] font-bold">Welcome Back</h1>
            ) : (
              <div className="flex items-center justify-center">
                <Image
                  src="/klyra_font.png"
                  alt="Klyra Logo"
                  width={200}
                  height={80}
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex flex-col justify-center items-center gap-[1rem]">
              <p className="text-center pb-[1rem] font-['Archiv_Grotesk']">
                {isLogin
                  ? "Register with your personal details to use all of site features"
                  : "Enter your personal details to use all of site features"}
              </p>

              <button
                onClick={() => setIsLogin((prev) => !prev)}
                className="bg-transparent border-2 border-white rounded-full px-8 py-2 font-semibold font-['Archiv_Grotesk'] hover:bg-white hover:text-blue-900 transition-all duration-200"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Authentication;