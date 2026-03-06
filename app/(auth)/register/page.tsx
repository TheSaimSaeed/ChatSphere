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
        if (index >= strength) return "bg-[var(--color-border)] font-medium";
        if (strength <= 2) return "bg-[var(--color-danger)]";
        if (strength === 3) return "bg-amber-500";
        return "bg-[var(--color-primary)]";
    };

    const onSubmit = async (data: RegisterInput) => {
        try {
            await dispatch(registerThunk(data)).unwrap();
            dispatch(addToast({ id: Date.now().toString(), message: "Account created successfully!", type: "success" }));
            router.push("/chat");
        } catch (error: any) {
            dispatch(addToast({ id: Date.now().toString(), message: error, type: "error" }));
        }
    };

    return (
        <div className="flex h-screen w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased overflow-hidden font-sans">

            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-header)] relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/5 rounded-full blur-[150px]"></div>
                <div className="relative z-10 max-w-md text-center">
                    <div className="size-20 bg-[var(--color-primary)] rounded-3xl flex items-center justify-center text-[var(--color-header)] mx-auto mb-8 shadow-2xl shadow-[var(--color-primary)]/20">
                        <MessageSquare className="w-10 h-10" fill="currentColor" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 font-sans tracking-tight">ChatSphere</h1>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        Connect with your team in real-time. Secure, fast, and beautifully designed messaging for the modern workplace.
                    </p>
                    <div className="mt-16 flex justify-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">10M+</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">Users</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">Uptime</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">24/7</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">Support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <main className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-[var(--color-bg-base)] relative">
                <div className="absolute top-8 right-8 z-20">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md my-auto">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-3 font-sans text-inherit">Create Account</h2>
                        <p className="text-[var(--color-text-secondary)]">Get started securely in seconds.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="name">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Alice Johnson"
                                    {...register("name")}
                                    className={`stitch-input pl-12 ${errors.name ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            {errors.name && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    {...register("email")}
                                    className={`stitch-input pl-12 ${errors.email ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            {errors.email && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={`stitch-input pl-12 pr-12 ${errors.password ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
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
                                <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">Must be at least 8 characters.</p>
                                {errors.password && <p className="text-[var(--color-danger)] text-xs font-medium">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="phone">Phone Number</label>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">optional</span>
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5" />
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    {...register("phone")}
                                    className={`stitch-input pl-12 ${errors.phone ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-1">E.164 format. Used for future features.</p>

                            {errors.phone && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.phone.message}</p>}
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
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Already have an account?
                            <Link href="/login" className="text-[var(--color-primary)] font-bold hover:underline ml-1">Sign In</Link>
                        </p>
                    </div>

                    <div className="mt-8 flex justify-center opacity-40">
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
