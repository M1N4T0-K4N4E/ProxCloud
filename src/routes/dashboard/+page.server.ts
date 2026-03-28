import { fail, redirect } from '@sveltejs/kit';
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

export const actions = {
	delete: async ({ locals, request, fetch }) => {
		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const data = await request.formData();
		const vmid = data.get('vmid');

		if (!vmid) {
			return fail(400, { error: true, message: 'Missing VM ID' });
		}

		const backendUrl = env.BACKEND_URL || 'http://localhost:3000';

		try {
			const res = await fetch(`${backendUrl}/api/vm/${vmid}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${locals.session.access_token}`
				}
			});

			const result = await res.json();

			if (!res.ok) {
				return fail(res.status, {
					error: true,
					message: result.details || result.error || 'Failed to delete VM'
				});
			}

			return { success: true, message: result.message || `VM ${vmid} delete signal sent` };
		} catch (err: any) {
			return fail(500, { error: true, message: err.message || 'Internal Server Error' });
		}
	}
};
