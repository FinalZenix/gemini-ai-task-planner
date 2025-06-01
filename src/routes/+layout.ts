import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { user } from '$lib/stores/authStore';
import { get } from 'svelte/store';

export async function load({ url }) {
  // Check if the route is protected
  const protectedRoutes = ['/dashboard', '/calendar', '/notes', '/settings', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

  // If it's a protected route and user is not logged in, redirect to login
  if (browser && isProtectedRoute && !get(user)) {
    throw redirect(302, '/login');
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => url.pathname === route);

  if (browser && isAuthRoute && get(user)) {
    throw redirect(302, '/dashboard');
  }

  return {
    url: url.pathname
  };
}
