"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerSchema } from "@/lib/validations/authSchemas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/shared/Spinner";
import { Eye, EyeOff, MessageSquare, ArrowRight, Mail, Lock, User, Phone } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password", "");

    const calculatePasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length > 7) strength += 1;
        if (pass.match(/[a-z]+/)) strength += 1;
        if (pass.match(/[A-Z]+/)) strength += 1;
        if (pass.match(/[0-9]+/)) strength += 1;
        if (pass.match(/[$@#&!?*]+/)) strength += 1;
        return strength;
    };

    const strength = calculatePasswordStrength(password);

    const getStrengthClass = (index: number) => {
        if (index >= strength) return "bg-[var(--chat-border)] font-medium";
        if (strength <= 2) return "bg-[var(--chat-danger)]";
        if (strength === 3) return "bg-amber-500";
        return "bg-[var(--chat-primary)]";
    };

    const onSubmit = async (data: RegisterInput) => {
        try {
            await dispatch(registerThunk(data)).unwrap();
            dispatch(addToast({ id: Date.now().toString(), message: "Verification code sent to your email.", type: "success" }));
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (error: any) {
            dispatch(addToast({ id: Date.now().toString(), message: error, type: "error" }));
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

                <div className="w-full max-w-md my-auto">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-3 font-sans text-inherit">Create Account</h2>
                        <p className="text-[var(--chat-text-secondary)]">Get started securely in seconds.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--chat-text-primary)] ml-1" htmlFor="name">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--chat-text-secondary)] w-5 h-5" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Alice Johnson"
                                    {...register("name")}
                                    className={`stitch-input pl-12 ${errors.name ? "!border-[var(--chat-danger)] focus:!ring-[var(--chat-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            {errors.name && <p className="text-[var(--chat-danger)] text-xs ml-1 font-medium">{errors.name.message}</p>}
                        </div>

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
                            <label className="text-sm font-semibold text-[var(--chat-text-primary)] ml-1" htmlFor="password">Password</label>
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

                            <div className="mt-3 flex gap-1 h-[4px]">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-[2px] transition-colors ${getStrengthClass(i)}`}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-1">
                                <p className="text-[11px] text-[var(--chat-text-secondary)] font-medium">Must be at least 8 characters.</p>
                                {errors.password && <p className="text-[var(--chat-danger)] text-xs font-medium">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-[var(--chat-text-primary)]" htmlFor="phone">Phone Number</label>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--chat-text-secondary)] bg-[var(--chat-border)] px-2 py-0.5 rounded-full">optional</span>
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--chat-text-secondary)] w-5 h-5" />
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    {...register("phone")}
                                    className={`stitch-input pl-12 ${errors.phone ? "!border-[var(--chat-danger)] focus:!ring-[var(--chat-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            <p className="text-[11px] text-[var(--chat-text-secondary)] font-medium mt-1">E.164 format. Used for future features.</p>

                            {errors.phone && <p className="text-[var(--chat-danger)] text-xs ml-1 font-medium">{errors.phone.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="stitch-btn mt-6"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? <Spinner className="w-5 h-5 text-current" /> : null}
                            Create Account
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>

                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-[var(--chat-text-secondary)]">
                            Already have an account?
                            <Link href="/login" className="text-[var(--chat-primary)] font-bold hover:underline ml-1">Sign In</Link>
                        </p>
                    </div>

                    <div className="mt-8 flex justify-center opacity-40">
                        <p className="text-[10px] text-[var(--chat-text-secondary)] font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
