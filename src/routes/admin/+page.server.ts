import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async ({ locals, fetch }) => {
	if (!locals.session) {
		throw redirect(303, '/login');
	}

	const localRole =
		(locals.user as any)?.role ??
		(locals.user as any)?.app_metadata?.role ??
		(locals.user as any)?.user_metadata?.role;

	if (localRole && localRole !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	const backendUrl = env.BACKEND_URL || 'http://localhost:3000';
	const token = locals.session.access_token;

	const res = await fetch(`${backendUrl}/api/resource/admin-dashboard`, {
		headers: {
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
		users: payload.users || []
	};
};
