import { LibraryContextProvider } from './library_context';

export default async function LibraryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LibraryContextProvider> {children} </LibraryContextProvider>;
}
