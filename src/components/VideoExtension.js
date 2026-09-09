import { Node } from '@tiptap/core';

export function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    let videoId = '';

    if (parsedUrl.hostname === 'youtu.be') {
      videoId = parsedUrl.pathname.slice(1).split('/')[0];
    } else if (parsedUrl.hostname.includes('youtube.com')) {
      if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v') || '';
      } else if (parsedUrl.pathname.startsWith('/embed/')) {
        videoId = parsedUrl.pathname.split('/')[2] || '';
      } else if (parsedUrl.pathname.startsWith('/shorts/')) {
        videoId = parsedUrl.pathname.split('/')[2] || '';
      }
    }

    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

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
      {
        tag: 'iframe',
        getAttrs: (el) => ({
          src: el.getAttribute('src'),
          controls: false,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getYouTubeEmbedUrl(HTMLAttributes.src);

    if (embedUrl) {
      return [
        'iframe',
        {
          src: embedUrl,
          title: 'YouTube video',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true',
          style: 'width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;',
        },
      ];
    }

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