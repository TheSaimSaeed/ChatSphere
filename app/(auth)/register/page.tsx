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
        if (index >= strength) return "bg-[var(--color-border)]";
        if (strength <= 2) return "bg-[var(--color-danger)]";
        if (strength === 3) return "bg-yellow-500";
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
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] p-4 text-[var(--color-text-primary)]">
            <div className="fixed top-6 right-6">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-[1000px] h-[750px] bg-[var(--color-bg-surface)] rounded-[var(--radius-md)] shadow-lg overflow-hidden flex border border-[var(--color-border)]">

                {/* Left Column (hidden on mobile) */}
                <div className="hidden lg:flex lg:w-[40%] bg-[var(--color-header)] flex-col items-center justify-center text-center p-12">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <MessageSquare className="text-white w-10 h-10" fill="white" />
                    </div>
                    <h1 className="text-white text-3xl font-bold mb-2">ChatSphere</h1>
                    <p className="text-white/75 text-sm max-w-[240px]">Join millions messaging in real time.</p>
                </div>

                {/* Right Column (Form) */}
                <div className="w-full lg:w-[60%] flex flex-col justify-center p-8 md:p-16 overflow-y-auto">
                    <div className="max-w-[400px] mx-auto w-full">
                        <header className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Create your account</h2>
                            <p className="text-[var(--color-text-secondary)] text-sm">Free, fast, and always in sync.</p>
                        </header>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register("name")}
                                    className={`w-full h-11 px-4 border rounded-[var(--radius-sm)] outline-none transition-all bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${errors.name ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                                        }`}
                                    disabled={isSubmitting || isLoading}
                                />
                                {errors.name && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={`w-full h-11 px-4 border rounded-[var(--radius-sm)] outline-none transition-all bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${errors.email ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
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
                                        placeholder="Min. 8 characters"
                                        {...register("password")}
                                        className={`w-full h-11 px-4 pr-10 border rounded-[var(--radius-sm)] outline-none transition-all bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${errors.password ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
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

                                <div className="mt-2 flex gap-1 h-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-full transition-colors ${getStrengthClass(i)}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-1.5">
                                    <p className="text-[11px] text-[var(--color-text-secondary)]">Must be at least 8 characters.</p>
                                    {errors.password && <p className="text-[var(--color-danger)] text-xs">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]" htmlFor="phone">
                                        Phone Number
                                    </label>
                                    <span className="text-[11px] text-[var(--color-text-secondary)] bg-[var(--color-border)] px-1.5 py-0.5 rounded">optional</span>
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+923001234567"
                                    {...register("phone")}
                                    className={`w-full h-11 px-4 border rounded-[var(--radius-sm)] outline-none transition-all bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${errors.phone ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                                        }`}
                                    disabled={isSubmitting || isLoading}
                                />
                                <div className="flex justify-between mt-1.5">
                                    <p className="text-[11px] text-[var(--color-text-secondary)]">E.164 format, e.g. +923001234567. Used for future features.</p>
                                    {errors.phone && <p className="text-[var(--color-danger)] text-xs">{errors.phone.message}</p>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full h-11 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-[var(--radius-sm)] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting || isLoading ? <Spinner className="w-5 h-5 mr-2 text-white" /> : null}
                                    Create Account
                                </button>
                            </div>

                            <div className="text-center pt-2">
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
