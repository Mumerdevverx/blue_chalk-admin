import { Node } from '@tiptap/core';

export const Video = Node.create({
  name: 'video',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      width: { default: '100%' },
      height: { default: 'auto' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (el) => ({
          src: el.getAttribute('src'),
          controls: true,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // ✅ This generates proper <video> tag with controls
    return [
      'video',
      {
        ...HTMLAttributes,
        controls: true,
        style: 'width: 100%; max-width: 600px; border-radius: 8px;',
      },
    ];
  },

  addCommands() {
    return {
      setVideo:
        (src) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src },
          });
        },
    };
  },
});