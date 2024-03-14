import { type PropsWithChildren } from "react";
import { Navbar } from "~/components/navbar";

export default function App({ children }: PropsWithChildren) {
  return (
    <main className="container min-h-screen w-screen">
      <Navbar />
      {children}
    </main>
  );
}
