<script lang="ts">
    import { Table } from '@skeletonlabs/skeleton';
    import type { TableSource } from '@skeletonlabs/skeleton';
    import { tableMapperValues } from '@skeletonlabs/skeleton';
    export let data
    const {publicProfiles} = data


    const tableSimple: TableSource = {
        // A list of heading labels.
        head: ['Rank', 'Points', 'Tel'],
        // The data visibly shown in your table body UI.
        body: tableMapperValues(publicProfiles, ['rank', 'points', 'publicTwilioId']),
    };
				

</script>

<div class="p-2">
    <Table source={tableSimple} />

</div>