import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - Drill AI',
  description: 'Contact support for Drill AI.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Drill AI Support
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">How can we help?</h1>
          <p className="text-base text-muted-foreground">
            If you have questions, need assistance, or want to report an issue, we are here for
            you.
          </p>
        </header>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">Contact</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Email us and we will get back to you as soon as possible.
          </p>
          <a
            className="mt-4 inline-flex text-base font-semibold text-primary underline-offset-4 hover:underline"
            href="mailto:support@cooperativ.io"
          >
            support@cooperativ.io
          </a>
        </section>

        <section className="rounded-xl border border-border/60 bg-background/60 p-6">
          <h2 className="text-lg font-medium">Helpful details</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Include your app version, device model, iOS version, and a brief description of the
            issue.
          </p>
        </section>
      </main>
    </div>
  );
}
