import FeedbackContainer from './(components)/feedback_container';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getFeedback } from '@/lib/actions/feedbackActions';
import { Separator } from '@/components/ui/separator';

export default async function FeedbackPage() {
  const feedback = await getFeedback();

  return (
    <div className="flex flex-col space-y-6 h-full">
      <div className="flex flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-medium">Feedback</h3>
          <p className="text-sm text-muted-foreground">Upvote or downvote current feedback</p>
        </div>
        <Link href={`/feedback/new`}>
          <Button variant={'default'}>Leave Feedback</Button>
        </Link>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col gap-4   ">
        {feedback.map((feedback) => (
          <FeedbackContainer key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </div>
  );
}
