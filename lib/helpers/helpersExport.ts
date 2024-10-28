import type { SupabaseClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function downloadCSV(
	lesson: { id: number; title: string },
	setLoadingFalse: () => void
) {
	await fetch(`/api/downloads/csv/${lesson.id}`, {
		method: 'POST'
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.blob();
		})
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `${lesson.title}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		})
		.catch((error) => {
			console.error('There was a problem with the fetch operation:', error);
		});
	setLoadingFalse();
}

export async function downloadApkg({
	lesson,
	setLoadingFalse,
	supabase
}: {
	lesson: { id: number; title: string };
	setLoadingFalse: () => void;
	supabase: SupabaseClient<any, 'public', any>;
}) {
	try {
		// Get the access token
		const {
			data: { session }
		} = await supabase.auth.getSession();
		const accessToken = session?.access_token;

		// Call the Edge Function directly using fetch
		const response = await fetch(`${VITE_SUPABASE_URL}/functions/v1/download-apkg`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({ lessonId: lesson.id })
		});

		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `${lesson.title}.apkg`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		}
	} catch (e) {
		console.error('There was a problem with the fetch operation:', e);
	}

	setLoadingFalse();
}
