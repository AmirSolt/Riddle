<script>
    export let data
    const {purchaseSession, publishableKey} = data
</script>


<svelte:head>
    <script async src="https://js.stripe.com/v3/pricing-table.js"></script>

</svelte:head>


{#if purchaseSession!=null}
    <stripe-pricing-table 
        pricing-table-id="prctbl_1OSZTuLIYTzX0UWXvt8tTAJw"
        publishable-key={publishableKey}
        client-reference-id={purchaseSession.profileId}
        >
    </stripe-pricing-table>
{:else}

    
    <div class="">
        <div class="flex flex-col justify-center items-center text-center gap-8 pt-16">
            <div class="flex flex-col justify-center items-center text-center gap-2">
                <h1 class="text-6xl">
                    This link has been expired.
                    Please, generate a new link through SMS.
                </h1>
            </div>
    
            <p class="badge text-2xl p-2"> 
                Text 1+(343) 453-1933
            </p>
        </div>
    </div>
    

{/if}
