import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

interface AvatarProps {
    src?: string | null;
    name: string;
    className?: string;
    isOnline?: boolean;
}

const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500",
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500",
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
    "bg-pink-500", "bg-rose-500"
];

function stringToColorIndex(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
}

export function Avatar({ src, name, className = "w-10 h-10", isOnline }: AvatarProps) {
    const initials = useMemo(() => {
        return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    }, [name]);

    const bgColorClass = useMemo(() => {
        return colors[stringToColorIndex(name)];
    }, [name]);

    return (
        <div className={`relative inline-block ${className}`}>
            <ShadcnAvatar className="w-full h-full">
                <AvatarImage src={src || undefined} alt={name} />
                <AvatarFallback className={`${bgColorClass} text-white`}>{initials}</AvatarFallback>
            </ShadcnAvatar>
            {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-online)] rounded-full ring-2 ring-white dark:ring-[var(--color-bg-base)]" />
            )}
        </div>
    );
}
