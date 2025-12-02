'use client'
import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/Container/Container'
import { SearchInput } from '../SearchInput/SearchInput' 
import { CreateMarkButton } from '../CreateMarkButton/CreateMarkButton' 
import { MarkPreset } from '../MarkPreset/MarkPreset' 
import styles from './MarkManager.module.scss'

interface Props {
  className?: string
  placeholder?: string
  marks: Array<{
    id: string
    title: string
    isNew?: boolean
  }>
  activeMarkId: string | null
  onMarkClick: (id: string) => void
  onCreateMark: () => void
  onDeleteMark: (id: string) => void
  onMarkTitleChange?: (id: string, newTitle: string) => void
}

export const MarkManager: React.FC<Props> = ({
  className,
  placeholder = 'Поиск по названию',
  marks,
  activeMarkId,
  onMarkClick,
  onCreateMark,
  onDeleteMark,
  onMarkTitleChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMarks, setFilteredMarks] = useState(marks)

  // Фильтрация меток при изменении поискового запроса или marks
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMarks(marks)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = marks.filter(
      (mark) =>
        mark.title.toLowerCase().includes(query) ||
        mark.id.toLowerCase().includes(query),
    )

    setFilteredMarks(filtered)
  }, [searchQuery, marks])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  // Если есть поисковый запрос и нет результатов
  const noResults = searchQuery.trim() !== '' && filteredMarks.length === 0

  return (
    <Container>
      <div className={`${styles.markManager} ${className || ''}`}>
        {/* Передаем обработчик поиска */}
        <SearchInput
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <CreateMarkButton onClick={onCreateMark} />

        {/* Сообщение, если нет результатов поиска */}
        {noResults && (
          <div className={styles.noResults}>
            <p>Не найдена метка по запросу: "{searchQuery}"</p>
          </div>
        )}
        <div className={styles.markPresetWrapper}>
          {/* Рендерим отфильтрованный список пресетов */}
          {filteredMarks.map((mark) => (
            <MarkPreset
              key={mark.id}
              markId={mark.id}
              markTitle={mark.title}
              isNew={mark.isNew}
              isActive={mark.id === activeMarkId}
              onClick={() => onMarkClick(mark.id)}
              onDelete={onDeleteMark}
              onTitleChange={onMarkTitleChange}
            />
          ))}
        </div>
      </div>
    </Container>
  )
}