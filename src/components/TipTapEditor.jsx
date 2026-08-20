import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';

const TipTapEditor = ({ value, onChange, placeholder = 'Write something amazing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Youtube,
    ],
    content: value || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== `<p>${placeholder}</p>` && html !== '<p></p>') {
        onChange(html);
      } else {
        onChange('');
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 dark:prose-invert',
      },
    },
  });

  if (!editor) {
    return <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Loading editor...</div>;
  }

  const ToolbarButton = ({ onClick, active, children, label }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );

  const Separator = () => <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-shadow hover:shadow-md">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-1 sticky top-0 z-10">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} label="Strike"><s>S</s></ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} label="Heading 3">H3</ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label="Bullet List">• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label="Ordered List">1. List</ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} label="Blockquote">❝</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} label="Code Block">{'<>'}</ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => {
            const url = prompt('Enter image URL:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }} label="Insert Image">🖼️</ToolbarButton>
        <ToolbarButton onClick={() => {
            const url = prompt('Enter YouTube URL:');
            if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }} label="Insert YouTube Video">▶️</ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">↪</ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} label="Clear Formatting">✨</ToolbarButton>
      </div>

      <div className="min-h-[200px] bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;