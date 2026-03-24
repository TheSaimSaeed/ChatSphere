import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

/** Forgot Password page — UI Only */
export default function ForgotPasswordPage() {
    const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all bg-transparent border border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-[#13ec5b]/50 focus:ring-1 focus:ring-[#13ec5b]/50";

    return (
        <div className="flex h-screen w-full overflow-hidden antialiased text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#121212' }}>

            {/* ── Left panel (dark teal) ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12" style={{ backgroundColor: '#0a2e2e' }}>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(19,236,91,0.1)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(19,236,91,0.05)' }} />
                <div className="relative z-10 max-w-md text-center">
                    <div className="size-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#13ec5b]/20" style={{ backgroundColor: '#13ec5b', color: '#0a2e2e' }}>
                        <span className="material-symbols-outlined text-5xl font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48" }}>lock_reset</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">Recovery</h1>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        Regain access to your ChatSphere account and reconnect with your team in seconds.
                    </p>
                    <div className="mt-16 flex justify-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">Fast</p>
                            <p className="text-sm text-slate-400">Recovery</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">Secure</p>
                            <p className="text-sm text-slate-400">Process</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel ── */}
            <main className="w-full lg:w-1/2 flex flex-col overflow-y-auto p-8 relative" style={{ backgroundColor: '#121212' }}>
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>
                <div className="w-full max-w-md mx-auto my-auto py-6">
                    <div className="mb-10 text-center lg:text-left">
                        <Link href="/login" className="inline-flex items-center text-sm font-semibold mb-6 hover:opacity-80 transition-opacity" style={{ color: '#13ec5b' }}>
                            <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
                            Back to login
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-3">Forgot Password</h2>
                        <p className="text-slate-400">Enter your email address and we&apos;ll send you a link to reset your password.</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="button"
                            className="w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#13ec5b]/10 mt-8 hover:brightness-110 active:scale-[0.98]"
                            style={{ backgroundColor: '#13ec5b', color: '#121212' }}
                        >
                            Send Reset Link
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </form>

                    <div className="mt-20 flex justify-center opacity-30">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">ChatSphere Engine v2.4.0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
