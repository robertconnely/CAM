import type { Document as DocType } from "@/lib/types/database";

interface KeyDocumentsProps {
  documents: DocType[];
  title?: string;
}

export function KeyDocuments({ documents, title = "Key Documents" }: KeyDocumentsProps) {
  if (!documents.length) return null;

  return (
    <div className="key-documents">
      <h3>{title}</h3>
      <div className="doc-list">
        {documents.map((doc) => (
          <div key={doc.id} className="doc-item">
            <div className="doc-icon">{doc.icon}</div>
            <div className="doc-link">
              <a
                href={`/api/documents/${doc.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {doc.title}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
