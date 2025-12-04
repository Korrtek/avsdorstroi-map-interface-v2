'use client'
import styles from './page.module.scss'
import { MarkManager } from '@/components/shared'
import { MarkForm } from '@/components/shared'
import { useState, useEffect } from 'react'
import { MarkFormData } from '@/components/shared/types/FormData'

interface MarkData {
  id: string
  title: string
  name: string
  latitude: number
  longitude: number
  email: string
  phone: string
  workingHours: string
  companyName: string
}
// Данные решил хранить в localStorage, без создания бэка
// По этому ключу будет сохраняться форма в localStorage
const STORAGE_KEY = 'map-marks-data'

const loadMarksFromStorage = (): MarkData[] => {
  if (typeof window === 'undefined') return []

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error)
    return []
  }
}

const saveMarksToStorage = (marks: MarkData[]) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marks))
  } catch (error) {
    console.error('Ошибка сохранения в localStorage:', error)
  }
}

export default function Home() {
  
  const [marks, setMarks] = useState<MarkData[]>([])
  const [activeMarkId, setActiveMarkId] = useState<string | null>(null)

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const loadedMarks = loadMarksFromStorage()
    setMarks(loadedMarks)

    if (loadedMarks.length > 0) {
      setActiveMarkId(loadedMarks[0].id)
    }
  }, [])

  // Находим активную метку
  const activeMark = marks.find((mark) => mark.id === activeMarkId) || null

  // Создание новой метки
  const handleCreateMark = () => {
    const newMarkId = Date.now().toString()
    const newMark: MarkData = {
      id: newMarkId,
      title: 'Новая Метка',
      name: '',
      latitude: 58.002407,
      longitude: 56.260992,
      email: '',
      phone: '',
      workingHours: '',
      companyName: '',
    }

    setMarks((prev) => [...prev, newMark])
    setActiveMarkId(newMarkId)
  }

  // Обновление данных метки
  const handleUpdateMark = (id: string, data: Partial<MarkData>) => {
    setMarks((prev) =>
      prev.map((mark) => {
        if (mark.id === id) {
          const updatedMark = { ...mark, ...data }
          return updatedMark
        }
        return mark
      }),
    )
  }

  // Удаление метки
  const handleDeleteMark = (id: string) => {
    setMarks((prev) => {
      const newMarks = prev.filter((mark) => mark.id !== id)
      return newMarks
    })

    setActiveMarkId((prev) => {
      if (prev === id) {
        const remainingMarks = marks.filter((mark) => mark.id !== id)
        return remainingMarks.length > 0 ? remainingMarks[0].id : null
      }
      return prev
    })
  }

  // Обновление названия метки в пресете
  const handleMarkTitleChange = (id: string, newTitle: string) => {
    setMarks((prev) =>
      prev.map((mark) => {
        if (mark.id === id) {
          return {
            ...mark,
            title: newTitle,
            name: newTitle, // Также обновляем поле name для формы
          }
        }
        return mark
      }),
    )
  }


// автосейв координат метки
 useEffect(() => {
    if (marks.length > 0) {
      saveMarksToStorage(marks)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [marks])




  // Сохранение данных из формы по кнопке 
  const handleSaveMark = (formData: MarkFormData) => {
    if (activeMarkId) {
      handleUpdateMark(activeMarkId, {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        email: formData.email,
        phone: formData.phone,
        workingHours: formData.workingHours,
        companyName: formData.companyName,
      })

      // Обновляем title если меняется name
      if (formData.name) {
        handleMarkTitleChange(activeMarkId, formData.name)
      }
    }
  }


  // Очистка всех меток
    const handleClearAllMarks = () => {
    // Запрашиваем подтверждение у пользователя
    const isConfirmed = window.confirm('Удалить все метки?')
    
    if (!isConfirmed) {
      return
    }
    localStorage.removeItem(STORAGE_KEY)
    setMarks([])
    setActiveMarkId(null)
  }

  return (
    <div>
      {/* <Header/> */}
      <div className={styles.page}>
        <MarkManager
          marks={marks.map((mark) => ({
            id: mark.id,
            title: mark.title || mark.name || 'Без названия',
            isNew: !mark.name && mark.title === 'Новая Метка',
          }))}
          activeMarkId={activeMarkId}
          onMarkClick={setActiveMarkId}
          onCreateMark={handleCreateMark}
          onDeleteMark={handleDeleteMark}
          onMarkTitleChange={handleMarkTitleChange} 
          onClearAllMarks={handleClearAllMarks}
        />

        {activeMark && (
          <MarkForm
            key={activeMark.id}
            initialData={{
              name: activeMark.name,
              latitude: activeMark.latitude,
              longitude: activeMark.longitude,
              email: activeMark.email,
              phone: activeMark.phone,
              workingHours: activeMark.workingHours,
              companyName: activeMark.companyName,
              
            }}
            onSave={handleSaveMark}
            
            onLocationChange={(lat, lng) => {
              if (activeMarkId) {
                handleUpdateMark(activeMarkId, {
                  latitude: lat,
                  longitude: lng,
                })
              }
            }}
          />
        )}
      {/* Если нет пресетов рендерится */}
        {marks.length === 0 && (
          <div className={styles.emptyState}>
            <p>Нет сохраненных меток Создайте первую метку</p>
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 12H7M7 12L11 16M7 12L11 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
