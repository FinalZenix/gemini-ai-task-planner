<script lang="ts">
    import { onMount } from 'svelte';
    import { user, authLoading, login, signInWithGoogle, signOut } from '$lib/stores/authStore';
    import { auth } from '$lib/firebase';

    let testEmail = $state('test@example.com');
    let testPassword = $state('password123');
    let testResult = $state('');
    let loading = $state(false);

    onMount(() => {
        console.log('Firebase auth instance:', auth);
        console.log('Auth loading:', $authLoading);
        console.log('Current user:', $user);
    });

    async function testEmailLogin() {
        loading = true;
        testResult = '';
        try {
            await login(testEmail, testPassword);
            testResult = 'Email login successful!';
        } catch (error: any) {
            testResult = `Email login failed: ${error.message}`;
        } finally {
            loading = false;
        }
    }

    async function testGoogleLogin() {
        loading = true;
        testResult = '';
        try {
            await signInWithGoogle();
            testResult = 'Google login successful!';
        } catch (error: any) {
            testResult = `Google login failed: ${error.message}`;
        } finally {
            loading = false;
        }
    }

    async function testSignOut() {
        loading = true;
        testResult = '';
        try {
            await signOut();
            testResult = 'Sign out successful!';
        } catch (error: any) {
            testResult = `Sign out failed: ${error.message}`;
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-zinc-900 p-6">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-6">Firebase Authentication Test</h1>

        <!-- Firebase Status -->
        <div class="bg-zinc-800 p-6 mb-6">
            <h2 class="text-xl font-semibold text-white mb-4">Firebase Status</h2>
            <div class="space-y-2 text-sm">
                <p class="text-zinc-300">
                    <span class="text-zinc-400">Auth Loading:</span>
                    <span class={$authLoading ? 'text-yellow-400' : 'text-green-400'}>
                        {$authLoading ? 'Loading...' : 'Ready'}
                    </span>
                </p>
                <p class="text-zinc-300">
                    <span class="text-zinc-400">User Status:</span>
                    <span class={$user ? 'text-green-400' : 'text-red-400'}>
                        {$user ? 'Authenticated' : 'Not authenticated'}
                    </span>
                </p>
                {#if $user}
                    <div class="mt-4 p-4 bg-green-500/20 border border-green-500/50">
                        <p class="text-green-300 font-medium">User Details:</p>
                        <p class="text-sm text-green-200">Email: {$user.email}</p>
                        <p class="text-sm text-green-200">UID: {$user.uid}</p>
                        {#if $user.displayName}
                            <p class="text-sm text-green-200">Name: {$user.displayName}</p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Test Controls -->
        <div class="bg-zinc-800 p-6 mb-6">
            <h2 class="text-xl font-semibold text-white mb-4">Authentication Tests</h2>

            <!-- Email Login Test -->
            <div class="mb-6">
                <h3 class="text-lg font-medium text-white mb-3">Email Login Test</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        bind:value={testEmail}
                        type="email"
                        placeholder="Test email"
                        class="bg-zinc-700 border border-zinc-600 text-white px-3 py-2"
                    />
                    <input
                        bind:value={testPassword}
                        type="password"
                        placeholder="Test password"
                        class="bg-zinc-700 border border-zinc-600 text-white px-3 py-2"
                    />
                </div>
                <button
                    on:click={testEmailLogin}
                    disabled={loading}
                    class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 transition-colors"
                >
                    {loading ? 'Testing...' : 'Test Email Login'}
                </button>
            </div>

            <!-- Google Login Test -->
            <div class="mb-6">
                <h3 class="text-lg font-medium text-white mb-3">Google Login Test</h3>
                <button
                    on:click={testGoogleLogin}
                    disabled={loading}
                    class="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 transition-colors"
                >
                    {loading ? 'Testing...' : 'Test Google Login'}
                </button>
            </div>

            <!-- Sign Out Test -->
            {#if $user}
                <div class="mb-6">
                    <h3 class="text-lg font-medium text-white mb-3">Sign Out Test</h3>
                    <button
                        on:click={testSignOut}
                        disabled={loading}
                        class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-4 py-2 transition-colors"
                    >
                        {loading ? 'Testing...' : 'Test Sign Out'}
                    </button>
                </div>
            {/if}
        </div>

        <!-- Test Results -->
        {#if testResult}
            <div class="bg-zinc-800 p-6">
                <h2 class="text-xl font-semibold text-white mb-4">Test Result</h2>
                <div class="p-4 {testResult.includes('successful') ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}">
                    <p class={testResult.includes('successful') ? 'text-green-300' : 'text-red-300'}>
                        {testResult}
                    </p>
                </div>
            </div>
        {/if}

        <!-- Navigation -->
        <div class="mt-8 flex gap-4">
            <a href="/login" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 transition-colors">
                Go to Login Page
            </a>
            <a href="/register" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 transition-colors">
                Go to Register Page
            </a>
            <a href="/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors">
                Go to Dashboard
            </a>
        </div>
    </div>
</div>
