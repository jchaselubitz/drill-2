import { BaseFeedback } from 'kysely-codegen';
import { getFeedbackImages } from '@/lib/actions/feedbackActions';

import FeedbackCard from './feedback_card';

export async function FeedbackContainer({ feedback }: { feedback: BaseFeedback }) {
  const images = await getFeedbackImages({
    feedbackId: feedback.id,
  });

  return <FeedbackCard feedback={feedback} feedbackImages={images} />;
}

export default FeedbackContainer;
