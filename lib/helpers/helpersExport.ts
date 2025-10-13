import { ButtonLoadingState } from '@/components/ui/button-loading';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LessonWithTranslations } from 'kysely-codegen';

async function downloadFunction(
  lesson: LessonWithTranslations,
  setLoadingState: (state: ButtonLoadingState) => void,
  functionName: string,
  functionType: 'csv' | 'apkg'
) {
  setLoadingState('loading');
  try {
    // Get the access token
    const supabase: SupabaseClient = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
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
      a.download = `${lesson.title}.${functionType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setLoadingState('success');
    }
  } catch (e) {
    console.error('There was a problem with the fetch operation:', e);
    setLoadingState('error');
  }
}

export async function downloadCSV({
  lesson,
  setLoadingState,
}: {
  lesson: LessonWithTranslations;
  setLoadingState: (state: ButtonLoadingState) => void;
}) {
  // Get the access tokem
  try {
    downloadFunction(lesson, setLoadingState, 'download-csv', 'csv');
  } catch (e) {
    console.error('There was a problem with the fetch operation:', e);
    setLoadingState('error');
  }
}

export async function downloadApkg({
  lesson,
  setLoadingState,
}: {
  lesson: LessonWithTranslations;
  setLoadingState: (state: ButtonLoadingState) => void;
}) {
  try {
    downloadFunction(lesson, setLoadingState, 'download-apkg', 'apkg');
  } catch (e) {
    console.error('There was a problem with the fetch operation:', e);
    setLoadingState('error');
  }
}
