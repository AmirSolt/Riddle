<script lang="ts">
    export let data
    const {profile, messages} = data
</script>

<form action="?/deleteProfile" method="post">
    <button class="btn variant-filled-error">Delete Profile</button>
</form>


<form action="?/chat" method="post">
    <input type="text" name="senderId" id="" placeholder="123123123">
    <input type="text" name="content" id="">
</form>