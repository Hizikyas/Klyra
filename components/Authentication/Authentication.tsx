"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import useInput from "./useInput";
import GradientText from "./GradientText";

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(false); // Default to sign up
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { inputHandler: fullNameHandler, inputBlurHandler: fullNameBlurHandler, enteredValue: fullName, enteredValid: fullNameIsValid, inValid: fullNameIsInvalid, reset: resetFullName } = useInput((value) => value.trim() !== "");
  const { inputHandler: usernameHandler, inputBlurHandler: usernameBlurHandler, enteredValue: username, enteredValid: usernameIsValid, inValid: usernameIsInvalid, reset: resetUsername } = useInput((value) => value.trim() !== "");
  const { inputHandler: emailHandler, inputBlurHandler: emailBlurHandler, enteredValue: email, enteredValid: emailIsValid, inValid: emailIsInvalid, reset: resetEmail } = useInput((value) => value.includes("@"));
  const { inputHandler: passwordHandler, inputBlurHandler: passwordBlurHandler, enteredValue: password, enteredValid: passwordIsValid, inValid: passwordIsInvalid, reset: resetPassword } = useInput((value) => value.length >= 5);
  const { inputHandler: confirmPasswordHandler, inputBlurHandler: confirmPasswordBlurHandler, enteredValue: confirmPassword, enteredValid: confirmPasswordIsValid, inValid: confirmPasswordIsInvalid, reset: resetConfirmPassword } = useInput((value) => value === password);

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
      : { fullName, username, email, password };

    console.log("Form submitted:", userData);

    resetFullName();
    resetUsername();
    resetEmail();
    resetPassword();
    resetConfirmPassword();

    if (!isLogin) {
      setIsLogin(true);
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
          onClick={() => router.push("/")} 
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

      <div className="bg-gray-100 rounded-3xl shadow-lg overflow-hidden w-full max-w-4xl min-h-[480px] relative">
        
        <div
          className={`absolute top-0 h-full transition-all duration-1000 ease-in-out ${
            isLogin ? "left-0 w-1/2" : "left-1/2 w-1/2"
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center px-10">
            <h1 className="text-2xl font-bold mb-3 font-['Archiv_Grotesk']">
              {isLogin ? "Login" : "Sign Up"}
            </h1>

            <form onSubmit={submitHandler} className="w-full">
              {!isLogin && (
                <div className="relative w-full">
                  <div className="input flex flex-col">
                    <label
                      htmlFor="fullName"
                      className="text-gray-700 font-['Archiv_Grotesk'] text-xs relative top-2 left-4 ml-[7px] px-[3px] bg-gray-100 w-fit"
                    >
                      Full Name :
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      onChange={fullNameHandler}
                      onBlur={fullNameBlurHandler}
                      value={fullName}
                      className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-gray-700 placeholder-gray-500 focus:outline-none font-['Archiv_Grotesk'] ${
                        fullNameIsInvalid
                          ? "bg-red-600/30 border-red-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {fullNameIsInvalid && (
                    <p className="text-[0.5rem] font-['Archiv_Grotesk'] font-light text-red-600 pl-4">
                      Full Name must not be empty
                    </p>
                  )}
                </div>
              )}

              <div className="relative w-full">
                <div className="input flex flex-col static">
                  <label
                    htmlFor="username"
                    className="text-gray-700 font-['Archiv_Grotesk'] text-xs relative top-2 left-4 ml-[7px] px-[3px] bg-gray-100 w-fit"
                  >
                    Username :
                  </label>
                  <input
                    id="username"
                    type="text"
                    onChange={usernameHandler}
                    onBlur={usernameBlurHandler}
                    value={username}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-gray-700 placeholder-gray-500 focus:outline-none font-['Archiv_Grotesk'] ${
                      usernameIsInvalid
                        ? "bg-red-600/30 border-red-600"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {usernameIsInvalid && (
                  <p className="text-[0.5rem] font-['Archiv_Grotesk'] font-light text-red-600 pl-4">
                    Username must not be empty
                  </p>
                )}
              </div>

              {!isLogin && (
                <div className="relative w-full">
                  <div className="input flex flex-col">
                    <label
                      htmlFor="email"
                      className="text-gray-700 font-['Archiv_Grotesk'] text-xs relative top-2 left-4 ml-[7px] px-[3px] bg-gray-100 w-fit"
                    >
                      Email :
                    </label>
                    <input
                      id="email"
                      type="email"
                      onChange={emailHandler}
                      onBlur={emailBlurHandler}
                      value={email}
                      className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-gray-700 placeholder-gray-500 focus:outline-none font-['Archiv_Grotesk'] ${
                        emailIsInvalid
                          ? "bg-red-600/30 border-red-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {emailIsInvalid && (
                    <p className="text-[0.5rem] font-['Archiv_Grotesk'] font-light text-red-600 pl-4">
                      Email must contain '@' character
                    </p>
                  )}
                </div>
              )}

              <div className="relative w-full">
                <div className="input flex flex-col static">
                  <label
                    htmlFor="password"
                    className="text-gray-700 font-['Archiv_Grotesk'] text-xs relative top-2 left-4 ml-[7px] px-[3px] bg-gray-100 w-fit"
                  >
                    Password :
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    onChange={passwordHandler}
                    onBlur={passwordBlurHandler}
                    value={password}
                    className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-gray-700 placeholder-gray-500 focus:outline-none font-['Archiv_Grotesk'] ${
                      passwordIsInvalid
                        ? "bg-red-600/30 border-red-600"
                        : "border-gray-300"
                    }`}
                  />
                  <div
                    onClick={togglePassword}
                    className="absolute right-4 top-1/2 transform -translate-y-[10px] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </div>
                </div>
                {passwordIsInvalid && (
                  <p className="text-[0.5rem] font-['Archiv_Grotesk'] font-light text-red-600 pl-4">
                    Password must contain at least 5 characters
                  </p>
                )}
              </div>

              {!isLogin && (
                <div className="relative w-full">
                  <div className="input flex flex-col static">
                    <label
                      htmlFor="confirmPassword"
                      className="text-gray-700 font-['Archiv_Grotesk'] text-xs relative top-2 left-4 ml-[7px] px-[3px] bg-gray-100 w-fit"
                    >
                      Confirm Password :
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      onChange={confirmPasswordHandler}
                      onBlur={confirmPasswordBlurHandler}
                      value={confirmPassword}
                      className={`w-full h-10 bg-transparent border-2 rounded-full px-4 text-gray-700 placeholder-gray-500 focus:outline-none font-['Archiv_Grotesk'] ${
                        confirmPasswordIsInvalid
                          ? "bg-red-600/30 border-red-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {confirmPasswordIsInvalid && (
                    <p className="text-[0.5rem] font-['Archiv_Grotesk'] font-light text-red-600 pl-4">
                      Passwords did not match
                    </p>
                  )}
                </div>
              )}

              <div className="text-center mt-2 mb-1">
                {isLogin ? (
                  <button
                    disabled={!formValidity}
                    className={`w-1/2 h-10 rounded-full font-semibold mt-[3rem] font-['Archiv_Grotesk'] ${
                      formValidity
                        ? "bg-gradient-to-r from-blue-900 to-purple-900 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Login
                  </button>
                ) : (
                  <button
                    disabled={!formValidity}
                    className={`w-1/2 h-10 rounded-full font-semibold mt-[1rem] font-['Archiv_Grotesk'] ${
                      formValidity
                        ? "bg-gradient-to-r from-blue-900 to-purple-900 text-white cursor-pointer"
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
                <p className="font-['Archiv_Grotesk'] py-[10px] text-blue-600">
                  <a href="/forgot-password" className="hover:underline">Forgot password?</a>
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`absolute top-0 h-full w-1/2 transition-all duration-1000 ease-in-out ${
            isLogin
              ? "left-1/2 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-l-[7rem]"
              : "left-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-r-[7rem]"
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center px-10 gap-[5rem] text-white">
            {isLogin ? (
              <h1 className="text-4xl font-['Archiv_Grotesk'] font-bold">Welcome Back</h1>
            ) : (
              <GradientText
                colors={["#00FF00", "#FFFFFF", "#FFFF00", "#FF0000"]}
                animationSpeed={3}
                showBorder={false}
                className="text-6xl font-['Archiv_Grotesk'] font-bold"
              >
                Klyra
              </GradientText>
            )}

            <div className="flex flex-col justify-center items-center gap-[1rem]">
              <p className="text-center pb-[1rem] font-['Archiv_Grotesk']">
                {isLogin
                  ? "Register with your personal details to use all of site features"
                  : "Enter your personal details to use all of site features"}
              </p>

              <button
                onClick={() => setIsLogin((prev) => !prev)}
                className="bg-transparent border-2 border-white rounded-full px-8 py-2 font-semibold font-['Archiv_Grotesk']"
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

