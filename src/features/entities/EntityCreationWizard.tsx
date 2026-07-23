import { useState } from 'react'

import {
  entityTypes,
  getEntityType,
} from '../../config/entityTypes'

import type {
  Gender,
  NodeType,
} from '../../types/graph'

import './EntityCreationWizard.css'

export interface NewEntityDetails {
  label: string
  type: NodeType
  gender: Gender
  description: string
  address: string
  city: string
  tags: string[]
}

interface EntityCreationWizardProps {
  onCreate: (details: NewEntityDetails) => void
  onCancel: () => void
}

export function EntityCreationWizard({
  onCreate,
  onCancel,
}: EntityCreationWizardProps) {
  const [type, setType] = useState<NodeType>('person')
  const [label, setLabel] = useState('')
  const [gender, setGender] =
    useState<Gender>('unspecified')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [tagsText, setTagsText] = useState('')

  const definition = getEntityType(type)

  function submit(event: React.FormEvent) {
    event.preventDefault()

    const cleanLabel = label.trim()

    if (!cleanLabel) {
      window.alert('Enter a name for this entity.')
      return
    }

    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim().replace(/\s+/g, ' '))
      .filter(Boolean)

    onCreate({
      label: cleanLabel,
      type,
      gender:
        type === 'person'
          ? gender
          : 'unspecified',
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      tags: [...new Set(tags)],
    })
  }

  return (
    <div
      className="entity-wizard-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <form
        className="entity-wizard"
        onSubmit={submit}
      >
        <header className="entity-wizard-header">
          <div>
            <h2>Create entity</h2>
            <p>
              Choose what kind of real-world entity
              you want to add.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <section className="entity-type-grid">
          {entityTypes.map((item) => (
            <button
              type="button"
              key={item.type}
              className={
                item.type === type
                  ? 'entity-type-option active'
                  : 'entity-type-option'
              }
              onClick={() => setType(item.type)}
            >
              <span className="entity-type-symbol">
                {item.symbol}
              </span>

              <span>
                <strong>{item.singularLabel}</strong>
                <small>
                  {item.defaultRelationship}
                </small>
              </span>
            </button>
          ))}
        </section>

        <section className="entity-wizard-fields">
          <label>
            {definition.singularLabel} name
            <input
              autoFocus
              value={label}
              onChange={(event) =>
                setLabel(event.target.value)
              }
              placeholder={
                type === 'address'
                  ? '123 Main Street'
                  : `Enter ${definition.singularLabel.toLowerCase()} name`
              }
            />
          </label>

          {type === 'person' && (
            <label>
              Gender
              <select
                value={gender}
                onChange={(event) =>
                  setGender(
                    event.target.value as Gender,
                  )
                }
              >
                <option value="unspecified">
                  Unspecified
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          )}

          {(type === 'person' ||
            type === 'company' ||
            type === 'church' ||
            type === 'school' ||
            type === 'address') && (
            <div className="entity-wizard-row">
              <label>
                Address
                <input
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                />
              </label>

              <label>
                City
                <input
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                />
              </label>
            </div>
          )}

          <label>
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Optional description"
            />
          </label>

          <label>
            Starting tags
            <input
              value={tagsText}
              onChange={(event) =>
                setTagsText(event.target.value)
              }
              placeholder="Leadership, Life Fellowship, North Carolina"
            />

            <small className="entity-wizard-help">
              Separate multiple tags with commas.
              Spaces inside tags are preserved.
            </small>
          </label>
        </section>

        <footer className="entity-wizard-actions">
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary"
          >
            Create {definition.singularLabel}
          </button>
        </footer>
      </form>
    </div>
  )
}
