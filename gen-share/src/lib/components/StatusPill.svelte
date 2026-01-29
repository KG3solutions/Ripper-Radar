<script lang="ts">
	interface Props {
		status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
	}

	let { status }: Props = $props();

	const statusConfig = {
		proposed: {
			label: 'Proposed',
			classes: 'bg-gray-100 text-gray-700'
		},
		confirmed: {
			label: 'Confirmed',
			classes: 'bg-green-100 text-green-700'
		},
		completed: {
			label: 'Completed',
			classes: 'bg-blue-100 text-blue-700'
		},
		cancelled: {
			label: 'Cancelled',
			classes: 'bg-red-100 text-red-700'
		}
	};
</script>

<span
	class="inline-block px-3 py-1 text-sm font-medium rounded-sm {statusConfig[status].classes}"
	role="status"
>
	{statusConfig[status].label}
</span>
