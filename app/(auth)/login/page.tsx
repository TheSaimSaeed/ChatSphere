"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, loginSchema } from "@/lib/validations/authSchemas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/shared/Spinner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useState } from "react";

/** Login page — matches the ChatSphere Stitch design for the Sign In screen. */
export default function LoginPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        try {
            await dispatch(loginThunk(data)).unwrap();
            dispatch(addToast({ id: Date.now().toString(), message: "Welcome back!", type: "success" }));
            router.push("/chat");
        } catch (error: unknown) {
            const err = error as { isUnverified?: boolean; error?: string };
            if (err?.isUnverified) {
                dispatch(addToast({ id: Date.now().toString(), message: err.error ?? "Email not verified", type: "error" }));
                router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
            } else {
                dispatch(addToast({ id: Date.now().toString(), message: err?.error ?? String(error) ?? "Login failed", type: "error" }));
            }
        }
    };

    const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all bg-transparent border border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-[#13ec5b]/50 focus:ring-1 focus:ring-[#13ec5b]/50";
    const inputErrorClass = "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20";

    return (
        <div className="flex h-screen w-full overflow-hidden antialiased text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#121212' }}>

            {/* ── Left panel (dark teal) ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12" style={{ backgroundColor: '#0a2e2e' }}>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(19,236,91,0.1)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(19,236,91,0.05)' }} />
                <div className="relative z-10 max-w-md text-center">
                    <div className="size-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#13ec5b]/20" style={{ backgroundColor: '#13ec5b', color: '#0a2e2e' }}>
                        <span className="material-symbols-outlined text-5xl font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48" }}>bubble_chart</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">ChatSphere</h1>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        Connect with your team in real-time. Secure, fast, and beautifully designed messaging for the modern workplace.
                    </p>
                    <div className="mt-16 flex justify-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">10M+</p>
                            <p className="text-sm text-slate-400">Users</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-slate-400">Uptime</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">24/7</p>
                            <p className="text-sm text-slate-400">Support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel ── */}
            <main className="w-full lg:w-1/2 flex flex-col overflow-y-auto p-8 relative" style={{ backgroundColor: '#121212' }}>
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>
                <div className="w-full max-w-md mx-auto my-auto py-6">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
                        <p className="text-slate-400">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    {...register("email")}
                                    disabled={isSubmitting || isLoading}
                                    className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs ml-1 font-medium">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-300" htmlFor="password">Password</label>
                                <Link href="#" className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#13ec5b' }}>Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    disabled={isSubmitting || isLoading}
                                    className={`${inputClass} pr-12 ${errors.password ? inputErrorClass : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs ml-1 font-medium">{errors.password.message}</p>}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-3 py-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="size-5 rounded cursor-pointer border border-white/10 bg-white/5 accent-[#13ec5b]"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">Keep me signed in</label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#13ec5b]/10 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#13ec5b', color: '#121212' }}
                        >
                            {(isSubmitting || isLoading) && <Spinner className="w-5 h-5 text-current" />}
                            Sign In
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-4 text-slate-500 font-bold tracking-widest" style={{ backgroundColor: '#121212' }}>Or continue with</span>
                            </div>
                        </div>

                        {/* Social buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/auth/login?connection=google-oauth2" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-slate-200 text-sm font-semibold">
                                <svg className="size-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Link>
                            <Link href="/auth/login?connection=github" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-slate-200 text-sm font-semibold">
                                <svg className="size-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                GitHub
                            </Link>
                        </div>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-bold hover:underline ml-1" style={{ color: '#13ec5b' }}>Create Account</Link>
                        </p>
                    </div>

                    <div className="mt-20 flex justify-center opacity-30">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

