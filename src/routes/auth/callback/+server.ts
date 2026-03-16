import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const supabase = createSupabaseServerClient(cookies);
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			throw redirect(303, '/create-vm');
		}

		console.error('Auth callback error:', error.message);
		throw redirect(303, `/login?error=${encodeURIComponent(error.message)}`);
	}

	// No code present — redirect to login
	throw redirect(303, '/login');
};
