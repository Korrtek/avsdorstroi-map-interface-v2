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

  useEffect(() => {
    const loadedMarks = loadMarksFromStorage()
    setMarks(loadedMarks)
    if (loadedMarks.length > 0) {
      setActiveMarkId(loadedMarks[0].id)
    }
  }, [])

  const activeMark = marks.find((mark) => mark.id === activeMarkId) || null

  const mapMarkers = marks.map(mark => ({
    id: mark.id,
    position: [mark.latitude, mark.longitude] as [number, number],
    title: mark.title || mark.name || 'Без названия'
  }))

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

    const updatedMarks = [...marks, newMark]
    setMarks(updatedMarks)
    setActiveMarkId(newMarkId)
    saveMarksToStorage(updatedMarks)
  }

  const handleUpdateMark = (id: string, data: Partial<MarkData>) => {
    const updatedMarks = marks.map((mark) => {
      if (mark.id === id) {
        const updatedMark = { ...mark, ...data }
        // Если меняем координаты и нет названия, создаем дефолтное
        if (data.latitude !== undefined || data.longitude !== undefined) {
          if (!updatedMark.name && !updatedMark.title) {
            updatedMark.title = `Метка ${id.slice(-4)}`
          }
        }
        return updatedMark
      }
      return mark
    })
    
    setMarks(updatedMarks)
    saveMarksToStorage(updatedMarks)
  }

  const handleDeleteMark = (id: string) => {
    const newMarks = marks.filter((mark) => mark.id !== id)
    setMarks(newMarks)
    saveMarksToStorage(newMarks)

    if (activeMarkId === id) {
      setActiveMarkId(newMarks.length > 0 ? newMarks[0].id : null)
    }
  }

  const handleMarkTitleChange = (id: string, newTitle: string) => {
    const updatedMarks = marks.map((mark) => {
      if (mark.id === id) {
        return {
          ...mark,
          title: newTitle,
          name: newTitle,
        }
      }
      return mark
    })
    
    setMarks(updatedMarks)
    saveMarksToStorage(updatedMarks)
  }

  // ОСНОВНОЙ ИСПРАВЛЕННЫЙ ОБРАБОТЧИК СОХРАНЕНИЯ
  const handleSaveMark = (formData: MarkFormData) => {
    if (activeMarkId) {
      // Преобразуем данные формы в формат MarkData
      const updatedMarkData: Partial<MarkData> = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        email: formData.email,
        phone: formData.phone,
        workingHours: formData.workingHours,
        companyName: formData.companyName,
      }

      // Обновляем метку в состоянии
      const updatedMarks = marks.map((mark) => {
        if (mark.id === activeMarkId) {
          const updatedMark = { 
            ...mark, 
            ...updatedMarkData,
            // Обновляем title если меняется name и title совпадает с name
            title: formData.name || mark.title || `Метка ${activeMarkId.slice(-4)}`
          }
          return updatedMark
        }
        return mark
      })

      setMarks(updatedMarks)
      saveMarksToStorage(updatedMarks)

      console.log('Сохранена метка:', {
        id: activeMarkId,
        ...updatedMarkData
      })
    }
  }

  const handleLocationChange = (lat: number, lng: number) => {
    if (activeMarkId) {
      handleUpdateMark(activeMarkId, {
        latitude: lat,
        longitude: lng,
      })
    }
  }

  const handleMarkerClick = (markerId: string) => {
    setActiveMarkId(markerId)
  }

  const handleClearAllMarks = () => {
    const isConfirmed = window.confirm('Удалить все метки?')
    if (!isConfirmed) return
    
    setMarks([])
    setActiveMarkId(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div>
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
              id: activeMark.id,
              name: activeMark.name,
              latitude: activeMark.latitude,
              longitude: activeMark.longitude,
              email: activeMark.email,
              phone: activeMark.phone,
              workingHours: activeMark.workingHours,
              companyName: activeMark.companyName,
            }}
            markers={mapMarkers}
            activeMarkerId={activeMarkId}
            onSave={handleSaveMark}
            onLocationChange={handleLocationChange}
            onMarkerClick={handleMarkerClick}
          />
        )}

        {marks.length === 0 && (
          <div className={styles.emptyState}>
            <p>Нет сохраненных меток. Создайте первую метку</p>
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
