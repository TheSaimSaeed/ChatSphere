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
import { Eye, EyeOff, MessageSquare, ArrowRight, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

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
        } catch (error: any) {
            if (error?.isUnverified) {
                dispatch(addToast({ id: Date.now().toString(), message: error.error, type: "error" }));
                router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
            } else {
                dispatch(addToast({ id: Date.now().toString(), message: error?.error || error || "Login failed", type: "error" }));
            }
        }
    };

    return (
        <div className="flex h-screen w-full bg-[var(--chat-bg-base)] text-[var(--chat-text-primary)] antialiased overflow-hidden font-sans">

            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[var(--chat-header)] relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--chat-primary)]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--chat-primary)]/5 rounded-full blur-[150px]"></div>
                <div className="relative z-10 max-w-md text-center">
                    <div className="size-20 bg-[var(--chat-primary)] rounded-3xl flex items-center justify-center text-[var(--chat-header)] mx-auto mb-8 shadow-2xl shadow-[var(--chat-primary)]/20">
                        <MessageSquare className="w-10 h-10" fill="currentColor" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 font-sans tracking-tight">ChatSphere</h1>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        Connect with your team in real-time. Secure, fast, and beautifully designed messaging for the modern workplace.
                    </p>
                    <div className="mt-16 flex justify-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">10M+</p>
                            <p className="text-sm text-[var(--chat-text-secondary)]">Users</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-[var(--chat-text-secondary)]">Uptime</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">24/7</p>
                            <p className="text-sm text-[var(--chat-text-secondary)]">Support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <main className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-[var(--chat-bg-base)] relative">
                <div className="absolute top-8 right-8 z-20">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md my-auto pb-12 pt-8">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-3 font-sans text-inherit">Welcome Back</h2>
                        <p className="text-[var(--chat-text-secondary)]">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--chat-text-primary)] ml-1" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--chat-text-secondary)] w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    {...register("email")}
                                    className={`stitch-input pl-12 ${errors.email ? "!border-[var(--chat-danger)] focus:!ring-[var(--chat-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            {errors.email && <p className="text-[var(--chat-danger)] text-xs ml-1 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-[var(--chat-text-primary)]" htmlFor="password">Password</label>
                                <Link href="#" className="text-xs font-semibold text-[var(--chat-primary)] hover:text-[var(--chat-primary-dark)] transition-colors">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--chat-text-secondary)] w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={`stitch-input pl-12 pr-12 ${errors.password ? "!border-[var(--chat-danger)] focus:!ring-[var(--chat-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--chat-text-secondary)] hover:text-[var(--chat-text-primary)] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[var(--chat-danger)] text-xs ml-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="size-5 rounded border-[var(--chat-border)] bg-[var(--chat-bg-surface)] text-[var(--chat-primary)] focus:ring-[var(--chat-primary)] focus:ring-offset-[var(--chat-bg-base)] transition-all cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-[var(--chat-text-secondary)] cursor-pointer">Keep me signed in</label>
                        </div>

                        <button
                            type="submit"
                            className="stitch-btn"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? <Spinner className="w-5 h-5 text-current" /> : null}
                            Sign In
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--chat-border)]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--chat-bg-base)] px-4 text-[var(--chat-text-secondary)] font-bold tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[var(--chat-border)] bg-[var(--chat-bg-surface)] hover:bg-[var(--chat-border)] transition-all text-[var(--chat-text-primary)] text-sm font-semibold">
                                <svg className="size-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                Google
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[var(--chat-border)] bg-[var(--chat-bg-surface)] hover:bg-[var(--chat-border)] transition-all text-[var(--chat-text-primary)] text-sm font-semibold">
                                <svg className="size-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-[var(--chat-text-secondary)]">
                            Don't have an account?
                            <Link href="/register" className="text-[var(--chat-primary)] font-bold hover:underline ml-1">Create Account</Link>
                        </p>
                    </div>

                    <div className="mt-10 flex justify-center opacity-40">
                        <p className="text-[10px] text-[var(--chat-text-secondary)] font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
