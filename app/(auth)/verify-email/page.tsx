"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyEmailInput, verifyEmailSchema } from "@/lib/validations/authSchemas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyEmailThunk, resendOtpThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/shared/Spinner";
import { MessageSquare, ArrowRight, Lock, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function VerifyEmailForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get('email') || '';

    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const [resendCooldown, setResendCooldown] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<VerifyEmailInput>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: { email: emailFromParams, code: '' },
    });

    useEffect(() => {
        if (emailFromParams) {
            setValue('email', emailFromParams);
        }
    }, [emailFromParams, setValue]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const onSubmit = async (data: VerifyEmailInput) => {
        try {
            await dispatch(verifyEmailThunk(data)).unwrap();
            dispatch(addToast({ id: Date.now().toString(), message: "Email verified! Welcome to ChatSphere.", type: "success" }));
            router.push("/chat");
        } catch (error: any) {
            dispatch(addToast({ id: Date.now().toString(), message: error, type: "error" }));
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        const email = emailFromParams;
        if (!email) {
            dispatch(addToast({ id: Date.now().toString(), message: "Missing email address.", type: "error" }));
            return;
        }

        try {
            await dispatch(resendOtpThunk({ email })).unwrap();
            dispatch(addToast({ id: Date.now().toString(), message: "A new code has been sent to your email.", type: "success" }));
            setResendCooldown(60);
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
                        Verify your identity to join the most secure workspace messaging platform.
                    </p>
                </div>
            </div>

            {/* Right panel */}
            <main className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-[var(--chat-bg-base)] relative">
                <div className="absolute top-8 right-8 z-20">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md my-auto pb-12 pt-8">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-3 font-sans text-inherit">Check your email</h2>
                        <p className="text-[var(--chat-text-secondary)]">
                            We've sent a 6-digit verification code to <span className="font-semibold text-inherit">{emailFromParams}</span>. Enter it below to activate your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <input type="hidden" {...register("email")} />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--chat-text-primary)] ml-1" htmlFor="code">Verification Code</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--chat-text-secondary)] w-5 h-5" />
                                <input
                                    id="code"
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    {...register("code")}
                                    className={`stitch-input pl-12 tracking-widest text-center text-lg ${errors.code ? "!border-[var(--chat-danger)] focus:!ring-[var(--chat-danger)]/50" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            {errors.code && <p className="text-[var(--chat-danger)] text-xs ml-1 font-medium">{errors.code.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="stitch-btn"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? <Spinner className="w-5 h-5 text-current" /> : null}
                            Verify Email
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-[var(--chat-text-secondary)]">
                                Didn't receive the email?
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0 || isSubmitting || isLoading}
                                    className="text-[var(--chat-primary)] font-bold hover:underline ml-1 disabled:opacity-50 disabled:no-underline"
                                >
                                    {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Code'}
                                </button>
                            </p>
                        </div>

                        <div className="mt-8 text-center">
                            <Link href="/login" className="text-sm font-bold text-[var(--chat-text-secondary)] hover:text-[var(--chat-text-primary)] transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[var(--chat-bg-base)]"><Spinner /></div>}>
            <VerifyEmailForm />
        </Suspense>
    );
}
