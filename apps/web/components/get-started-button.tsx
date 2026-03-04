'use client';

import React, { useState } from "react";
import { GetStartedModal } from "@/components/get-started-modal";

interface GetStartedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function GetStartedButton({ children, className, onClick, ...props }: GetStartedButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    onClick?.(e);
                    setShowModal(true);
                }}
                className={className}
                {...props}
            >
                {children}
            </button>
            <GetStartedModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
