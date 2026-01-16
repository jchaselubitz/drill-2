import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Drill AI',
  description: 'Privacy policy for Drill AI.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Drill AI
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-base text-muted-foreground">Last updated: January 16, 2025</p>
        </header>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">Overview</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Drill AI is designed with your privacy in mind. We do not track individual users or
            collect personal information. Your data stays on your device.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">Data Storage</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All your learning data, progress, and preferences are stored locally on your device. We
            do not have access to this data, and it is never transmitted to our servers.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">Website Analytics</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our website uses Vercel Analytics to collect anonymous, aggregated usage data. This
            helps us understand how visitors interact with our site and improve the user experience.
            This data does not identify individual users and includes:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Page views and navigation patterns</li>
            <li>General geographic region</li>
            <li>Device type and browser information</li>
            <li>Referral sources</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">What We Do Not Collect</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Personal identification information</li>
            <li>Email addresses (unless you contact support)</li>
            <li>Location data</li>
            <li>Usage data from the mobile app</li>
            <li>Learning progress or performance data</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">Third-Party Services</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our website is hosted on Vercel. Vercel Analytics is privacy-focused and does not use
            cookies or track individual users across sites. For more information, see{' '}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              className="font-medium text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel&apos;s Analytics Privacy Policy
            </a>
            .
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            This app uses Google Gemini language models to power AI features. Your interactions with
            these features are subject to{' '}
            <a
              href="https://policies.google.com/privacy"
              className="font-medium text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-background p-6">
          <h2 className="text-lg font-medium">Changes to This Policy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We may update this privacy policy from time to time. Any changes will be posted on this
            page with an updated revision date.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-background/60 p-6">
          <h2 className="text-lg font-medium">Contact Us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If you have any questions about this privacy policy, please contact us at{' '}
            <a
              href="mailto:support@cooperativ.io"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              support@cooperativ.io
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
