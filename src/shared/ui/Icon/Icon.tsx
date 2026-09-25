import type { ReactNode } from 'react';

const ICON_PATHS = {
    inbox: (
        <>
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    bell: (
        <>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a2 2 0 0 0 3.4 0" />
        </>
    ),
    settings: (
        <>
            <path d="M20 7h-9M14 17H4" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
        </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    send: (
        <>
            <path d="m22 2-7 20-4-9-9-4z" />
            <path d="M22 2 11 13" />
        </>
    ),
    clip: <path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l8.6-8.5a4 4 0 0 1 5.6 5.6l-8.5 8.6a2 2 0 0 1-2.9-2.9l8.5-8.4" />,
    check: <path d="M20 6 9 17l-5-5" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    spark: <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9zM19 3v4M21 5h-4" />,
    filter: <path d="M3 6h18M7 12h10M10 18h4" />,
    refresh: (
        <>
            <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" />
            <path d="M21 3v5h-5" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </>
    ),
    download: <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />,
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    alert: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
        </>
    ),
    file: (
        <>
            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <path d="M14 3v6h6" />
        </>
    ),
    star: <path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.2-.9z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICON_PATHS;

type IconProps = { name: IconName; size?: number; className?: string };

export function Icon({ name, size = 20, className }: IconProps) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {ICON_PATHS[name]}
        </svg>
    );
}
