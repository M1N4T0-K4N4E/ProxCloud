import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const prerender = false;

export const load = async ({ locals, fetch }: any) => {
	if (!locals.session) {
		return {
			nodes: [],
			options: {}
		};
	}

	try {
		const backendUrl = env.BACKEND_URL || 'http://localhost:3000';
		const res = await fetch(`${backendUrl}/api/vm/create-options`, {
			headers: {
				Authorization: `Bearer ${locals.session.access_token}`
			}
		});

		if (!res.ok) {
			return {
				nodes: [],
				options: {}
			};
		}

		const payload = await res.json();
		return {
			nodes: payload?.nodes || [],
			options: payload?.options || {}
		};
	} catch {
		return {
			nodes: [],
			options: {}
		};
	}
};

export const actions = {
	create: async ({ request, locals }: any) => {
		const data = await request.formData();

		if (!locals.session) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		// Extract form data
	const node = data.get('node');
	const name = data.get('name');
	const memory = data.get('memory');
	const cores = data.get('cores');
	const storage = data.get('storage');
	const diskSize = data.get('diskSize');
	const sourceType = data.get('sourceType');
	const iso = data.get('iso');
	const templateVmid = data.get('templateVmid');

	// Basic Validation
	if (!node || !name) {
		}

		if (String(sourceType || 'iso') === 'iso' && !iso) {
			return fail(400, { missing: true, message: 'Please select an ISO image' });
		}

		if (String(sourceType || 'iso') === 'template' && !templateVmid) {
			return fail(400, { missing: true, message: 'Please select a template' });
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
					node: String(node),
					name: String(name),
					memory: Number(memory || 512),
					cores: Number(cores || 1),
					storage: String(storage || 'local-lvm'),
					diskSize: Number(diskSize || 5),
					sourceType: String(sourceType || 'iso'),
					iso: iso ? String(iso) : undefined,
					templateVmid: templateVmid ? Number(templateVmid) : undefined
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

			return { success: true, taskId: result.taskId, vmid: result.vmid };
		} catch (err: any) {
			console.error('Server Error:', err);
			return fail(500, { error: true, message: err.message });
		}
	}
};
