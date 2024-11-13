import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LessonWithTranslations } from 'kysely-codegen';

export async function downloadCSV(lesson: LessonWithTranslations, setLoadingFalse: () => void) {
  // Get the access token
  const supabase: SupabaseClient = createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/download-csv`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lessonId: lesson.id }),
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${lesson.title}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

  setLoadingFalse();
}

export async function downloadApkg({
  lesson,
  setLoadingFalse,
}: {
  lesson: LessonWithTranslations;
  setLoadingFalse: () => void;
}) {
  try {
    // Get the access token
    const supabase: SupabaseClient = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    // Call the Edge Function directly using fetch
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/download-apkg`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lessonId: lesson.id }),
      }
    );

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
