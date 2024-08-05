'use server';

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	amount: z.coerce.number(),
	status: z.enum(['pending', 'paid']),
	date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

/**
 * This function creates a new invoice in the database and redirects the user to the invoices page.
 * It also clears Next.js' auto-cache for the '/dashboard/invoices' path to ensure the new data is fetched.
 *
 * @param formData - The form data containing the details of the new invoice.
 * @returns A promise that resolves when the invoice is created and the user is redirected.
 *
 * @remarks
 * The function first extracts the necessary data from the `formData` parameter.
 * It then converts the `amount` from dollars to cents to avoid floating-point errors.
 * The current date is generated and used as the `date` for the new invoice.
 * The new invoice data is inserted into the `invoices` table using the `sql` template tag.
 * Next.js' auto-cache for the '/dashboard/invoices' path is cleared using the `revalidatePath` function.
 * Finally, the user is redirected to the '/dashboard/invoices' page using the `redirect` function.
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('customerId', '123');
 * formData.append('amount', '12.34');
 * formData.append('status', 'pending');
 *
 * await createInvoice(formData);
 * ```
 */
export async function createInvoice(formData: FormData) {

	const { customerId, amount, status } = CreateInvoice.parse(
		Object.fromEntries(formData.entries()) // this line: extracts all the key/values from 'formData'
	)

	// Converting the amount of dollars ($12.34) to cents (1,234) to avoid floating-point errors
	const amountInCents = amount * 100
	const date = new Date().toISOString().split('T')[0]

	try {
		await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `
	} catch (error) {
		return {
			message: 'Database Error: Failed to Create Invoice.',
		};
	}

	// Clearing Next's auto-cache from previous GET request because we are adding new data that will need to be re-gotten
	revalidatePath('/dashboard/invoices')

	// redirect the user back to the invoices page after creating a new invoice
	redirect('/dashboard/invoices')

	// Test it out:
	// console.log(rawFormData);
}

/**
 * Updates an existing invoice in the database and redirects the user to the invoices page.
 * It also clears Next.js' auto-cache for the '/dashboard/invoices' path to ensure the updated data is fetched.
 *
 * @param id - The unique identifier of the invoice to be updated.
 * @param formData - The form data containing the updated details of the invoice.
 * @returns A promise that resolves when the invoice is updated and the user is redirected.
 *
 * @remarks
 * The function first extracts the necessary data from the `formData` parameter.
 * It then converts the `amount` from dollars to cents to avoid floating-point errors.
 * The updated invoice data is updated in the `invoices` table using the `sql` template tag.
 * Next.js' auto-cache for the '/dashboard/invoices' path is cleared using the `revalidatePath` function.
 * Finally, the user is redirected to the '/dashboard/invoices' page using the `redirect` function.
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('customerId', '123');
 * formData.append('amount', '12.34');
 * formData.append('status', 'pending');
 *
 * await updateInvoice('invoice123', formData);
 * ```
 */
export async function updateInvoice(id: string, formData: FormData) {

	// Extracting data and type validating with Zod schema
	const { customerId, amount, status } = UpdateInvoice.parse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});

	// Converting the amount of dollars ($12.34) to cents (1,234) 
	const amountInCents = amount * 100;

	try {
		// SQL query
		await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
	} catch (error) {
		return { message: 'Database Error: Failed to Update Invoice.' };
	}

	// Clear client cache & make a new request to fetch updated data
	revalidatePath('/dashboard/invoices');

	// redirect the user back to the invoices page after updating the invoice
	redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
	throw new Error('Failed to Delete Invoice');

	try {
		await sql`DELETE FROM invoices WHERE id = ${id}`;
		revalidatePath('/dashboard/invoices');
		return { message: 'Deleted Invoice.' };
	} catch (error) {
		return { message: 'Database Error: Failed to Delete Invoice.' };
	}
}