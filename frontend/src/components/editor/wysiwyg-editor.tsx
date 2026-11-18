import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eye,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface WysiwygEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = 'Mulai menulis isi artikel interaktif di sini...',
}: WysiwygEditorProps) {
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'html'>(
    'editor',
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Masukkan URL tautan:', previousUrl ?? 'https://')

    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run()
  }

  return (
    <div className="bg-card overflow-hidden rounded-none border-0">
      {/* Interactive Formatting Toolbar (Sera Style, Borderless) */}
      <div className="bg-muted/60 flex flex-wrap items-center justify-between gap-1 p-2">
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolbarButton
            active={editor.isActive('heading', { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
            disabled={viewMode !== 'editor'}
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
            disabled={viewMode !== 'editor'}
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('heading', { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Heading 3"
            disabled={viewMode !== 'editor'}
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            disabled={viewMode !== 'editor'}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            disabled={viewMode !== 'editor'}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
            disabled={viewMode !== 'editor'}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            disabled={viewMode !== 'editor'}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
            disabled={viewMode !== 'editor'}
          >
            <Highlighter className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Rata Kiri"
            disabled={viewMode !== 'editor'}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Rata Tengah"
            disabled={viewMode !== 'editor'}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Rata Kanan"
            disabled={viewMode !== 'editor'}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            disabled={viewMode !== 'editor'}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            disabled={viewMode !== 'editor'}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
            disabled={viewMode !== 'editor'}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
            disabled={viewMode !== 'editor'}
          >
            <Code className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('link')}
            onClick={handleSetLink}
            title="Sisipkan Link"
            disabled={viewMode !== 'editor'}
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Garis Pemisah"
            disabled={viewMode !== 'editor'}
          >
            <Minus className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={viewMode !== 'editor' || !editor.can().undo()}
            title="Undo"
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={viewMode !== 'editor' || !editor.can().redo()}
            title="Redo"
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>

        {/* Mode Switcher: Visual Editor vs Preview vs Raw HTML */}
        <div className="bg-background flex items-center gap-0.5 rounded-none p-0.5">
          <Button
            type="button"
            variant={viewMode === 'editor' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('editor')}
          >
            <PenLine className="size-3" />
            Visual
          </Button>
          <Button
            type="button"
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="size-3" />
            Pratinjau
          </Button>
          <Button
            type="button"
            variant={viewMode === 'html' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('html')}
          >
            <FileCode2 className="size-3" />
            HTML
          </Button>
        </div>
      </div>

      {/* Editor / Preview / HTML Content Area */}
      <div className="p-5 sm:p-8">
        {viewMode === 'editor' && <EditorContent editor={editor} />}

        {viewMode === 'preview' && (
          <div
            className="wysiwyg-content min-h-[360px]"
            dangerouslySetInnerHTML={{
              __html:
                value ||
                '<p class="text-muted-foreground italic">Belum ada konten untuk ditampilkan.</p>',
            }}
          />
        )}

        {viewMode === 'html' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-muted/40 text-foreground min-h-[360px] w-full rounded-none border-0 p-4 font-mono text-xs leading-relaxed outline-none"
            placeholder="<p>Raw HTML WYSIWYG...</p>"
          />
        )}
      </div>
    </div>
  )
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'hover:bg-accent hover:text-accent-foreground inline-flex size-8 items-center justify-center rounded-none text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
        active &&
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
      )}
    >
      {children}
    </button>
  )
}
