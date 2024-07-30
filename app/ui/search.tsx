'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'

export default function Search({ placeholder }: { placeholder: string }) {

	const searchParams = useSearchParams() // this hook allows to access the params from the client's url
	const pathname = usePathname(); // dashboard/invoices
	const { replace } = useRouter(); // replaces the URL in the browsers URL bar

	const handleSearch = useDebouncedCallback((term) => {
		console.log(`Searching... ${term}`);
		// CREATE THE PARAM OBJECT FOR THE URL
		const params = new URLSearchParams(searchParams)
		params.set('page', '1');

		if (term) {
			params.set('query', term); // query === ?query=asdf
		} else {
			params.delete('query');
		}

		replace(`${pathname}?${params.toString()}`);  // http://localhost:3000/dashboard/invoices?query=asdf
	}, 1_000)

	return (
		<div className="relative flex flex-1 flex-shrink-0">
			<label htmlFor="search" className="sr-only">
				Search
			</label>
			<input
				onChange={e => handleSearch(e.target.value)}
				className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
				placeholder={placeholder}
				// value or defaultValue ? value for controlled components (React manages state), defaultValue for the input-el to manage its own state
				defaultValue={searchParams.get('query')?.toString()} // populates the search bar with search criteria if someone navigates to this page via a query url
			/>
			<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
		</div>
	);
}
