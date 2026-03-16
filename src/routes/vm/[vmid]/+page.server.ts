import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async ({ locals, params }) => {
	if (!locals.session) {
		throw redirect(303, '/login');
	}

	const { vmid } = params;
	const backendUrl = env.BACKEND_URL || 'http://localhost:3000';
	const token = locals.session.access_token;

	try {
		const res = await fetch(`${backendUrl}/api/vm/${vmid}/config`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const data = await res.json();

		if (!data.success) {
			return { error: data.error || 'Failed to fetch VM details', vmid };
		}

		return {
			vmid,
			config: data.config,
			status: data.status
		};
	} catch (err) {
		console.error('VM detail fetch error:', err);
		return { error: 'Internal Server Error', vmid };
	}
};
