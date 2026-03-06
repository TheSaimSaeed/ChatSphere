"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerSchema } from "@/lib/validations/authSchemas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/shared/Spinner";
import { MessageSquare } from "lucide-react";

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isLoading = useAppSelector((state) => state.auth.isLoading);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password", "");

    // Basic password entropy indicator function
    const calculatePasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length > 7) strength += 1;
        if (pass.match(/[a-z]+/)) strength += 1;
        if (pass.match(/[A-Z]+/)) strength += 1;
        if (pass.match(/[0-9]+/)) strength += 1;
        if (pass.match(/[$@#&!]+/)) strength += 1;
        return strength;
    };

    const strength = calculatePasswordStrength(password);
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-600"];

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
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] p-4">
            <div className="w-full max-w-[400px] bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mb-4">
                        <MessageSquare className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Create an account</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Start messaging instantly.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name")}
                            className={`bg-[var(--color-bg-base)] focus-visible:ring-[var(--color-primary)] ${errors.name ? "border-red-500 focus-visible:ring-red-500" : "border-[var(--color-border)]"
                                }`}
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email")}
                            className={`bg-[var(--color-bg-base)] focus-visible:ring-[var(--color-primary)] ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-[var(--color-border)]"
                                }`}
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            className={`bg-[var(--color-bg-base)] focus-visible:ring-[var(--color-primary)] ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-[var(--color-border)]"
                                }`}
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <div className="mt-2 flex gap-1 h-1.5 w-full">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-full flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white mt-4"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                        Sign Up
                    </Button>
                </form>

                <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
