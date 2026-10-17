// Build script to bundle Vercel Analytics for browser use
import { build } from 'esbuild';

async function buildAnalytics() {
    try {
        await build({
            entryPoints: ['js/analytics.js'],
            bundle: true,
            outfile: 'dist/analytics.js',
            format: 'iife',
            platform: 'browser',
            target: 'es2015',
            minify: true,
        });
        console.log('✓ Analytics bundle created at dist/analytics.js');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildAnalytics();
