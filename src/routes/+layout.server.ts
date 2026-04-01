import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ locals }) => {
	let role: string | null = null;

	if (locals.user) {
		const { data } = await locals.supabase
			.from('user')
			.select('role')
			.eq('id', locals.user.id)
			.maybeSingle();

		role = typeof data?.role === 'string' ? data.role.trim().toLowerCase() : null;
	}

	return {
		session: locals.session,
		user: locals.user
			? {
					...locals.user,
					role: role ?? locals.user?.app_metadata?.role ?? locals.user?.user_metadata?.role ?? 'user'
			  }
			: null
	};
};
