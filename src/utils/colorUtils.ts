export function getContrastTheme(input: string): 'light' | 'dark' {
    if (!input) return 'light';

    // 1. Try to extract HEX
    const hexMatch = input.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
    if (hexMatch) {
        let hex = hexMatch[0].replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128 ? 'dark' : 'light';
    }

    // 2. Try to extract RGB/RGBA
    const rgbMatch = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128 ? 'dark' : 'light';
    }

    // 3. Fallback for Tailwind classes or unknown patterns
    // Most modern fintech cards use dark/vibrant gradients, so default to 'light' (meaning light text for a dark background).
    return 'light';
}
