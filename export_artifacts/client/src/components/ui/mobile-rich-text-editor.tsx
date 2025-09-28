import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Focus from '@tiptap/extension-focus'
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileRichTextEditorProps {
  content?: string
  placeholder?: string
  onChange?: (content: string) => void
  className?: string
  editable?: boolean
  minHeight?: string
  maxHeight?: string
}

export function MobileRichTextEditor({
  content = '',
  placeholder = 'Start writing...',
  onChange,
  className,
  editable = true,
  minHeight = '120px',
  maxHeight = '300px'
}: MobileRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Typography,
      Focus.configure({
        className: 'has-focus',
        mode: 'all'
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none px-3 py-2',
          'prose-headings:font-semibold prose-headings:text-gray-900',
          'prose-p:text-gray-700 prose-p:leading-relaxed',
          'prose-strong:text-gray-900 prose-strong:font-semibold',
          'prose-em:text-gray-700',
          'prose-ul:text-gray-700 prose-ol:text-gray-700',
          'prose-li:text-gray-700',
          'prose-blockquote:text-gray-600 prose-blockquote:border-l-blue-500',
          className
        ),
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`
      }
    }
  })

  if (!editor) {
    return null
  }

  if (!editable) {
    return (
      <div className={cn("rounded-md border bg-white", className)}>
        <EditorContent editor={editor} />
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border bg-white", className)} data-testid="mobile-rich-text-editor">
      {/* Toolbar - Mobile Optimized */}
      <div className="border-b bg-gray-50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
              data-testid="button-bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
              data-testid="button-italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-semibold"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              data-active={editor.isActive('heading', { level: 1 })}
              data-testid="button-h1"
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-semibold"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              data-active={editor.isActive('heading', { level: 2 })}
              data-testid="button-h2"
            >
              H2
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              data-active={editor.isActive('bulletList')}
              data-testid="button-bullet-list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              data-active={editor.isActive('orderedList')}
              data-testid="button-ordered-list"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Quote */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              data-active={editor.isActive('blockquote')}
              data-testid="button-quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              data-testid="button-undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              data-testid="button-redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}