import Link from 'next/link';
import BackButton from '@/components/back_button';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center mt-10 gap-3">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <div className="flex gap-3">
        <BackButton showLabel />
        <Link href="/" passHref>
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
