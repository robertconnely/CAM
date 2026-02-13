import type { ContentBlockType } from "@/lib/types/database";
import { SubtitleEditor } from "./SubtitleEditor";
import { QuickSummaryEditor } from "./QuickSummaryEditor";
import { HeadingEditor } from "./HeadingEditor";
import { ParagraphEditor } from "./ParagraphEditor";
import { ListEditor } from "./ListEditor";
import { FigmaEmbedEditor } from "./FigmaEmbedEditor";
import { ImageGalleryEditor } from "./ImageGalleryEditor";
import { KeyDocumentsEditor } from "./KeyDocumentsEditor";
import { ComingSoonEditor } from "./ComingSoonEditor";
import { HtmlEditor } from "./HtmlEditor";

type EditorComponent = React.ComponentType<{
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}>;

export const BLOCK_EDITORS: Record<ContentBlockType, EditorComponent> = {
  subtitle: SubtitleEditor,
  quick_summary: QuickSummaryEditor,
  heading: HeadingEditor,
  paragraph: ParagraphEditor,
  list: ListEditor,
  figma_embed: FigmaEmbedEditor,
  image_gallery: ImageGalleryEditor,
  key_documents: KeyDocumentsEditor,
  coming_soon: ComingSoonEditor,
  html: HtmlEditor,
};
