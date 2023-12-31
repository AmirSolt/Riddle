<script lang="ts">
    export let data
    const {profile, messages, senderIdLoad} = data
</script>


<h1>
    Sender Id: {senderIdLoad}
</h1>


<form action="?/deleteProfile" method="post">
    <button class="btn variant-filled-error">Delete Profile</button>
</form>



{#if messages}
<div class="p-2 px-4 max-w-xl">
    <br>

    <div class="flex flex-col gap-2">
        {#each messages as message}
            <div class="w-full flex  {message.message_dir==='OUTBOUND'?'justify-start':'justify-end'}">
                <p class="badge break-words {message.message_dir==='OUTBOUND'?'variant-filled-secondary':'variant-filled-primary'}">
                    {message.content}
                </p>
            </div>
        {/each}
    </div>
    
    <br>
    
    <form action="?/chat" method="post">
     
        <input type="hidden" name="senderId" id="" value={senderIdLoad}>
    

        <p>New Message</p>
        <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">(icon)</div>
            <input type="text" name="content" autofocus>
            <button class="variant-filled-secondary">Submit</button>
        </div>


    </form>
</div>

    
{/if}


