import React from 'react';

interface CardIssuerLogoProps {
    issuer: string;
    className?: string;
    theme?: 'light' | 'dark';
}

const KNOWN_ISSUERS = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'JCB', 'UNIONPAY', 'NAPAS'];

const CardIssuerLogo: React.FC<CardIssuerLogoProps> = ({ issuer, className = "w-10 h-auto", theme }) => {
    const normalizedIssuer = issuer.toUpperCase();

    if (KNOWN_ISSUERS.includes(normalizedIssuer)) {
        const src = `/assets/issuers/${normalizedIssuer.toLowerCase()}.svg`;
        // Apply pure white filter if theme is 'light' (dark background)
        const filterClass = theme === 'light' ? 'brightness-0 invert' : '';
        return <img src={src} className={`${className} ${filterClass}`.trim()} alt={normalizedIssuer} />;
    }

    // Generic Credit Card Icon Fallback
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    );
};

export default CardIssuerLogo;
