import { createSupabaseServerClient } from '$lib/supabase';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Create a Supabase client for this request
	const supabase = createSupabaseServerClient(event.cookies);
	event.locals.supabase = supabase;

	// Validate the session by calling getUser (verifies JWT server-side)
	const {
		data: { user }
	} = await supabase.auth.getUser();

	event.locals.user = user;
	event.locals.session = user ? { user } : null;

	// Protect /create-vm routes — redirect to /login if not authenticated
	if (event.url.pathname.startsWith('/create-vm') && !user) {
		throw redirect(303, '/login');
	}

	// If authenticated user visits /login, redirect to /create-vm
	if (event.url.pathname === '/login' && user) {
		throw redirect(303, '/create-vm');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
