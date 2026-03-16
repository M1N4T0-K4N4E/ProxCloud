import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(303, '/login');
	}

	const backendUrl = env.BACKEND_URL || 'http://localhost:3000';
	const token = locals.session.access_token;

	try {
		// Fetch dashboard metrics
		const resourceRes = await fetch(`${backendUrl}/api/resource/dashboard`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		// Fetch VM list
		const vmsRes = await fetch(`${backendUrl}/api/vm/list`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const metricsData = await resourceRes.json();
		const vmsData = await vmsRes.json();

		return {
			metrics: metricsData.success ? metricsData.metrics : null,
			vms: vmsData.success ? vmsData.vms : []
		};
	} catch (err) {
		console.error('Dashboard fetch error:', err);
		return { metrics: null, vms: [] };
	}
};
