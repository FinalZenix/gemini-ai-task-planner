<script lang="ts">
    import { goto } from '$app/navigation';

    let fullName = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let termsAccepted = $state(false);
    let isLoading = $state(false);

    function handleSubmit() {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!termsAccepted) {
            alert("Please accept the terms and conditions.");
            return;
        }
        isLoading = true;
        console.log('Registration attempt:', { fullName, email, password, termsAccepted });
        setTimeout(() => {
            isLoading = false;
            goto('/dashboard');
        }, 1500);
    }
</script>

<div class="bg-zinc-800 p-6 sm:p-8 rounded-lg border border-zinc-700 shadow-xl">
    <h1 class="text-2xl font-semibold text-gray-100 text-center mb-1">Create Account</h1>
    <p class="text-sm text-zinc-400 text-center mb-6">Join AuraPlan and boost your productivity.</p>

    <form on:submit|preventDefault={handleSubmit} class="space-y-5">
        <div>
            <label for="fullName" class="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
            <input type="text" id="fullName" name="fullName" bind:value={fullName} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="John Doe" />
        </div>

        <div>
            <label for="email" class="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
            <input type="email" id="email" name="email" bind:value={email} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="you@example.com" />
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
            <input type="password" id="password" name="password" bind:value={password} required minlength="8"
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="Minimum 8 characters" />
        </div>

        <div>
            <label for="confirmPassword" class="block text-sm font-medium text-zinc-300 mb-1.5">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" bind:value={confirmPassword} required
                   class="w-full bg-zinc-700/70 border border-zinc-600 text-gray-200 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-colors"
                   placeholder="Re-enter your password" />
        </div>

        <div class="pt-1">
            <div class="flex items-start">
                <input id="terms" name="terms" type="checkbox" bind:checked={termsAccepted}
                       class="h-4 w-4 mt-0.5 text-green-500 bg-zinc-700 border-zinc-600 rounded focus:ring-green-500 focus:ring-offset-zinc-800" />
                <label for="terms" class="ml-2 block text-xs text-zinc-400">
                    I agree to the <a href="/terms" class="text-green-400 hover:text-green-300">Terms & Conditions</a> and <a href="/privacy" class="text-green-400 hover:text-green-300">Privacy Policy</a>.
                </label>
            </div>
        </div>

        <div>
            <button type="submit" disabled={isLoading || !termsAccepted}
                    class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-sm font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 transition-colors duration-150">
                {#if isLoading}
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

    <p class="mt-8 text-center text-sm text-zinc-400">
        Already have an account?
        <a href="/login" class="font-medium text-green-400 hover:text-green-300 transition-colors">
            Sign in here
        </a>
    </p>
</div>
