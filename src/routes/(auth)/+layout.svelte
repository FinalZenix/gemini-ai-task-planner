<script lang="ts">
    import '../../app.css';
    let { children } = $props();
</script>

<div class="min-h-screen w-full bg-zinc-900 text-gray-300 flex flex-col items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-sm">
        <a href="/" aria-label="Homepage" class="flex justify-center mb-6 sm:mb-8">
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                A
            </div>
        </a>
        {@render children()}
    </div>
</div>