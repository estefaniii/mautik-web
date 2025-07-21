import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	// Remover configuraciones experimentales que pueden causar problemas
	// experimental: {
	//   webpackBuildWorker: true,
	//   parallelServerBuildTraces: true,
	//   parallelServerCompiles: true,
	// },
};

export default withSentryConfig(nextConfig, {
	org: 'mautik',
	project: 'javascript-nextjs',
	silent: !process.env.CI,
	widenClientFileUpload: true,
	tunnelRoute: '/monitoring',
	disableLogger: true,
	automaticVercelMonitors: true,
});
