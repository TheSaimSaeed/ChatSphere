"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { checkSessionThunk } from "@/store/slices/authThunks";
import { connectSocket } from "@/lib/socket/client";

export function SessionInit({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkSessionThunk()).then((action) => {
            // Once session is checked (and session.token cookie is set by the bridge),
            // trigger the socket connection.
            if (checkSessionThunk.fulfilled.match(action)) {
                connectSocket();
            }
        });
    }, [dispatch]);

    return <>{children}</>;
}
