"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, type ReactNode } from "react";
import { bodyCss } from "@/lib/fonts";
import { FontPicker } from "./FontPicker";

function ToolBtn({
  onClick,
  active,
  title,
  children,
  wide,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`inline-flex h-[34px] items-center justify-center rounded border bg-canvas font-meta text-[13.5px] text-ink transition-colors ${
        wide ? "px-3" : "w-[34px]"
      } ${active ? "border-ink" : "border-line hover:border-ink"}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, font, onFont }: { editor: Editor; font: string; onFont: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-t border border-b-0 border-line bg-block px-3 py-2.5">
      <FontPicker value={font} onChange={onFont} />
      <span className="mx-0.5 h-[22px] w-px bg-line" />
      <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </ToolBtn>
      <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </ToolBtn>
      <ToolBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </ToolBtn>
      <span className="mx-0.5 h-[22px] w-px bg-line" />
      <ToolBtn title="Heading" wide active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        Heading
      </ToolBtn>
      <ToolBtn title="Quote" wide active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        &ldquo; Quote
      </ToolBtn>
      <ToolBtn title="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        &bull;
      </ToolBtn>
      <ToolBtn title="Clear formatting" wide onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        Clear
      </ToolBtn>
    </div>
  );
}

/** Rich-text editor (replaces admin-richtext.jsx contentEditable). */
export function TipTapEditor({
  html,
  font,
  onHtml,
  onFont,
  placeholder = "Begin writing…",
}: {
  html: string;
  font: string;
  onHtml: (v: string) => void;
  onFont: (v: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: html || "",
    editorProps: {
      attributes: {
        class: "rich-editor min-h-[280px] rounded-b border border-line bg-block px-[22px] py-5 outline-none",
      },
    },
    onUpdate: ({ editor }) => onHtml(editor.getHTML()),
  });

  // Keep the editor body font in sync with the picker.
  useEffect(() => {
    if (editor) {
      const dom = editor.view.dom as HTMLElement;
      dom.style.fontFamily = bodyCss(font);
      dom.style.fontSize = "18px";
      dom.style.lineHeight = "1.75";
      dom.style.color = "var(--ink)";
    }
  }, [editor, font]);

  if (!editor) {
    return <div className="min-h-[340px] rounded border border-line bg-block" />;
  }

  return (
    <div>
      <Toolbar editor={editor} font={font} onFont={onFont} />
      <EditorContent editor={editor} />
      <p className="meta mt-2.5 text-[12px]" style={{ color: "var(--ink-faint)" }}>
        Body font: <span style={{ fontFamily: bodyCss(font) }}>{font}</span>. Headings keep the site style.
      </p>
    </div>
  );
}
