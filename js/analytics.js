// Vercel Web Analytics initialization
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject({
    mode: 'auto', // Automatically detect production/development
    debug: false
});
