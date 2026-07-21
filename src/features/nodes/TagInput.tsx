import {
  type ClipboardEvent,
  type KeyboardEvent,
  useState,
} from 'react'
import './TagInput.css'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, ' ')
}

export function TagInput({
  tags,
  onChange,
}: TagInputProps) {
  const [draft, setDraft] = useState('')

  function addTags(values: string[]) {
    const existing = new Set(
      tags.map((tag) => tag.toLowerCase()),
    )

    const additions = values
      .map(normalizeTag)
      .filter(Boolean)
      .filter((tag) => {
        const normalized = tag.toLowerCase()

        if (existing.has(normalized)) {
          return false
        }

        existing.add(normalized)
        return true
      })

    if (additions.length > 0) {
      onChange([...tags, ...additions])
    }
  }

  function commitDraft() {
    if (!draft.trim()) {
      return
    }

    addTags(draft.split(','))
    setDraft('')
  }

  function removeTag(tagToRemove: string) {
    onChange(
      tags.filter((tag) => tag !== tagToRemove),
    )
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ','
    ) {
      event.preventDefault()
      commitDraft()
      return
    }

    if (
      event.key === 'Backspace' &&
      draft === '' &&
      tags.length > 0
    ) {
      onChange(tags.slice(0, -1))
    }
  }

  function handlePaste(
    event: ClipboardEvent<HTMLInputElement>,
  ) {
    const pasted = event.clipboardData.getData('text')

    if (!pasted.includes(',')) {
      return
    }

    event.preventDefault()
    addTags(pasted.split(','))
    setDraft('')
  }

  return (
    <div
      className="tag-input"
      onClick={(event) => {
        const input =
          event.currentTarget.querySelector('input')

        input?.focus()
      }}
    >
      {tags.map((tag) => (
        <span className="tag-chip" key={tag}>
          <span>{tag}</span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              removeTag(tag)
            }}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}

      <input
        value={draft}
        onChange={(event) =>
          setDraft(event.target.value)
        }
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={commitDraft}
        placeholder={
          tags.length === 0
            ? 'Type a tag and press Enter'
            : 'Add another tag'
        }
      />
    </div>
  )
}
