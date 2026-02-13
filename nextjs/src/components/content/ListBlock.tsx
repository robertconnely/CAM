interface ListBlockProps {
  items: string[];
  ordered?: boolean;
}

export function ListBlock({ items, ordered }: ListBlockProps) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag>
      {items.map((item, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </Tag>
  );
}
