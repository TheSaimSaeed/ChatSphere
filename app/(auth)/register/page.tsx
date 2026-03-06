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
import { Eye, EyeOff, MessageSquare } from "lucide-react";
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
        if (index >= strength) return "bg-gray-200 dark:bg-gray-700 font-medium";
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
                    <h1 className="text-4xl font-bold text-white mb-6 font-sans">Join millions messaging in real time.</h1>
                    <p className="text-white/70 text-lg leading-relaxed">
                        Free, fast, and always in sync. Build connections worldwide today.
                    </p>
                </div>

                <div className="absolute -bottom-24 -left-24 size-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 size-96 bg-black/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex flex-col relative bg-[var(--color-bg-surface)] overflow-y-auto">
                <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 md:px-24 py-12">
                    <div className="w-full max-w-md">

                        <div className="lg:hidden flex items-center gap-2 mb-12 mt-8">
                            <div className="size-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-header)] dark:text-white">
                                <MessageSquare className="w-6 h-6" fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-[var(--color-header)] dark:text-white">ChatSphere</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 font-sans">Create your account</h2>
                            <p className="text-[var(--color-text-secondary)]">Free, fast, and always in sync.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Alice Johnson"
                                    {...register("name")}
                                    className={`stitch-input ${errors.name ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20" : ""}`}
                                />
                                {errors.name && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={`stitch-input ${errors.email ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20" : ""}`}
                                />
                                {errors.email && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-text-primary)] ml-1" htmlFor="password">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
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

                                <div className="mt-3 flex gap-1 h-[4px]">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-[2px] transition-colors ${getStrengthClass(i)}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-[11px] text-[var(--color-text-secondary)] mt-2 font-medium">Must be at least 8 characters.</p>
                                {errors.password && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="phone">Phone Number</label>
                                    <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] bg-[var(--color-border)]/50 px-2 py-0.5 rounded-full">optional</span>
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+923001234567"
                                    {...register("phone")}
                                    className={`stitch-input ${errors.phone ? "!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/20" : ""}`}
                                />

                                <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-1">E.164 format. Used for future features.</p>

                                {errors.phone && <p className="text-[var(--color-danger)] text-xs ml-1 font-medium">{errors.phone.message}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="stitch-btn mt-2"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting || isLoading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                                    Create Account
                                </button>
                            </div>

                        </form>

                        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
                            Already have an account?
                            <Link href="/login" className="text-[var(--color-header)] dark:text-[var(--color-primary)] font-bold hover:underline ml-1">Sign in</Link>
                        </p>

                        <div className="mt-12 text-center pb-8 border-b border-transparent">
                            <p className="text-[10px] text-[var(--color-text-secondary)] opacity-60 font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
