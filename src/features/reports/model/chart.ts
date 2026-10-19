export const CHART_HEIGHT = 168;
const PAD = { top: 10, right: 12, bottom: 24, left: 36 } as const;

export function niceMax(value: number): number {
    if (value <= 4) {
        return 4;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const steps = [1, 2, 2.5, 5, 10].map((step) => step * magnitude);

    return steps.find((step) => step >= value) ?? 10 * magnitude;
}

export function ticks(max: number): number[] {
    return [0, max / 2, max];
}

export function labelIndexes(count: number, slots = 6): number[] {
    if (count <= slots) {
        return Array.from({ length: count }, (_, index) => index);
    }

    const step = (count - 1) / (slots - 1);

    return Array.from({ length: slots }, (_, index) => Math.round(index * step));
}

export function topRoundedBar(x: number, y: number, width: number, height: number): string {
    const radius = Math.min(4, width / 2, height);

    if (height <= 0) {
        return '';
    }

    return [
        `M${x},${y + height}`,
        `V${y + radius}`,
        `Q${x},${y} ${x + radius},${y}`,
        `H${x + width - radius}`,
        `Q${x + width},${y} ${x + width},${y + radius}`,
        `V${y + height}`,
        'Z',
    ].join(' ');
}

export type Point = readonly [number, number];

export function linePaths(points: readonly Point[], baseline: number): { line: string; area: string } {
    const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ');
    const first = points.at(0);
    const last = points.at(-1);

    if (!first || !last) {
        return { line: '', area: '' };
    }

    return { line, area: `${line} L${last[0]},${baseline} L${first[0]},${baseline} Z` };
}

export type Plot = { width: number; height: number; x0: number; y0: number; scaleY: (value: number) => number };

export function plotArea(width: number, max: number): Plot {
    const height = CHART_HEIGHT - PAD.top - PAD.bottom;

    return {
        width: Math.max(0, width - PAD.left - PAD.right),
        height,
        x0: PAD.left,
        y0: PAD.top + height,
        scaleY: (value: number) => PAD.top + height - (value / max) * height,
    };
}
