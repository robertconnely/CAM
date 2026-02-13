"use client";

import type { ContentBlock, Document as DocType } from "@/lib/types/database";
import { HeadingBlock } from "./HeadingBlock";
import { ParagraphBlock } from "./ParagraphBlock";
import { ListBlock } from "./ListBlock";
import { FigmaEmbed } from "./FigmaEmbed";
import { ImageGallery } from "./ImageGallery";
import { KeyDocuments } from "./KeyDocuments";

interface ContentRendererProps {
  blocks: ContentBlock[];
  documents: DocType[];
}

export function ContentRenderer({ blocks, documents }: ContentRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.block_type) {
          case "subtitle":
            return (
              <p key={block.id} className="opacity-75" dangerouslySetInnerHTML={{ __html: (block.content.text as string).replace(/\n/g, "<br>") }} />
            );

          case "quick_summary":
            return (
              <div key={block.id} id="quick-summary">
                <h2>Quick Summary</h2>
                <p dangerouslySetInnerHTML={{ __html: (block.content.text as string).replace(/\n/g, "<br>") }} />
              </div>
            );

          case "heading": {
            const level = (block.content.level as number) || 2;
            const anchor = block.content.anchor as string | undefined;
            return (
              <HeadingBlock
                key={block.id}
                level={level}
                anchor={anchor}
                text={block.content.text as string}
                className={block.content.className as string | undefined}
                body={block.content.body as string | undefined}
              />
            );
          }

          case "paragraph":
            return <ParagraphBlock key={block.id} content={block.content} />;

          case "list":
            return (
              <ListBlock
                key={block.id}
                items={block.content.items as string[]}
                ordered={(block.content.ordered as boolean) || false}
              />
            );

          case "figma_embed":
            return (
              <FigmaEmbed
                key={block.id}
                title={block.content.title as string}
                embedUrl={block.content.embedUrl as string | undefined}
                imageUrl={block.content.imageUrl as string | undefined}
                figmaUrl={block.content.figmaUrl as string | undefined}
                note={block.content.note as string | undefined}
              />
            );

          case "image_gallery":
            return (
              <ImageGallery
                key={block.id}
                images={
                  block.content.images as Array<{
                    src: string;
                    alt: string;
                    caption?: string;
                  }>
                }
              />
            );

          case "key_documents": {
            const sectionDocs = block.content.documentIds
              ? documents.filter((d) =>
                  (block.content.documentIds as string[]).includes(d.id)
                )
              : documents;
            return <KeyDocuments key={block.id} documents={sectionDocs} />;
          }

          case "coming_soon":
            return (
              <div key={block.id} className="coming-soon-notice" dangerouslySetInnerHTML={{ __html: (block.content.text as string).replace(/\n/g, "<br>") }} />
            );

          case "html":
            return (
              <div
                key={block.id}
                dangerouslySetInnerHTML={{
                  __html: block.content.html as string,
                }}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
