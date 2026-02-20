import React from 'react';

import visaLogo from '../assets/issuers/visa.svg';
import mastercardLogo from '../assets/issuers/mastercard.svg';
import amexLogo from '../assets/issuers/amex.svg';
import discoverLogo from '../assets/issuers/discover.svg';
import jcbLogo from '../assets/issuers/jcb.svg';
import unionpayLogo from '../assets/issuers/unionpay.svg';

interface CardIssuerLogoProps {
    issuer: string;
    className?: string;
    theme?: 'light' | 'dark';
}

const LOGO_MAP: Record<string, string> = {
    VISA: visaLogo,
    MASTERCARD: mastercardLogo,
    AMEX: amexLogo,
    DISCOVER: discoverLogo,
    JCB: jcbLogo,
    UNIONPAY: unionpayLogo,
};

const CardIssuerLogo: React.FC<CardIssuerLogoProps> = ({ issuer, className = "h-10 w-auto", theme }) => {
    const normalizedIssuer = issuer.toUpperCase();
    const src = LOGO_MAP[normalizedIssuer];

    if (src) {
        const isMultiColor = ['JCB', 'UNIONPAY'].includes(normalizedIssuer);

        if (isMultiColor) {
            return (
                <div className={`bg-white rounded-md px-1.5 py-0.5 shadow-sm flex items-center justify-center ${className}`.trim()}>
                    <img src={src} className="h-full w-auto max-h-full" alt={normalizedIssuer} />
                </div>
            );
        }

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
