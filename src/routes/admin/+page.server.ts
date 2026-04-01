import { error, fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async ({ locals, fetch, depends }) => {
	depends('app:admin-dashboard');

	if (!locals.session) {
		throw redirect(303, '/login');
	}

	// Canonical role source is public.user.role (same source used by backend authorization).
	const { data: profile } = await locals.supabase
		.from('user')
		.select('role')
		.eq('id', locals.user?.id)
		.maybeSingle();

	const dbRole = typeof profile?.role === 'string' ? profile.role.trim().toLowerCase() : null;
	if (dbRole && dbRole !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	const backendUrl = env.BACKEND_URL || 'http://localhost:3000';
	const token = locals.session.access_token;

	const res = await fetch(`${backendUrl}/api/resource/admin-dashboard`, {
		cache: 'no-store',
		headers: {
			'Cache-Control': 'no-cache',
			Authorization: `Bearer ${token}`
		}
	});

	const payload = await res.json();

	if (res.status === 403) {
		throw redirect(303, '/dashboard');
	}

	if (!res.ok || !payload?.success) {
		throw error(res.status || 500, payload?.details || payload?.error || 'Failed to load admin dashboard');
	}

	return {
		admin: payload.admin,
		metrics: payload.metrics,
		users: payload.users || [],
		vms: payload.vms || []
	};
};

export const actions = {
	delete: async ({ locals, request, fetch }) => {
		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const form = await request.formData();
		const vmid = form.get('vmid');
		const proxmoxVmid = form.get('proxmoxVmid');

		if (!vmid) {
			return fail(400, { error: true, message: 'Missing VM ID' });
		}

		const backendUrl = env.BACKEND_URL || 'http://localhost:3000';

		try {
			let res = await fetch(`${backendUrl}/api/vm/${vmid}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${locals.session.access_token}`
				}
			});

			let result = await res.json();

			// Compatibility fallback for older rows where UI ref and backend lookup key differ.
			if (
				res.status === 403 &&
				proxmoxVmid &&
				String(proxmoxVmid) !== String(vmid)
			) {
				res = await fetch(`${backendUrl}/api/vm/${proxmoxVmid}`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${locals.session.access_token}`
					}
				});
				result = await res.json();
			}

			if (!res.ok) {
				return fail(res.status, {
					error: true,
					message: result.details || result.error || 'Failed to delete VM'
				});
			}

			return {
				success: true,
				message: result.message || `Delete request completed for VM ${vmid}`
			};
		} catch (err: any) {
			return fail(500, { error: true, message: err.message || 'Internal Server Error' });
		}
	}
};
