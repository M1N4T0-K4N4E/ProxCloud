import { fail, redirect } from '@sveltejs/kit';
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
			status: data.status,
			diskSize: data.diskSize || 'N/A',
			imageName: data.imageName || 'N/A'
		};
	} catch (err) {
		console.error('VM detail fetch error:', err);
		return { error: 'Internal Server Error', vmid };
	}
};

export const actions = {
	start: async ({ locals, params, fetch }) => {
		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const backendUrl = env.BACKEND_URL || 'http://localhost:3000';

		try {
			const res = await fetch(`${backendUrl}/api/vm/${params.vmid}/start`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${locals.session.access_token}`
				}
			});

			const result = await res.json();

			if (!res.ok) {
				return fail(res.status, {
					error: true,
					message: result.details || result.error || 'Failed to start VM'
				});
			}

			return { success: true, message: result.message || 'Start signal sent' };
		} catch (err: any) {
			return fail(500, { error: true, message: err.message || 'Internal Server Error' });
		}
	},
	stop: async ({ locals, params, fetch }) => {
		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const backendUrl = env.BACKEND_URL || 'http://localhost:3000';

		try {
			const res = await fetch(`${backendUrl}/api/vm/${params.vmid}/stop`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${locals.session.access_token}`
				}
			});

			const result = await res.json();

			if (!res.ok) {
				return fail(res.status, {
					error: true,
					message: result.details || result.error || 'Failed to stop VM'
				});
			}

			return { success: true, message: result.message || 'Stop signal sent' };
		} catch (err: any) {
			return fail(500, { error: true, message: err.message || 'Internal Server Error' });
		}
	},
	delete: async ({ locals, params, fetch }) => {
		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const backendUrl = env.BACKEND_URL || 'http://localhost:3000';

		try {
			const res = await fetch(`${backendUrl}/api/vm/${params.vmid}`, {
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

			throw redirect(303, '/dashboard');
		} catch (err: any) {
			if (err?.status === 303) throw err;
			return fail(500, { error: true, message: err.message || 'Internal Server Error' });
		}
	}
};
