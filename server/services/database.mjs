import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const dataDirectory = resolve(currentDirectory, '../data')
const databasePath = resolve(dataDirectory, 'nexus.sqlite')

mkdirSync(dataDirectory, {
  recursive: true,
})

export const database = new DatabaseSync(databasePath, {
  enableForeignKeyConstraints: true,
  timeout: 5000,
})

database.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;
`)

const getProjectStatement = database.prepare(`
  SELECT
    id,
    name,
    data_json,
    created_at,
    updated_at
  FROM projects
  WHERE id = ?
`)

const listProjectsStatement = database.prepare(`
  SELECT
    id,
    name,
    created_at,
    updated_at
  FROM projects
  ORDER BY updated_at DESC
`)

const saveProjectStatement = database.prepare(`
  INSERT INTO projects (
    id,
    name,
    data_json,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    data_json = excluded.data_json,
    updated_at = excluded.updated_at
`)

const deleteProjectStatement = database.prepare(`
  DELETE FROM projects
  WHERE id = ?
`)

function parseProjectRow(row) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    project: JSON.parse(row.data_json),
  }
}

export function listProjects() {
  return listProjectsStatement.all().map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export function getProject(id) {
  return parseProjectRow(getProjectStatement.get(id))
}

export function saveProject({
  id,
  name,
  project,
}) {
  const existing = getProjectStatement.get(id)
  const now = new Date().toISOString()
  const createdAt = existing?.created_at ?? now

  saveProjectStatement.run(
    id,
    name,
    JSON.stringify(project),
    createdAt,
    now,
  )

  return getProject(id)
}

export function deleteProject(id) {
  const result = deleteProjectStatement.run(id)

  return result.changes > 0
}

export function getDatabasePath() {
  return databasePath
}
