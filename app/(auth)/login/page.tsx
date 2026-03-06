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
        <div className="flex h-screen w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased overflow-hidden">

            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-[var(--color-header)] flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute top-12 left-12 flex items-center gap-2 text-white">
                    <div className="size-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-header)]">
                        <MessageSquare className="w-6 h-6" fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">ChatSphere</span>
                </div>

                <div className="max-w-md text-center z-10">
                    <div className="size-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 mx-auto">
                        <MessageSquare className="w-12 h-12 text-white" fill="white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-6 font-sans">Connect with the world in real-time.</h1>
                    <p className="text-white/70 text-lg leading-relaxed">
                        Experience seamless messaging with advanced encryption and intuitive design. Join millions of users worldwide.
                    </p>
                </div>

                <div className="absolute -bottom-24 -left-24 size-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 size-96 bg-black/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex flex-col relative bg-[var(--color-bg-surface)]">
                <div className="absolute top-8 right-8 flex items-center gap-4">
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 md:px-24">
                    <div className="w-full max-w-md">

                        <div className="lg:hidden flex items-center gap-2 mb-12">
                            <div className="size-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-header)] dark:text-white">
                                <MessageSquare className="w-6 h-6" fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-[var(--color-header)] dark:text-white">ChatSphere</span>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 font-sans">Welcome back</h2>
                            <p className="text-[var(--color-text-secondary)]">Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    {...register("email")}
                                    className={`stitch-input ${errors.email ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20" : ""}`}
                                />
                                {errors.email && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="password">Password</label>
                                    <Link href="#" className="text-sm font-medium text-[var(--color-header)] dark:text-[var(--color-primary)] hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className={`stitch-input pr-12 ${errors.password ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.password.message}</p>}
                            </div>

                            <div className="flex items-center gap-2 ml-1">
                                <input type="checkbox" id="remember" className="size-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                                <label htmlFor="remember" className="text-sm text-[var(--color-text-secondary)] cursor-pointer tracking-tight">Remember me for 30 days</label>
                            </div>

                            <button
                                type="submit"
                                className="stitch-btn mt-2"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                                Sign In
                            </button>
                        </form>

                        <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">
                            Don't have an account?
                            <Link href="/register" className="text-[var(--color-header)] dark:text-[var(--color-primary)] font-bold hover:underline ml-1">Create account</Link>
                        </p>

                        <div className="mt-12 text-center">
                            <p className="text-[10px] text-[var(--color-text-secondary)] opacity-60 font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
