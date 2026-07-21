import type {
  CustomField,
  Gender,
  GraphNode,
  NodeType,
} from '../../types/graph'
import { TagInput } from './TagInput'
import './NodeEditor.css'

interface NodeEditorProps {
  node: GraphNode
  onChange: (node: GraphNode) => void
  onDelete: () => void
}

const nodeTypes: NodeType[] = [
  'person',
  'company',
  'church',
  'school',
  'address',
  'event',
  'document',
]

const genders: Gender[] = ['unspecified', 'male', 'female']

export function NodeEditor({
  node,
  onChange,
  onDelete,
}: NodeEditorProps) {
  function update<K extends keyof GraphNode>(
    key: K,
    value: GraphNode[K],
  ) {
    onChange({
      ...node,
      [key]: value,
    })
  }

  function addCustomField() {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      key: '',
      value: '',
    }

    update('customFields', [...node.customFields, newField])
  }

  function updateCustomField(
    fieldId: string,
    changes: Partial<CustomField>,
  ) {
    update(
      'customFields',
      node.customFields.map((field) =>
        field.id === fieldId
          ? { ...field, ...changes }
          : field,
      ),
    )
  }

  function removeCustomField(fieldId: string) {
    update(
      'customFields',
      node.customFields.filter(
        (field) => field.id !== fieldId,
      ),
    )
  }

  return (
    <div className="node-editor">
      <div className="node-editor-profile">
        {node.photoUrl ? (
          <img
            className="node-editor-photo"
            src={node.photoUrl}
            alt=""
          />
        ) : (
          <div
            className={`node-editor-avatar ${node.gender}`}
          >
            {node.label.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div>
          <h3>{node.label || 'Untitled node'}</h3>
          <p>{node.type}</p>
        </div>
      </div>

      <div className="editor-section">
        <label>
          Name
          <input
            value={node.label}
            onChange={(event) =>
              update('label', event.target.value)
            }
          />
        </label>

        <div className="editor-row">
          <label>
            Type
            <select
              value={node.type}
              onChange={(event) =>
                update(
                  'type',
                  event.target.value as NodeType,
                )
              }
            >
              {nodeTypes.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Gender
            <select
              value={node.gender}
              onChange={(event) =>
                update(
                  'gender',
                  event.target.value as Gender,
                )
              }
            >
              {genders.map((gender) => (
                <option value={gender} key={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Description
          <textarea
            value={node.description}
            onChange={(event) =>
              update('description', event.target.value)
            }
            rows={3}
          />
        </label>

        <label>
          Photo URL
          <input
            value={node.photoUrl}
            onChange={(event) =>
              update('photoUrl', event.target.value)
            }
            placeholder="https://example.com/photo.jpg"
          />
        </label>

        <label>
          Address
          <input
            value={node.address}
            onChange={(event) =>
              update('address', event.target.value)
            }
          />
        </label>

        <label>
          City
          <input
            value={node.city}
            onChange={(event) =>
              update('city', event.target.value)
            }
          />
        </label>

        <label>
          Tags

          <TagInput
            tags={node.tags}
            onChange={(tags) =>
              update('tags', tags)
            }
          />
        </label>

        <label>
          Notes
          <textarea
            value={node.notes}
            onChange={(event) =>
              update('notes', event.target.value)
            }
            rows={5}
          />
        </label>
      </div>

      <div className="editor-section">
        <div className="editor-section-heading">
          <h4>Custom fields</h4>

          <button
            type="button"
            onClick={addCustomField}
          >
            ＋ Add
          </button>
        </div>

        {node.customFields.length === 0 ? (
          <p className="editor-empty-message">
            No custom fields yet.
          </p>
        ) : (
          node.customFields.map((field) => (
            <div
              className="custom-field-row"
              key={field.id}
            >
              <input
                value={field.key}
                onChange={(event) =>
                  updateCustomField(field.id, {
                    key: event.target.value,
                  })
                }
                placeholder="Field name"
              />

              <input
                value={field.value}
                onChange={(event) =>
                  updateCustomField(field.id, {
                    value: event.target.value,
                  })
                }
                placeholder="Value"
              />

              <button
                type="button"
                onClick={() =>
                  removeCustomField(field.id)
                }
                aria-label="Remove custom field"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="delete-button"
        onClick={onDelete}
      >
        Delete selected node
      </button>
    </div>
  )
}
