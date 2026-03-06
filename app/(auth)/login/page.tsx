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
import { Eye, EyeOff, MessageSquare } from "lucide-react";
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
            dispatch(addToast({ id: Date.now().toString(), message: error, type: "error" }));
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
            {/* Left Column (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[40%] bg-[var(--color-header)] flex-col items-center justify-center p-12 text-center">
                <div className="mb-6">
                    <MessageSquare className="text-white w-16 h-16" fill="white" />
                </div>
                <h1 className="text-white text-3xl font-bold mb-2">ChatSphere</h1>
                <p className="text-white/75 text-sm max-w-[240px]">Simple, fast, real-time messaging.</p>
            </div>

            {/* Right Column (Form) */}
            <div className="w-full lg:w-[60%] bg-[var(--color-bg-surface)] flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>

                <div className="lg:hidden mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-[var(--color-header)] rounded-xl mb-4">
                        <MessageSquare className="text-white w-10 h-10" fill="white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ChatSphere</h1>
                </div>

                <div className="w-full max-w-[400px]">
                    <header className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Welcome back</h2>
                        <p className="text-[var(--color-text-secondary)] text-sm">Sign in to continue</p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5" htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className={`w-full h-11 px-4 border rounded-[var(--radius-sm)] outline-none transition-colors bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${errors.email ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                                    }`}
                                disabled={isSubmitting || isLoading}
                            />
                            {errors.email && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={`w-full h-11 px-4 pr-10 border rounded-[var(--radius-sm)] outline-none transition-colors bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${errors.password ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                                        }`}
                                    disabled={isSubmitting || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.password.message}</p>}
                            <div className="flex justify-end mt-2">
                                <Link href="#" className="text-xs text-[var(--color-primary)] font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-11 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-[var(--radius-sm)] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? <Spinner className="w-5 h-5 mr-2 text-white" /> : null}
                            Sign In
                        </button>
                        <div className="text-center pt-2">
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-[var(--color-primary)] font-semibold hover:underline ml-1">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </form>

                    <footer className="mt-12 pt-8 border-t border-[var(--color-border)] text-center">
                        <p className="text-xs text-[var(--color-text-secondary)] opacity-60">
                            © 2026 ChatSphere. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
