<script lang="ts">
  let messages: Array<{ text: string; sender: 'user' | 'ai' }> = [
    { text: 'Hello! How can I help you plan your day?', sender: 'ai' }
  ];
  let userInput = '';

  function sendMessage() {
    if (userInput.trim() === '') return;
    messages = [...messages, { text: userInput, sender: 'user' }];
    // In the future, AI response logic will go here
    userInput = '';
    // Simulate AI response for now
    setTimeout(() => {
      messages = [...messages, { text: 'I am processing your request...', sender: 'ai'}];
    }, 1000);
  }
</script>

<div class="bg-zinc-800 text-white p-4 shadow-lg flex flex-col h-full max-h-[400px] border border-zinc-700 rounded-lg">
  <div class="flex-grow overflow-y-auto mb-4 space-y-2 p-3 bg-zinc-700/50 rounded-md">
    {#each messages as message}
      <div
        class="p-2.5 text-sm rounded-lg max-w-[80%] {message.sender === 'user' ?
        'bg-green-600 ml-auto text-right rounded-br-none' :
        'bg-zinc-600 mr-auto text-left rounded-bl-none'}"
      >
        {message.text}
      </div>
    {/each}
  </div>
  <div class="flex mt-auto">
    <input
      type="text"
      bind:value={userInput}
      on:keypress={(e) => e.key === 'Enter' && sendMessage()}
      placeholder="Ask the AI to help plan your schedule..."
      class="flex-grow p-2 bg-zinc-700 border border-zinc-600 rounded-l-md text-gray-100 placeholder-zinc-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
    />
    <button
      on:click={sendMessage}
      class="bg-green-500 hover:bg-green-600 text-white p-2 px-4 rounded-r-md font-semibold transition-colors duration-150"
    >
      Send
    </button>
  </div>
</div>

<style>
  /* Basic scrollbar styling for chat messages */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent; /* Or bg-zinc-700/50 if you want it visible */
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #52525b; /* zinc-600 */
    border-radius: 3px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #71717a; /* zinc-500 */
  }
</style>
