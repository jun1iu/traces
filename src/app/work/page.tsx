import type { Metadata } from "next";
import { StudyList } from "@/components/site/study-list";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies: the problems, the decisions and what each one cost.",
};

export default function WorkPage() {
  return (
    <div className="flex flex-col gap-14">
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="font-display text-[2.75rem] sm:text-6xl">Case studies</h1>
        <p className="text-lg text-pretty text-muted">
          Not just what I built, but why: the problem, the options I turned down, what each decision
          cost, and what review caught. Each one has live comparisons you can try.
        </p>
      </header>
      <StudyList />
    </div>
  );
}
