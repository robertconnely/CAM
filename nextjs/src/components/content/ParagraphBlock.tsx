interface ParagraphBlockProps {
  content: Record<string, unknown>;
}

export function ParagraphBlock({ content }: ParagraphBlockProps) {
  const html = (content.html as string) || (content.text as string) || "";
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
