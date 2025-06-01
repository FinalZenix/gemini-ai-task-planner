<script lang="ts">
    import { register, signInWithGoogle, authError, authLoading } from '$lib/stores/authStore';
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    let fullName = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let termsAccepted = $state(false);
    let showPassword = $state(false);
    let showConfirmPassword = $state(false);
    let passwordError = $state('');

    async function handleSubmit() {
        passwordError = '';
        if (password !== confirmPassword) {
            passwordError = "Passwords do not match!";
            return;
        }
        if (!termsAccepted) {
            passwordError = "Please accept the terms and conditions.";
            return;
        }
        await register(email, password);
    }

    async function handleGoogleLogin() {
        await signInWithGoogle();
    }
</script>

<div class="bg-zinc-800 p-6 sm:p-8 border border-zinc-700 shadow-xl" in:fade={{ duration: 300 }}>
    <h1 class="text-2xl font-semibold text-gray-100 text-center mb-1">Create Account</h1>
    <p class="text-sm text-zinc-400 text-center mb-6">Join AuraPlan and boost your productivity.</p>

    {#if $authError}
        <div class="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 text-sm mb-5"
             in:fly={{ y: 10, duration: 300 }}>
            {$authError}
        </div>
    {/if}

    {#if passwordError}
        <div class="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 text-sm mb-5"
             in:fly={{ y: 10, duration: 300 }}>
            {passwordError}
        </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-5">
        <div>
            <label for="fullName" class="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
            <input type="text" id="fullName" name="fullName" bind:value={fullName} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="John Doe" />
        </div>

        <div>
            <label for="email" class="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
            <input type="email" id="email" name="email" bind:value={email} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="you@example.com" />
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
            <div class="relative">
                <input type={showPassword ? "text" : "password"} id="password" name="password" bind:value={password} required minlength="8"
                       class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                       placeholder="Minimum 8 characters" />
                <button
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                    on:click={() => showPassword = !showPassword}
                >
                    {#if showPassword}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                    {/if}
                </button>
            </div>
        </div>

        <div>
            <label for="confirmPassword" class="block text-sm font-medium text-zinc-300 mb-1.5">Confirm Password</label>
            <div class="relative">
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" bind:value={confirmPassword} required
                       class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                       placeholder="Re-enter your password" />
                <button
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                    on:click={() => showConfirmPassword = !showConfirmPassword}
                >
                    {#if showConfirmPassword}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                    {/if}
                </button>
            </div>
        </div>

        <div class="pt-1">
            <div class="flex items-start">
                <input id="terms" name="terms" type="checkbox" bind:checked={termsAccepted}
                       class="h-4 w-4 mt-0.5 text-green-500 bg-zinc-700 border-zinc-600 focus:ring-green-500 focus:ring-offset-zinc-800" />
                <label for="terms" class="ml-2 block text-xs text-zinc-400">
                    I agree to the <a href="/terms" class="text-green-400 hover:text-green-300">Terms & Conditions</a> and <a href="/privacy" class="text-green-400 hover:text-green-300">Privacy Policy</a>.
                </label>
            </div>
        </div>

        <div>
            <button type="submit" disabled={$authLoading || !termsAccepted}
                    class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-sm font-semibold py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 transition-colors duration-150">
                {#if $authLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                {:else}
                    Create Account
                {/if}
            </button>
        </div>
    </form>

    <div class="relative flex items-center justify-center my-6">
        <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-zinc-700"></div>
        </div>
        <div class="relative px-4 bg-zinc-800">
            <span class="text-sm text-zinc-500">Or continue with</span>
        </div>
    </div>

    <button
        on:click={handleGoogleLogin}
        type="button"
        class="w-full py-2.5 px-4 bg-zinc-700/70 hover:bg-zinc-700 text-white font-medium border border-zinc-600 transition-colors duration-200 flex justify-center items-center space-x-2 mb-6"
        disabled={$authLoading}
    >
        <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Sign up with Google</span>
    </button>

    <p class="text-center text-sm text-zinc-400">
        Already have an account?
        <a href="/login" class="font-medium text-green-400 hover:text-green-300 transition-colors">
            Sign in here
        </a>
    </p>
</div>
