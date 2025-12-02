'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from './SearchInput.module.scss'

interface Props {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  delay?: number // Задержка для дебаунса (мс)
}

export const SearchInput: React.FC<Props> = ({
  placeholder,
  className,
  value = '',
  onChange,
  onSearch,
  delay = 300,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  // Синхронизация с внешним значением
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timer])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Немедленно вызываем onChange для отзывчивости
    if (onChange) {
      onChange(newValue)
    }

    // Дебаунс для onSearch
    if (onSearch) {
      if (timer) clearTimeout(timer)

      const newTimer = setTimeout(() => {
        onSearch(newValue)
      }, delay)

      setTimer(newTimer)
    }
  }


  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchIcon}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <input
        className={styles.input}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        
      />
    </div>
  )
}