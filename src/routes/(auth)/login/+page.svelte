
<script lang="ts">
    import { goto } from '$app/navigation';

    let email = $state('');
    let password = $state('');
    let rememberMe = $state(false);
    let isLoading = $state(false);

    function handleSubmit() {
        isLoading = true;
        console.log('Login attempt:', { email, password, rememberMe });
        setTimeout(() => {
            isLoading = false;
            goto('/dashboard');
        }, 1500);
    }
</script>

<div class="bg-zinc-800 p-6 sm:p-8 rounded-lg border border-zinc-700 shadow-xl">
    <h1 class="text-2xl font-semibold text-gray-100 text-center mb-1">Welcome Back!</h1>
    <p class="text-sm text-zinc-400 text-center mb-6">Sign in to continue to AuraPlan.</p>

    <form on:submit|preventDefault={handleSubmit} class="space-y-5">
        <div>
            <label for="email" class="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
            <input type="email" id="email" name="email" bind:value={email} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="you@example.com" />
        </div>

        <div>
            <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-sm font-medium text-zinc-300">Password</label>
                <a href="/forgot-password" class="text-xs text-green-400 hover:text-green-300 transition-colors">Forgot password?</a>
            </div>
            <input type="password" id="password" name="password" bind:value={password} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="••••••••" />
        </div>

        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" bind:checked={rememberMe}
                       class="h-4 w-4 text-green-500 bg-zinc-700 border-zinc-600 rounded focus:ring-green-500 focus:ring-offset-zinc-800" />
                <label for="remember-me" class="ml-2 block text-sm text-zinc-300">Remember me</label>
            </div>
        </div>

        <div>
            <button type="submit" disabled={isLoading}
                    class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-sm font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 transition-colors duration-150">
                {#if isLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                {:else}
                    Sign In
                {/if}
            </button>
        </div>
    </form>

    <p class="mt-8 text-center text-sm text-zinc-400">
        Don't have an account?
        <a href="/register" class="font-medium text-green-400 hover:text-green-300 transition-colors">
            Register here
        </a>
    </p>
</div>