'use client'
import { useState, useEffect } from 'react'
import styles from './MarkPreset.module.scss'

interface MarkPresetProps {
  markId: string
  markTitle: string
  isNew?: boolean
  isActive?: boolean
  onClick?: () => void
  onDelete?: (id: string) => void
  onTitleChange?: (id: string, newTitle: string) => void
  className?: string
}




export const MarkPreset: React.FC<MarkPresetProps> = ({
  markId,
  className,
  markTitle ,
  isNew = false,
  isActive = false,
  onClick,
  onDelete,
  onTitleChange,
}) => {
  const [title, setTitle] = useState(markTitle)
  const [isEditing, setIsEditing] = useState(isNew)

  // Синхронизация title при изменении markTitle
  useEffect(() => {
    if (!isEditing) {
      setTitle(markTitle)
    }
  }, [markTitle, isEditing])

  const handleDelete = (e: React.MouseEvent) => {
    // остановка всплытия
    e.stopPropagation()
    if (onDelete) {
      onDelete(markId)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    
    if (onTitleChange) {
      onTitleChange(markId, newTitle)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    
    if (title.trim() === '' && onTitleChange) {
      onTitleChange(markId, 'Без названия')
    }
  }

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    
    if (isNew) {
      setIsEditing(true)
    }
  }

  return (
    <div
      className={`${styles.markPreset} ${isActive ? styles.active : ''} ${className || ''}`}
      onClick={handleClick}
    >
      <div className={styles.buttonWrapper}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Введите название метки"
          className={styles.input}
          autoFocus={isNew}
          readOnly
        />
        <div className={styles.deleteButton} onClick={handleDelete}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svg}
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      {isNew && <span className={styles.newBadge}></span>}
    </div>
  )
}