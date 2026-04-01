'use client';

import { useEffect } from 'react';

/**
 * A developer-only hook to audit common accessibility issues at runtime.
 * This helps maintain a high standard for the SmartCampus OS UI.
 */
export const useAccessibilityAudit = () => {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const audit = () => {
            console.group('🛡️ SmartCampus OS: Accessibility Audit');
            
            // 1. Check for missing alt text on images
            const images = document.querySelectorAll('img:not([alt])');
            if (images.length > 0) {
                console.warn(`[A11y] Found ${images.length} images missing alt text:`, images);
            }

            // 2. Check for empty buttons
            const buttons = document.querySelectorAll('button');
            const emptyButtons = Array.from(buttons).filter(b => !b.innerText.trim() && !b.getAttribute('aria-label'));
            if (emptyButtons.length > 0) {
                console.warn(`[A11y] Found ${emptyButtons.length} buttons missing labels/text:`, emptyButtons);
            }

            // 3. Check for focusable elements without visible focus (basic check)
            const focusable = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            // This is a placeholder for more advanced computed style checks
            
            console.log('[A11y] Audit complete. Target: WCAG 2.2 AA.');
            console.groupEnd();
        };

        // Run once on mount and allow manual triggering
        audit();
        (window as any).runA11yAudit = audit;

    }, []);
};
