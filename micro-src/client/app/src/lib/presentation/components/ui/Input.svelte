<script lang="ts">
	/**
	 * @component Input
	 * @description Reusable input component with validation and accessibility
	 */

	interface Props {
		id: string;
		name: string;
		type?: 'text' | 'password' | 'email';
		label: string;
		value?: string;
		error?: string | null;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		autocomplete?: 'off' | 'on' | 'username' | 'current-password' | 'new-password' | 'email';
		oninput?: (event: Event) => void;
		onblur?: () => void;
		'aria-describedby'?: string;
	}

	let {
		id,
		name,
		type = 'text',
		label,
		value = $bindable(''),
		error = null,
		placeholder = '',
		required = false,
		disabled = false,
		autocomplete = 'off',
		oninput,
		onblur,
		'aria-describedby': ariaDescribedBy
	}: Props = $props();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput?.(event);
	}

	function handleBlur() {
		onblur?.();
	}
</script>

<div class="mb-4">
	<label for={id} class="block text-sm font-medium text-gray-700 mb-1">
		{label}
		{#if required}
			<span class="text-red-500" aria-label="required">*</span>
		{/if}
	</label>
	<input
		{id}
		{name}
		{type}
		{placeholder}
		{required}
		{disabled}
		autocomplete={autocomplete}
		value={value}
		oninput={handleInput}
		onblur={handleBlur}
		class="w-full px-3 py-2 border rounded-lg shadow-sm focus-ring
			{error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500'}
			{disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}"
		aria-invalid={error ? 'true' : 'false'}
		aria-describedby={ariaDescribedBy || (error ? `${id}-error` : undefined)}
	/>
	{#if error}
		<p id="{id}-error" class="mt-1 text-sm text-red-600" role="alert">
			{error}
		</p>
	{/if}
</div>
