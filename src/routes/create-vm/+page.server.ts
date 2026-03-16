import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const prerender = false;

export const actions = {
	create: async ({ request, locals }: any) => {
		const data = await request.formData();

		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		// Extract form data
		const vmid = data.get('vmid');
		const name = data.get('name');
		const memory = data.get('memory');
		const cores = data.get('cores');
		const storage = data.get('storage');
		const diskSize = data.get('diskSize');
		const iso = data.get('iso');

		// Basic Validation
		if (!vmid || !name || !memory || !cores) {
			return fail(400, { missing: true, message: 'Missing required fields' });
		}

		try {
			const backendUrl = env.BACKEND_URL || 'http://localhost:3000';
			const res = await fetch(`${backendUrl}/api/vm/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${locals.session.access_token}`
				},
				body: JSON.stringify({
					vmid: Number(vmid),
					name: String(name),
					memory: Number(memory),
					cores: Number(cores),
					storage: String(storage || 'local-lvm'),
					diskSize: Number(diskSize || 5),
					iso: String(iso)
				})
			});

			const result = await res.json();

			if (!res.ok) {
				console.error('Backend Error:', result);
				return fail(res.status, {
					error: true,
					message: result.details || result.error || 'Failed to create VM'
				});
			}

			return { success: true, taskId: result.taskId };
		} catch (err: any) {
			console.error('Server Error:', err);
			return fail(500, { error: true, message: err.message });
		}
	}
};
