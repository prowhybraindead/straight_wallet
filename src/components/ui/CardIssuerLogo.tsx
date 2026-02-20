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

const CardIssuerLogo: React.FC<CardIssuerLogoProps> = ({ issuer, className = "h-12 w-auto max-w-[100px]" }) => {
    const normalizedIssuer = issuer.toUpperCase();
    const src = LOGO_MAP[normalizedIssuer];

    if (src) {
        // Raw Visual Test: No filters, no white badges, just the raw scalable SVG
        return <img src={src} className={className.trim()} alt={normalizedIssuer} />;
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
