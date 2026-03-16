import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect based on session state
	if (locals.session) {
		throw redirect(303, '/create-vm');
	}
	throw redirect(303, '/login');
};
