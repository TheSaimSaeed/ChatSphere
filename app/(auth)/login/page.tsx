"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, loginSchema } from "@/lib/validations/authSchemas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/shared/Spinner";
import { MessageSquare } from "lucide-react";

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isLoading = useAppSelector((state) => state.auth.isLoading);

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
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] p-4">
            <div className="w-full max-w-[400px] bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mb-4">
                        <MessageSquare className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Welcome back</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
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
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white mt-4"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                        Sign In
                    </Button>
                </form>

                <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[var(--color-primary)] hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
