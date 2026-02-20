import React from 'react';
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo, JcbLogo, UnionpayLogo } from './IssuerLogos';

interface CardIssuerLogoProps {
    issuer: string;
    className?: string;
    theme?: 'light' | 'dark';
}

const CardIssuerLogo: React.FC<CardIssuerLogoProps> = ({ issuer, className = "h-10 sm:h-12 w-auto object-contain", theme }) => {
    const normalizedIssuer = issuer.toUpperCase();

    // Determine the color class based on theme using standard Tailwind text classes.
    // This flawlessly handles monochrome SVGs (Visa, Amex, Discover) since they are parsed with 'currentColor'.
    // Multi-color SVGs (Mastercard, JCB, UnionPay) will ignore this.
    // Note: 'light' theme on a card means it has a dark background requiring white text/logos.
    const colorClass = theme === 'light' ? 'text-white' : (theme === 'dark' ? 'text-slate-900' : '');

    const combinedClassName = `${className} ${colorClass}`.trim();

    switch (normalizedIssuer) {
        case 'VISA': return <VisaLogo className={combinedClassName} />;
        case 'MASTERCARD': return <MastercardLogo className={combinedClassName} />;
        case 'AMEX': return <AmexLogo className={combinedClassName} />;
        case 'DISCOVER': return <DiscoverLogo className={combinedClassName} />;
        case 'JCB': return <JcbLogo className={combinedClassName} />;
        case 'UNIONPAY': return <UnionpayLogo className={combinedClassName} />;
        default:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={combinedClassName}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
            );
    }
};

export default CardIssuerLogo;
