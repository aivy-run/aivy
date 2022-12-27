import type { Editor } from '@tiptap/core'
import { styled } from 'decorock'
import { Component, For, useContext } from 'solid-js'
import { createEditorTransaction } from 'solid-tiptap'

import { NoteFormContext } from '.'
import { MenuItem } from './menu-item'
import { uploadFile } from './upload'

import IconTextCode from '~icons/carbon/code'
import IconImage from '~icons/carbon/image'
import IconListBulleted from '~icons/carbon/list-bulleted'
import IconListNumbered from '~icons/carbon/list-numbered'
import IconTextParagraph from '~icons/carbon/paragraph'
import IconTextPen from '~icons/carbon/pen'
import IconQuotes from '~icons/carbon/quotes'
import IconRedo from '~icons/carbon/redo'
import IconTextBold from '~icons/carbon/text-bold'
import IconTextItalic from '~icons/carbon/text-italic'
import IconTextStrikethrough from '~icons/carbon/text-strikethrough'
import IconTextWrap from '~icons/carbon/text-wrap'
import IconUndo from '~icons/carbon/undo'
import IconCodeBlock from '~icons/material-symbols/code-blocks-outline'
import IconFormatClear from '~icons/material-symbols/format-clear'
import IconHeading1 from '~icons/material-symbols/format-h1-rounded'
import IconHeading2 from '~icons/material-symbols/format-h2-rounded'
import IconDivider from '~icons/material-symbols/horizontal-rule-rounded'

const Container = styled.div`
  position: sticky;
  z-index: 5;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.25rem;
  border-bottom: 3px solid ${(p) => p.theme.colors.text};
  background-color: ${(p) => p.theme.colors.bg_accent};
`

const Divider = styled.div`
  width: 2px;
  height: 1.25rem;
  margin-right: 0.75rem;
  margin-left: 0.5rem;
  background-color: ${(p) => p.theme.colors.text.fade(0.5)};
`

export const MenuBar: Component<{ editor: Editor }> = (props) => {
  const { id } = useContext(NoteFormContext)
  const items = [
    {
      icon: <IconTextBold />,
      title: 'Bold',
      action: () => props.editor.chain().focus().toggleBold().run(),
      isActive: (editor: Editor) => editor.isActive('bold'),
    },
    {
      icon: <IconTextItalic />,
      title: 'Italic',
      action: () => props.editor.chain().focus().toggleItalic().run(),
      isActive: (editor: Editor) => editor.isActive('italic'),
    },
    {
      icon: <IconTextStrikethrough />,
      title: 'Strike',
      action: () => props.editor.chain().focus().toggleStrike().run(),
      isActive: (editor: Editor) => editor.isActive('strike'),
    },
    {
      icon: <IconTextCode />,
      title: 'Code',
      action: () => props.editor.chain().focus().toggleCode().run(),
      isActive: (editor: Editor) => editor.isActive('code'),
    },
    {
      icon: <IconTextPen />,
      title: 'Highlight',
      action: () => props.editor.chain().focus().toggleHighlight().run(),
      isActive: (editor: Editor) => editor.isActive('highlight'),
    },
    {
      type: 'divider',
    },
    {
      icon: <IconImage />,
      title: 'Upload Image',
      action: () => uploadFile(props.editor, id),
    },
    {
      type: 'divider',
    },
    {
      icon: <IconHeading1 />,
      title: 'Heading 1',
      action: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <IconHeading2 />,
      title: 'Heading 2',
      action: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <IconTextParagraph />,
      title: 'Paragraph',
      action: () => props.editor.chain().focus().setParagraph().run(),
      isActive: (editor: Editor) => editor.isActive('paragraph'),
    },
    {
      icon: <IconListBulleted />,
      title: 'Bullet List',
      action: () => props.editor.chain().focus().toggleBulletList().run(),
      isActive: (editor: Editor) => editor.isActive('bulletList'),
    },
    {
      icon: <IconListNumbered />,
      title: 'Ordered List',
      action: () => props.editor.chain().focus().toggleOrderedList().run(),
      isActive: (editor: Editor) => editor.isActive('orderedList'),
    },
    {
      icon: <IconCodeBlock />,
      title: 'Code Block',
      action: () => props.editor.chain().focus().toggleCodeBlock().run(),
      isActive: (editor: Editor) => editor.isActive('codeBlock'),
    },
    {
      type: 'divider',
    },
    {
      icon: <IconQuotes />,
      title: 'Blockquote',
      action: () => props.editor.chain().focus().toggleBlockquote().run(),
      isActive: (editor: Editor) => editor.isActive('blockquote'),
    },
    {
      icon: <IconDivider />,
      title: 'Horizontal Rule',
      action: () => props.editor.chain().focus().setHorizontalRule().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: <IconTextWrap />,
      title: 'Hard Break',
      action: () => props.editor.chain().focus().setHardBreak().run(),
    },
    {
      icon: <IconFormatClear />,
      title: 'Clear Format',
      action: () => props.editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: <IconUndo />,
      title: 'Undo',
      action: () => props.editor.chain().focus().undo().run(),
    },
    {
      icon: <IconRedo />,
      title: 'Redo',
      action: () => props.editor.chain().focus().redo().run(),
    },
  ]

  return (
    <Container>
      <For each={items}>
        {(item) => (
          <>
            {item.type === 'divider' ? (
              <Divider />
            ) : (
              <MenuItem
                icon={item.icon}
                title={item.title || ''}
                action={item.action}
                isActive={
                  item.isActive
                    ? createEditorTransaction(() => props.editor, item.isActive)
                    : undefined
                }
              />
            )}
          </>
        )}
      </For>
    </Container>
  )
}
