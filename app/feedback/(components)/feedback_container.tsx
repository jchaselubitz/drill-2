import { BaseFeedback } from 'kysely-codegen';
import FeedbackCard from './feedback_card';
import { getFeedbackImages } from '@/lib/actions/feedbackActions';

export async function FeedbackContainer({ feedback }: { feedback: BaseFeedback }) {
  const images = await getFeedbackImages({
    feedbackId: feedback.id,
  });

  return <FeedbackCard feedback={feedback} feedbackImages={images} />;
}

export default FeedbackContainer;
