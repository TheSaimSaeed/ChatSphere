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
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useState } from "react";

/** Registration page — matches the ChatSphere Stitch design for the Create Account screen. */
export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        try {
            await dispatch(registerThunk(data)).unwrap();
            dispatch(addToast({ id: Date.now().toString(), message: "Verification code sent to your email.", type: "success" }));
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (error: unknown) {
            dispatch(addToast({ id: Date.now().toString(), message: String(error), type: "error" }));
        }
    };

    const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all bg-white/[0.03] border border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b]/20";
    const inputErrorClass = "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20";

    return (
        <div className="flex h-screen w-full overflow-hidden antialiased text-slate-100" style={{ backgroundColor: '#0D1117', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ backgroundColor: '#080a0d' }}>
                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="size-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#13ec5b]/20" style={{ backgroundColor: '#13ec5b', color: '#0D1117' }}>
                            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>bubble_chart</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">ChatSphere</span>
                    </div>
                    {/* Hero text */}
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold text-white leading-tight mb-6">Connect with the world in real-time.</h1>
                        <p className="text-lg leading-relaxed text-slate-400">Experience a new era of messaging with powerful media sharing, crystal clear calls, and secure conversations.</p>
                    </div>
                </div>

                {/* Social proof */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 p-4 rounded-2xl max-w-sm backdrop-blur-sm border border-white/10 bg-white/5">
                        <div className="flex -space-x-3">
                            {(['#4f46e5', '#0891b2', '#059669'] as const).map((color, i) => (
                                <div key={i} className="size-10 rounded-full border-2 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: color, borderColor: '#080a0d' }}>
                                    {['A', 'B', 'C'][i]}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-medium text-slate-300">
                            Join <span style={{ color: '#13ec5b' }}>2,000+</span> teams already using ChatSphere
                        </p>
                    </div>
                </div>

                {/* Glow blobs */}
                <div className="absolute top-[-10%] right-[-10%] size-96 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(19,236,91,0.1)' }} />
                <div className="absolute bottom-[-5%] left-[-5%] size-64 rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(19,236,91,0.05)' }} />
            </div>

            {/* ── Right panel ── */}
            <main className="w-full lg:w-1/2 flex flex-col overflow-y-auto p-6 sm:p-12 relative" style={{ backgroundColor: '#0D1117' }}>
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>
                <div className="w-full max-w-md mx-auto my-auto py-6">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
                        <p className="text-slate-400">Join ChatSphere and start messaging today.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="name">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">person</span>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register("name")}
                                    disabled={isSubmitting || isLoading}
                                    className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">mail</span>
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
                            <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
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
                            <p className="text-[11px] text-slate-500 ml-1 mt-1">Must be at least 8 characters long.</p>
                            {errors.password && <p className="text-red-500 text-xs ml-1 font-medium">{errors.password.message}</p>}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 py-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 size-4 rounded cursor-pointer border border-white/10 bg-white/5 accent-[#13ec5b]"
                            />
                            <label className="text-xs text-slate-400 leading-relaxed cursor-pointer" htmlFor="terms">
                                By creating an account, I agree to the{" "}
                                <span className="text-[#13ec5b] hover:underline cursor-pointer">Terms of Service</span>{" "}
                                and{" "}
                                <span className="text-[#13ec5b] hover:underline cursor-pointer">Privacy Policy</span>.
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#13ec5b]/10"
                            style={{ backgroundColor: '#13ec5b', color: '#0D1117' }}
                        >
                            {(isSubmitting || isLoading) && <Spinner className="w-5 h-5 text-current" />}
                            Create Account
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Or continue with</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Social buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button type="button" className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                            <svg className="size-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-medium text-slate-300">Google</span>
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                            <svg className="size-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            <span className="text-sm font-medium text-slate-300">GitHub</span>
                        </button>
                    </div>

                    {/* Footer link */}
                    <div className="mt-10 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#13ec5b' }}>Sign in</Link>
                        </p>
                    </div>

                    <div className="mt-16 flex justify-center lg:justify-start">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
