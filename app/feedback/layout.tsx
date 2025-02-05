export default async function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 md:p-10 w-full pb-48 md:b-10 h-full overflow-y-scroll">{children}</div>
  );
}
