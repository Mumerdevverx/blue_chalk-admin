import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Video } from "./VideoExtension"; // ✅ Custom video extension

const TipTapEditor = ({ value, onChange }) => {
  const savedSelection = useRef(null);
  const [selectedColor, setSelectedColor] = useState("#000000");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Youtube,
      Video, // ✅ Added
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextStyle,
      Color,
    ],

    content: value || "<p></p>",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log("📝 Editor HTML:", html); // Debug
      if (html !== "<p></p>" && html !== "<p><br></p>") {
        onChange(html);
      } else {
        onChange("");
      }
    },

    editorProps: {
      attributes: {
        // 👇 ADDED `whitespace-pre-wrap` HERE to preserve multiple spaces
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 dark:prose-invert whitespace-pre-wrap",
      },
    },
  });

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 text-gray-500">
        Loading editor...
      </div>
    );
  }

  const ToolbarButton = ({ onClick, active, children, label }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );

  const Separator = () => <span className="w-px h-6 bg-gray-300 mx-1" />;

  // ✅ Insert video using custom command
  const insertVideo = () => {
    const url = prompt("Enter video URL (MP4, WebM, etc.):");
    if (url) {
      editor.chain().focus().setVideo(url).run();
    }
  };

  // Insert link
  const setLink = () => {
    const url = prompt("Enter the link URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-shadow hover:shadow-md">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-1 sticky top-0 z-10">
        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="Italic"
        >
          <em>I</em>
        </ToolbarButton>

        {/* Strike */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="Strike"
        >
          <s>S</s>
        </ToolbarButton>

        <Separator />

        {/* Heading 2 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          label="Heading 2"
        >
          H2
        </ToolbarButton>

        {/* Heading 3 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          label="Heading 3"
        >
          H3
        </ToolbarButton>

        <Separator />

        {/* Bullet List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Bullet List"
        >
          • List
        </ToolbarButton>

        {/* Ordered List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Ordered List"
        >
          1. List
        </ToolbarButton>

        <Separator />

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Blockquote"
        >
          ❝
        </ToolbarButton>

        {/* Code Block */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          label="Code Block"
        >
          {"<>"}
        </ToolbarButton>

        <Separator />

        {/* Image */}
        <ToolbarButton
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          label="Insert Image"
        >
          🖼️
        </ToolbarButton>

        {/* ✅ Video (MP4/S3) */}
        <ToolbarButton onClick={insertVideo} label="Insert Video">
          ▶️
        </ToolbarButton>

        <Separator />

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          label="Add Link"
        >
          🔗
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          label="Remove Link"
        >
          🔗❌
        </ToolbarButton>

        <Separator />

        {/* Text Color */}
        <label
          title="Text Color"
          className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
        >
          <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
            A
          </span>
          <input
            type="color"
            value={editor.getAttributes("textStyle").color || selectedColor}
            onFocus={() => {
              savedSelection.current = editor.state.selection;
            }}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              const chain = editor.chain().focus();
              if (savedSelection.current) {
                chain.setTextSelection(savedSelection.current);
              }
              chain.setColor(e.target.value).run();
            }}
            className="w-7 h-7 cursor-pointer border-0 rounded"
          />
        </label>

        {/* Clear Text Color */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetColor().run()}
          label="Remove Text Color"
        >
          A×
        </ToolbarButton>

        <Separator />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
        >
          ↩
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
        >
          ↪
        </ToolbarButton>

        <Separator />

        {/* Clear Formatting */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          label="Clear Formatting"
        >
          ✨
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className="min-h-[200px] bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;