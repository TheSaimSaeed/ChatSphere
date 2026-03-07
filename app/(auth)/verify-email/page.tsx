"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyEmailInput, verifyEmailSchema } from "@/lib/validations/authSchemas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyEmailThunk, resendOtpThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/shared/Spinner";
import { ArrowRight, Lock } from "lucide-react";
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
        <div className="flex h-screen w-full antialiased overflow-hidden text-slate-100" style={{ backgroundColor: '#0D1117', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12" style={{ backgroundColor: '#0a2e2e' }}>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(19,236,91,0.1)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(19,236,91,0.05)' }} />
                <div className="relative z-10 max-w-md text-center">
                    <div className="size-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#13ec5b]/20" style={{ backgroundColor: '#13ec5b', color: '#0a2e2e' }}>
                        <span className="material-symbols-outlined text-5xl font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48" }}>bubble_chart</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">ChatSphere</h1>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        Verify your identity to join the most secure workspace messaging platform.
                    </p>
                </div>
            </div>

            {/* Right panel */}
            <main className="w-full lg:w-1/2 flex flex-col overflow-y-auto p-8 relative" style={{ backgroundColor: '#0D1117' }}>
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md mx-auto my-auto py-6">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-3 text-white">Check your email</h2>
                        <p className="text-slate-400">
                            We&apos;ve sent a 6-digit code to <span className="font-semibold text-white">{emailFromParams}</span>. Enter it below to activate your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <input type="hidden" {...register("email")} />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="code">Verification Code</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    id="code"
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    {...register("code")}
                                    className={`w-full pl-12 py-3.5 rounded-xl outline-none transition-all bg-white/[0.03] border border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b]/20 tracking-widest text-center text-lg ${errors.code ? "!border-red-500 focus:!ring-red-500/20" : ""}`}
                                    disabled={isSubmitting || isLoading}
                                />
                            </div>
                            {errors.code && <p className="text-red-500 text-xs ml-1 font-medium">{errors.code.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#13ec5b]/10 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#13ec5b', color: '#0D1117' }}
                        >
                            {isSubmitting || isLoading ? <Spinner className="w-5 h-5 text-current" /> : null}
                            Verify Email
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-400">
                                Didn&apos;t receive the email?
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0 || isSubmitting || isLoading}
                                    className="font-bold hover:underline ml-1 disabled:opacity-50 disabled:no-underline" style={{ color: '#13ec5b' }}
                                >
                                    {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Code'}
                                </button>
                            </p>
                        </div>

                        <div className="mt-8 text-center">
                            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
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
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#0D1117' }}><Spinner /></div>}>
            <VerifyEmailForm />
        </Suspense>
    );
}
