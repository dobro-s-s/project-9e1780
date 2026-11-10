/** Light decorative shapes floating behind the content. Purely visual. */
export function PlayfulShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className="animate-float absolute left-[6%] top-[8%] size-10 rounded-full bg-accent md:size-16"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="animate-float absolute right-[8%] top-[14%] size-8 rounded-xl bg-secondary md:size-14"
        style={{ animationDelay: "1.2s", ["--rot" as string]: "18deg" }}
      />
      <span
        className="animate-float absolute bottom-[12%] left-[10%] size-7 rounded-lg bg-sky md:size-12"
        style={{ animationDelay: "2s", ["--rot" as string]: "-14deg" }}
      />
      <span
        className="animate-float absolute bottom-[18%] right-[7%] size-9 rounded-full border-[6px] border-berry md:size-14"
        style={{ animationDelay: "0.6s" }}
      />
    </div>
  );
}
