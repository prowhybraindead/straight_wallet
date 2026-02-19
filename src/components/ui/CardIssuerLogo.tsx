import React from 'react';

interface CardIssuerLogoProps {
    issuer: string;
    className?: string;
    variant?: 'color' | 'white' | 'monochrome';
}

const CardIssuerLogo: React.FC<CardIssuerLogoProps> = ({ issuer, className = "w-10 h-auto", variant = 'color' }) => {
    const normalizedIssuer = issuer.toUpperCase();
    const isWhite = variant === 'white';

    switch (normalizedIssuer) {
        case 'VISA':
            return (
                <svg viewBox="0 0 100 32" className={className} xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M31.7 0.6L21.3 25.4L14.3 25.4L8.7 5.5C8.4 4.3 8.1 3.9 7.1 3.4C5.4 2.5 2.6 1.7 0 1.1L0.2 0.6H11.7C13.2 0.6 14.5 1.6 14.8 3.3L17.6 18.2L24.7 0.6H31.7ZM40.9 17.3C40.9 10.7 31.9 10.3 31.9 7.4C31.9 6.5 32.8 5.6 34.6 5.3C35.5 5.2 38.0 5.1 40.9 6.5L41.7 2.3C40.6 1.8 39.2 1.4 37.4 1.4C32.8 1.4 29.6 3.8 29.5 7.1C29.5 10.2 32.3 11.9 34.5 13C36.7 14.1 37.5 14.8 37.5 15.8C37.5 17.3 35.8 18 34.2 18C32.1 18 30.9 17.5 29.3 16.8L28.4 21.2C30.0 22 32.5 22.4 34.8 22.4C39.7 22.4 42.9 20 42.9 16.7L40.9 17.3ZM53.6 0.6L46.3 0.6C44.8 0.6 43.6 1.4 43.0 2.9L36.8 17.6L36.9 17.6C36.9 17.6 42.1 2.9 42.1 2.9L42.9 11.2L42.1 11.2L41.7 13.9L45.4 13.9L45.8 17.2L53.7 17.2L53.6 0.6ZM66.4 0.6L60.5 16.2L57.2 25.4L64.5 25.4L66.4 0.6Z"
                        fill={isWhite ? "#ffffff" : "#1A1F71"}
                    />
                </svg>
            );

        case 'MASTERCARD':
            return (
                <svg viewBox="0 0 100 64" className={className} xmlns="http://www.w3.org/2000/svg">
                    <circle cx="34" cy="32" r="32" fill={isWhite ? "#ffffff" : "#EB001B"} fillOpacity={isWhite ? "0.8" : "1"} />
                    <circle cx="66" cy="32" r="32" fill={isWhite ? "#cccccc" : "#F79E1B"} fillOpacity={isWhite ? "0.8" : "1"} />
                    {/* The intersection logic is complex in pure SVG without filters, simpler to use transparency overlap which works well for Mastercard */}
                    <path d="M50 11.5C46.8 11.5 43.8 12.3 41.1 13.8C46.4 18.2 50 24.7 50 32C50 39.3 46.4 45.8 41.1 50.2C43.8 51.7 46.8 52.5 50 52.5C53.2 52.5 56.2 51.7 58.9 50.2C53.6 45.8 50 39.3 50 32C50 24.7 53.6 18.2 58.9 13.8C56.2 12.3 53.2 11.5 50 11.5Z" fill={isWhite ? "#999999" : "#FF5F00"} />
                </svg>
            );

        case 'AMEX':
            return (
                <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
                    {!isWhite && <path fill="#2E77BC" d="M5,25h90c2.8,0,5,2.2,5,5v40c0,2.8-2.2,5-5,5H5c-2.8,0-5-2.2-5-5V30C0,27.2,2.2,25,5,25z" />}
                    <path fill={isWhite ? "currentColor" : "#ffffff"} d="M28.4,59.3l-2.6-6.4h-6.8l2.9,6.4h-5.2l-7.2-16.7h5.1l3.5,9.6l3.3-9.6h5L20,66.8h5.3l1.8-4.2h8l1.7,4.2H42L35,49.9
	L41.3,37h-5.4l-3.9,8.5L28.4,59.3z M28.7,49.3h5.1l-2.6,6.1L28.7,49.3z M67.2,37h-7l-3.9,9.4l0,0l-3.9-9.4h-7v16.7h4.8v-7.8
	l4,9.5h4.3l4.1-9.5v9.5h4.8V37z M85.5,58.8H78v-4.6h6.8v-4H78v-3.7h7.2v-4.1h-12v20.4h12.5V58.8z"/>
                    {isWhite && <rect x="0" y="25" width="100" height="50" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="4" />}
                </svg>
            );

        case 'DISCOVER':
            return (
                <svg viewBox="0 0 100 20" className={className} xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="15" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill={isWhite ? "currentColor" : "#111"}>DISCOVER</text>
                    <circle cx="85" cy="9" r="6" fill={isWhite ? "currentColor" : "#F9A021"} />
                </svg>
            );

        case 'UNIONPAY':
            return (
                <svg viewBox="0 0 100 64" className={className} xmlns="http://www.w3.org/2000/svg">
                    <path fill={isWhite ? "#ccc" : "#D22131"} d="M12,12 h20 l-6,40 h-20 z" transform="skewX(-20)" />
                    <path fill={isWhite ? "#eee" : "#006241"} d="M34,12 h20 l-6,40 h-20 z" transform="skewX(-20)" />
                    <path fill={isWhite ? "#999" : "#EA9519"} d="M56,12 h28 l-2.5,17 a15,15 0 0,0 -8,22 l-16.5,1 z" transform="skewX(-20)" />
                </svg>
            );

        case 'JCB':
            return (
                <svg viewBox="0 0 100 70" className={className} xmlns="http://www.w3.org/2000/svg">
                    <path fill={isWhite ? "currentColor" : "#0f4a88"} d="M0,0h30v70h-30z" />
                    <path fill={isWhite ? "currentColor" : "#ca1a34"} d="M35,0h30v70h-30z" />
                    <path fill={isWhite ? "currentColor" : "#2f9c46"} d="M70,0h30v70h-30z" />
                    <path fill="#fff" d="M5,20h5c2,0 3,1 3,3v5c0,2 -1,3 -3,3h-5v5h8v5h-13v-30h13v5h-8v4z" />
                    <path fill="#fff" d="M40,20h10v5h-5v20h-5v-20h-5v-5z" />
                    <path fill="#fff" d="M75,20h10c2,0 3,1 3,3v3h-5v-1h-3v5h3c2,0 3,1 3,3v2c0,2 -1,3 -3,3h-10v-30z M80,42h3v-5h-3v5z" />
                </svg>
            );

        case 'NAPAS':
            return (
                <svg viewBox="0 0 100 40" className={className} xmlns="http://www.w3.org/2000/svg">
                    <text x="5" y="30" fontFamily="Arial" fontWeight="900" fontStyle="italic" fontSize="30" fill={isWhite ? "currentColor" : "#1A4F98"}>napas</text>
                </svg>
            );

        default:
            // Generic Credit Card Icon
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
            );
    }
};

export default CardIssuerLogo;
