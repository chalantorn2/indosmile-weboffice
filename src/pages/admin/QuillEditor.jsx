import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR = [
  [{ header: [2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  [{ align: [] }],
  ["clean"],
];

/**
 * Thin React wrapper around Quill 2. Uncontrolled by design: it seeds from
 * `initialHTML` once, then reports edits through `onChange` (HTML string). This
 * matches how the legacy admin used Quill — the form owns the HTML, not Quill.
 */
export default function QuillEditor({ initialHTML = "", onChange }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const container = containerRef.current;
    const editor = document.createElement("div");
    container.appendChild(editor);

    const quill = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR },
      placeholder: "Write your article...",
    });
    quillRef.current = quill;

    if (initialHTML) {
      quill.clipboard.dangerouslyPasteHTML(initialHTML);
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChangeRef.current?.(html === "<p><br></p>" ? "" : html);
    });

    return () => {
      quillRef.current = null;
      container.innerHTML = "";
    };
    // Init once — the editor is uncontrolled after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden [&_.ql-container]:min-h-[360px] [&_.ql-editor]:font-body [&_.ql-editor]:text-base">
      <div ref={containerRef} />
    </div>
  );
}
