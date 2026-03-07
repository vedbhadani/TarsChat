"use client";

import React from "react";

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
    const iconSizes = {
        sm: "h-6 w-6",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        xl: "h-20 w-20",
    };

    const textSizes = {
        sm: "text-base",
        md: "text-xl",
        lg: "text-3xl",
        xl: "text-4xl",
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#B5784A] shadow-md shadow-[#B5784A]/20 ring-1 ring-[#B5784A]/20 ${iconSizes[size]}`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3/5 w-3/5"
                >
                    <path
                        d="M21 11.5C21 15.6421 17.6421 19 13.5 19C12.3392 19 11.2483 18.7369 10.2778 18.2678L6 20L7.5 16.5C6.55931 15.148 6 13.437 6 11.5C6 7.35786 9.35786 4 13.5 4C17.6421 4 21 7.35786 21 11.5Z"
                        fill="#B5784A"
                    />
                    <circle cx="10" cy="11.5" r="1" fill="white" />
                    <circle cx="13.5" cy="11.5" r="1" fill="white" />
                    <circle cx="17" cy="11.5" r="1" fill="white" />
                </svg>
            </div>
            {showText && (
                <span className={`font-bold tracking-tight text-[#1A1208] ${textSizes[size]}`}>
                    TarsChat
                </span>
            )}
        </div>
    );
}
