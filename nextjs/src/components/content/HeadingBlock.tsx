interface HeadingBlockProps {
  level: number;
  text: string;
  anchor?: string;
  className?: string;
  body?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function HeadingBlock({ level, text, anchor, className, body }: HeadingBlockProps) {
  const Tag = `h${Math.min(Math.max(level, 1), 6)}` as keyof React.JSX.IntrinsicElements;
  const id = anchor || slugify(text);
  return (
    <>
      <Tag id={id} className={className} dangerouslySetInnerHTML={{ __html: text }} />
      {body && <div dangerouslySetInnerHTML={{ __html: body }} />}
    </>
  );
}
