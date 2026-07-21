import {
  useCallback,
  useRef,
  useState,
} from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

interface CommitOptions {
  mergeKey?: string
}

interface MergeRecord {
  key: string
  time: number
}

const MAX_HISTORY = 100
const MERGE_WINDOW_MS = 750

export function useHistoryState<T>(
  initialValue: T,
) {
  const [history, setHistory] =
    useState<HistoryState<T>>({
      past: [],
      present: initialValue,
      future: [],
    })

  const lastMergeRef =
    useRef<MergeRecord | null>(null)

  const commit = useCallback(
    (
      updater: T | ((current: T) => T),
      options: CommitOptions = {},
    ) => {
      setHistory((currentHistory) => {
        const nextPresent =
          typeof updater === 'function'
            ? (
                updater as (
                  current: T,
                ) => T
              )(currentHistory.present)
            : updater

        if (
          Object.is(
            nextPresent,
            currentHistory.present,
          )
        ) {
          return currentHistory
        }

        const now = Date.now()
        const lastMerge =
          lastMergeRef.current

        const shouldMerge =
          options.mergeKey &&
          lastMerge?.key ===
            options.mergeKey &&
          now - lastMerge.time <
            MERGE_WINDOW_MS

        lastMergeRef.current =
          options.mergeKey
            ? {
                key: options.mergeKey,
                time: now,
              }
            : null

        if (shouldMerge) {
          return {
            past: currentHistory.past,
            present: nextPresent,
            future: [],
          }
        }

        return {
          past: [
            ...currentHistory.past,
            currentHistory.present,
          ].slice(-MAX_HISTORY),

          present: nextPresent,
          future: [],
        }
      })
    },
    [],
  )

  const replace = useCallback(
    (value: T) => {
      lastMergeRef.current = null

      setHistory({
        past: [],
        present: value,
        future: [],
      })
    },
    [],
  )

  const undo = useCallback(() => {
    lastMergeRef.current = null

    setHistory((currentHistory) => {
      if (
        currentHistory.past.length === 0
      ) {
        return currentHistory
      }

      const previous =
        currentHistory.past[
          currentHistory.past.length - 1
        ]

      return {
        past:
          currentHistory.past.slice(
            0,
            -1,
          ),

        present: previous,

        future: [
          currentHistory.present,
          ...currentHistory.future,
        ],
      }
    })
  }, [])

  const redo = useCallback(() => {
    lastMergeRef.current = null

    setHistory((currentHistory) => {
      if (
        currentHistory.future.length ===
        0
      ) {
        return currentHistory
      }

      const [next, ...remainingFuture] =
        currentHistory.future

      return {
        past: [
          ...currentHistory.past,
          currentHistory.present,
        ].slice(-MAX_HISTORY),

        present: next,

        future: remainingFuture,
      }
    })
  }, [])

  return {
    value: history.present,
    commit,
    replace,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo:
      history.future.length > 0,
  }
}
