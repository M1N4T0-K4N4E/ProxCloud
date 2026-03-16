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
		const res = await fetch(`${backendUrl}/api/vm/${vmid}/vnc`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const data = await res.json();

		return {
			vmid,
			vncProxy: data.success ? data.vncProxy : null,
			error: data.success ? null : data.error || 'Failed to generate VNC ticket'
		};
	} catch (err) {
		console.error('VNC fetch error:', err);
		return { error: 'Internal Server Error', vmid };
	}
};
