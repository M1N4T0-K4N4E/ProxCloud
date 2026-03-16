import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If already authenticated, redirect to create-vm
	if (locals.session) {
		throw redirect(303, '/create-vm');
	}
	return {};
};
