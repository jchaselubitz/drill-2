'use server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteNotification = async (
  recipientEmail: string,
  token: string,
  origin: string
) => {
  const { data, error } = await resend.emails.send({
    from: 'TOP Invitation <onboarding@notifications.cooperativ.io>',
    to: process.env.NEXT_PUBLIC_CONTEXT === 'development' ? 'jake@cooperativ.io' : recipientEmail,
    subject: 'Create an Account',
    html: `<p>Click this link to create your account <strong>${origin}/login?token=${token}</strong></p>`,
  });
  if (error) {
    throw new Error('Failed to send email');
  }
};

export const sendFeedbackNotification = async ({
  recipientEmail,
  feedback,
  device,
  origin,
  userEmail,
}: {
  recipientEmail: string;
  feedback: string;
  device: string;
  origin: string;
  userEmail: string;
}) => {
  const { data, error } = await resend.emails.send({
    from: 'Drill Feedback <feedback@notifications.cooperativ.io>',
    to: process.env.NEXT_PUBLIC_CONTEXT === 'development' ? 'jake@cooperativ.io' : recipientEmail,
    subject: 'Drill Feedback',
    html: `<p>Feedback: ${feedback}</p><p>Device: ${device}</p><p>User: ${userEmail}</p><p>(${origin})</p>`,
  });
  if (error) {
    throw new Error('Failed to send email');
  }
};
