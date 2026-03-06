"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { checkSessionThunk } from "@/store/slices/authThunks";

export function SessionInit({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkSessionThunk());
    }, [dispatch]);

    return <>{children}</>;
}
