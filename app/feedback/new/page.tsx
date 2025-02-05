import { FeedbackForm } from '../(components)/feedback_form';
import { Separator } from '@/components/ui/separator';

export default async function FeedbackFormPage() {
  return (
    <div className="space-y-6 pb-36 md:pb-0  ">
      <div>
        <h3 className="text-lg font-medium">Feedback</h3>
        <p className="text-sm text-muted-foreground">Leave feedback for the software developer.</p>
      </div>
      <Separator />
      <FeedbackForm />
    </div>
  );
}
