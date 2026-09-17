import { MetadataRoute } from 'next';
import { sitioUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: [
				'/admin/',
				'/api/',
				'/_next/',
				'/private/',
				'/checkout/',
				'/profile/',
				'/orders/',
				'/cart/',
			],
		},
		sitemap: `${sitioUrl()}/sitemap.xml`,
		host: sitioUrl(),
	};
}
