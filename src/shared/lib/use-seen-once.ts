import { useEffect, useRef, useState } from 'react';

const LOOKAHEAD = '200px';

export function useSeenOnce<T extends Element>() {
    const ref = useRef<T>(null);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node || seen) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setSeen(true);
                }
            },
            { rootMargin: LOOKAHEAD },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [seen]);

    return { ref, seen };
}
