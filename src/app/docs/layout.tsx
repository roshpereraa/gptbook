import { DocsNav } from "@/components/DocsNav";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 pt-20 pb-24 md:pt-10 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <DocsNav />
      </aside>
      <article className="doc min-w-0 max-w-[720px]">{children}</article>
    </div>
  );
}
