'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import styles from './MarkForm.module.scss'
import { Input } from '@/components/ui'
import { Container } from '@/components/ui'
import { Button } from '@/components/ui'
import { MarkFormData } from '../types/FormData'
import dynamic from 'next/dynamic'

// Динамическая загрузка карты
const MapComponent = dynamic(() => import('../MapComponent/MapComponent'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Загрузка карты...</div>
})

interface MarkFormProps {
  initialData?: {
    id: string
    name: string
    latitude: number
    longitude: number
    email: string
    phone: string
    workingHours: string
    companyName: string
  }
  markers?: Array<{
    id: string
    position: [number, number]
    title?: string
  }>
  activeMarkerId?: string | null
  onSave?: (data: MarkFormData) => void
  onLocationChange?: (lat: number, lng: number) => void
  onMarkerClick?: (markerId: string) => void
}

export const MarkForm: React.FC<MarkFormProps> = ({
  initialData = {
    id: '',
    name: '',
    latitude: 58.002407,
    longitude: 56.260992,
    email: '',
    phone: '',
    workingHours: '',
    companyName: '',
  },
  markers = [],
  activeMarkerId,
  onLocationChange,
  onSave,
  onMarkerClick,
}) => {
  const initialFormData = useMemo(
    () => ({
      id: initialData.id,
      name: initialData.name,
      latitude: initialData.latitude.toString(),
      longitude: initialData.longitude.toString(),
      email: initialData.email,
      phone: initialData.phone,
      workingHours: initialData.workingHours,
      companyName: initialData.companyName,
    }),
    [initialData],
  )

  const [formData, setFormData] = useState<MarkFormData>(initialFormData)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Подготавливаем данные маркеров для карты
  const mapMarkers = useMemo(() => {
    if (!markers.length && initialData.id) {
      // Если нет маркеров, но есть текущая метка, отображаем только ее
      return [{
        id: initialData.id,
        position: [initialData.latitude, initialData.longitude] as [number, number],
        title: initialData.name || 'Текущая метка'
      }]
    }
    
    return markers.map(marker => ({
      ...marker,
      position: marker.position
    }))
  }, [markers, initialData])

  useEffect(() => {
    setFormData(initialFormData)
    setHasUnsavedChanges(false)
  }, [initialFormData])

  useEffect(() => {
    const changesExist =
      JSON.stringify(initialFormData) !== JSON.stringify(formData)
    setHasUnsavedChanges(changesExist)
  }, [formData, initialFormData])

  const handleInputChange = useCallback(
    (field: keyof MarkFormData, value: string) => {
      const newFormData = {
        ...formData,
        [field]: value,
      }
      setFormData(newFormData)

      if (field === 'latitude' || field === 'longitude') {
        const lat =
          field === 'latitude'
            ? parseFloat(value)
            : parseFloat(newFormData.latitude)
        const lng =
          field === 'longitude'
            ? parseFloat(value)
            : parseFloat(newFormData.longitude)

        if (!isNaN(lat) && !isNaN(lng)) {
          onLocationChange?.(lat, lng)
        }
      }
    },
    [formData, onLocationChange],
  )

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }))
      onLocationChange?.(lat, lng)
    },
    [onLocationChange],
  )

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      onMarkerClick?.(markerId)
    },
    [onMarkerClick]
  )

  const validateCoordinates = () => {
    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)

    const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90
    const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180

    return isValidLat && isValidLng
  }

  const validateEmail = (email: string): boolean => {
    if (email === '') return true
    
    const emailRegex = /^[a-zA-Zа-яА-Я0-9._%+-]+@[a-zA-Zа-яА-Я0-9.-]+\.[a-zA-Zа-яА-Я]{2,}$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (phone === '') return true
    return /^\+\d{11}$/.test(phone)
  }

  const handleSubmit = () => {
    const isEmailValid = validateEmail(formData.email || '')
    const isPhoneValid = validatePhone(formData.phone || '')
    const isCoordsValid = validateCoordinates()
    
    if (isCoordsValid && isEmailValid && isPhoneValid && onSave) {
      onSave(formData)
      setHasUnsavedChanges(false)
    }
  }

  const isValidCoords = validateCoordinates()

  return (
    <Container>
      <div className={styles.markForm}>
        <div className={styles.markFormWrapper}>
          <div className={styles.markColumn}>
            <div className={styles.title}>Настройка Метки</div>
            
            <Input
              placeholder="Курьер №1"
              value={formData.name}
              label="Название"
              onChange={(e) => handleInputChange('name', e.target.value)}
            />

            <div className={styles.coordinateSection}>
              <div className={styles.coordinateRow}>
                <div className={styles.coordinateInput}>
                  <Input
                    placeholder="58.002407"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange('latitude', e.target.value)
                    }
                    error={
                      !isValidCoords && formData.latitude !== ''
                        ? 'От -90 до 90'
                        : undefined
                    }
                    label="Широта"
                  />
                </div>
                <div className={styles.coordinateInput}>
                  <Input
                    placeholder="56.260992"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange('longitude', e.target.value)
                    }
                    error={
                      !isValidCoords && formData.longitude !== ''
                        ? 'От -180 до 180'
                        : undefined
                    }
                    label="Долгота"
                  />
                </div>
              </div>
            </div>

            <Input
              placeholder="mail@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              type="email"
              label="Email"
              error={formData.email && !validateEmail(formData.email) ? "Некорректный email" : undefined}
            />

            <Input
              placeholder="Телефон +7(800)5553535"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              type="tel"
              label="Телефон"
              error={formData.phone && !validatePhone(formData.phone) ? "Некорректный номер" : undefined}
            />

            <Input
              placeholder="Пн-пт, 9:00 - 19:00"
              value={formData.workingHours}
              onChange={(e) => handleInputChange('workingHours', e.target.value)}
              label="Часы работы"
            />

            <Input
              placeholder="ООО Название компании"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              label="Название Компании"
            />

            <div className={styles.formFooter}>
              <Button
                disabled={!isValidCoords || !hasUnsavedChanges}
                onClick={handleSubmit}
                className={styles.saveButton}
              >
                Сохранить Метку
              </Button>

              {!hasUnsavedChanges && isValidCoords && (
                <div className={styles.savedMessage}>
                  Все изменения сохранены
                </div>
              )}

              {hasUnsavedChanges && (
                <div className={styles.unsavedIndicator}>
                  Есть несохраненные изменения
                </div>
              )}
            </div>
          </div>

          <div className={styles.mapWrapper}>
            <div className={styles.mapContainer}>
              <MapComponent
                markers={mapMarkers}
                activeMarkerId={activeMarkerId}
                onMapClick={handleMapClick}
                onMarkerClick={handleMarkerClick}
                zoom={15}
              />
            </div>
            <div className={styles.mapHint}>
              Кликните по карте для изменения координат или по метке для выбора
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
