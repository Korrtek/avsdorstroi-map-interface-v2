'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import styles from './MarkForm.module.scss'
import { Input } from '@/components/ui/Input/Input'
import { Container } from '@/components/ui/Container/Container'
import { Button } from '@/components/ui/Button/Button'
import dynamic from 'next/dynamic'

// библиотеке leaflet к глобальному обьекту window, поэтому отключили рендер на сервере 
const MapComponent = dynamic(() => import('../MapComponent/MapComponent'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Загрузка карты...</div>,
})

interface Props {
  className?: string
  initialData?: {
    name: string
    latitude: number
    longitude: number
    email: string
    phone: string
    workingHours: string
    companyName: string
  }
  onSave?: (data: FormData) => void
  onLocationChange?: (lat: number, lng: number) => void
}

interface FormData {
  name: string
  latitude: string
  longitude: string
  email: string
  phone: string
  workingHours: string
  companyName: string
}

export const MarkForm: React.FC<Props> = ({
  className,
  initialData = {
    name: '',
    latitude: 58.002407,
    longitude: 56.260992,
    email: '',
    phone: '',
    workingHours: '',
    companyName: '',
  },
  onLocationChange,
  onSave,
}) => {
  const initialFormData = useMemo(
    () => ({
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

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    initialData.latitude,
    initialData.longitude,
  ])
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Сброс формы при смене initialData
  useEffect(() => {
    setFormData(initialFormData)
    setMarkerPosition([initialData.latitude, initialData.longitude])
    setHasUnsavedChanges(false)
  }, [initialFormData, initialData.latitude, initialData.longitude])

  // Проверка изменений
  useEffect(() => {
    const changesExist =
      JSON.stringify(initialFormData) !== JSON.stringify(formData)
    setHasUnsavedChanges(changesExist)
  }, [formData, initialFormData])

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
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
          setMarkerPosition([lat, lng])
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
      setMarkerPosition([lat, lng])
      onLocationChange?.(lat, lng)
    },
    [onLocationChange],
  )

  const validateCoordinates = () => {
    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)

    const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90
    const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180

    return isValidLat && isValidLng
  }

  const handleSubmit = () => {
    if (validateCoordinates() && onSave) {
      onSave(formData)
      // После сохранения сбрасываем флаг изменений
      setHasUnsavedChanges(false)
    }
  }

  const isValidCoords = validateCoordinates()

  return (
    <Container>
      <div className={`${styles.markForm} ${className || ''}`}>
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
            />

            <Input
              placeholder="Телефон +7(800)5553535"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              type="tel"
              label="Телефон"
            />

            <Input
              placeholder="Пн-пт, 9:00 - 19:00"
              value={formData.workingHours}
              onChange={(e) =>handleInputChange('workingHours', e.target.value)
              }
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
                variant="primary"
                disabled={!isValidCoords || !hasUnsavedChanges}
                onClick={handleSubmit}
                className={styles.saveButton}
              >
                Сохранить Метку
              </Button>

              {!isValidCoords && (
                <div className={styles.errorMessage}>
                  Исправьте координаты для сохранения
                </div>
              )}

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
                markerPosition={markerPosition}
                onMapClick={handleMapClick}
                zoom={15}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
