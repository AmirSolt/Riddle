<script lang="ts">

    let senderId:string = "123123"


</script>

<label class="label">
	<span>Sender Id</span>
    <input class="input" type="text" bind:value={senderId}>
</label>
<a class="btn variant-filled" href="/admin/chat-lab/{encodeURIComponent(senderId??"")}">
    Test lab: {senderId??"Empty"}
</a>

