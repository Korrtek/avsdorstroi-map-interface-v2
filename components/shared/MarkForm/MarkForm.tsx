'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import styles from './MarkForm.module.scss'
import { Input } from '@/components/ui'
import { Container } from '@/components/ui'
import { Button } from '@/components/ui'
import { MarkFormData } from '../types/FormData'
import dynamic from 'next/dynamic'
// Библиотеке leaflet требуется доступ к глобальному объекту window, 
// поэтому отключили рендер на сервере
const MapComponent = dynamic(() => import('../MapComponent/MapComponent'), {
  ssr: false, // Отключаю рендеринг на сервере
})

// Интерфейс пропсов компонента
interface InitialMarkFormData {
  initialData?: { // Начальные данные формы
    name: string
    latitude: number
    longitude: number
    email: string
    phone: string
    workingHours: string
    companyName: string
  }
  onSave?: (data: MarkFormData) => void // Колбэк при сохранении
  onLocationChange?: (lat: number, lng: number) => void // Колбэк при изменении местоположения
}

// Экспорт компонента формы маркера
export const MarkForm: React.FC<InitialMarkFormData> = ({
  initialData = { // Значения по умолчанию для начальных данных
    name: '',
    latitude: 58.002407, // Координаты по умолчанию (Пермь)
    longitude: 56.260992,
    email: '',
    phone: '',
    workingHours: '',
    companyName: '',
  },
  onLocationChange, // Колбэк изменения локации
  onSave, // Колбэк сохранения
}) => {
  // Мемоизация начальных данных формы, не дописал функционал мемоизации, доделать позже
  const initialFormData = useMemo(
    () => ({
      name: initialData.name,
      latitude: initialData.latitude.toString(), // Преобразование числа в строку
      longitude: initialData.longitude.toString(),
      email: initialData.email,
      phone: initialData.phone,
      workingHours: initialData.workingHours,
      companyName: initialData.companyName,
    }),
    [initialData], // Зависимость от initialData
  )

  // Состояние данных формы
  const [formData, setFormData] = useState<MarkFormData>(initialFormData)
  
  // Состояние позиции маркера на карте [широта, долгота]
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    initialData.latitude,
    initialData.longitude,
  ])
  
  // Состояние наличия несохраненных изменений
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Эффект для сброса формы при изменении initialData
  useEffect(() => {
    setFormData(initialFormData) // Обновление данных формы
    setMarkerPosition([initialData.latitude, initialData.longitude]) // Обновление позиции маркера
    setHasUnsavedChanges(false) // Сброс флага изменений
  }, [initialFormData, initialData.latitude, initialData.longitude]) // Зависимости

  // Эффект для проверки изменений формы
  useEffect(() => {
    const changesExist =
      JSON.stringify(initialFormData) !== JSON.stringify(formData) // Сравнение объектов через JSON
    setHasUnsavedChanges(changesExist) // Установка флага изменений
  }, [formData, initialFormData]) // Зависимости

  // Обработчик изменения полей ввода
  const handleInputChange = useCallback(
    (field: keyof MarkFormData, value: string) => {
      const newFormData = {
        ...formData, // Копия текущих данных
        [field]: value, // Обновление конкретного поля
      }
      setFormData(newFormData) // Обновление состояния

      // Если изменены координаты, обновляем маркер
      if (field === 'latitude' || field === 'longitude') {
        const lat =
          field === 'latitude'
            ? parseFloat(value) // Преобразуем строку в число
            : parseFloat(newFormData.latitude)
        const lng =
          field === 'longitude'
            ? parseFloat(value)
            : parseFloat(newFormData.longitude)

        // Проверка на валидность чисел
        if (!isNaN(lat) && !isNaN(lng)) {
          setMarkerPosition([lat, lng]) // Обновление позиции маркера
          onLocationChange?.(lat, lng) // Вызов колбэка если передан
        }
      }
    },
    [formData, onLocationChange], // Зависимости
  )

  // Обработчик клика по карте
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6), // Округление до 6 знаков после запятой
        longitude: lng.toFixed(6),
      }))
      setMarkerPosition([lat, lng]) // Обновление позиции маркера
      onLocationChange?.(lat, lng) // Вызов колбэка
    },
    [onLocationChange], // Зависимости
  )

  // Валидация координат
  const validateCoordinates = () => {
    const lat = parseFloat(formData.latitude) // Преобразование в число
    const lng = parseFloat(formData.longitude)

    const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90 // Проверка диапазона широты
    const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180 // Проверка диапазона долготы

    return isValidLat && isValidLng // Возврат результата проверки
  }

//Валидация Email
const validateEmail = (email: string): boolean => {
  if (email === '') return true // Пустое поле допустимо
  
  // Поддержка латинских и русских букв
  const emailRegex = /^[a-zA-Zа-яА-Я0-9._%+-]+@[a-zA-Zа-яА-Я0-9.-]+\.[a-zA-Zа-яА-Я]{2,}$/
  return emailRegex.test(email)
}

// Валидация номера телефона, никогда не писал регулярки, взято с инета
const validatePhone = (phone: string): boolean => {
  if (phone === '') return true // Пустое поле допустимо
  return /^\+\d{11}$/.test(phone)
}

  // Обработчик "отправки" формы
  const handleSubmit = () => {
  const isEmailValid = validateEmail(formData.email || '')
  const isPhoneValid = validatePhone(formData.phone || '')
  const isCoordsValid = validateCoordinates()
  
  if (isCoordsValid && isEmailValid && isPhoneValid && onSave) {
    onSave(formData)
    setHasUnsavedChanges(false)
  }
}

  const isValidCoords = validateCoordinates() // Вычисление валидности координат

  return (
    <Container> {/* Контейнер для содержимого */}
      <div className={styles.markForm }> {/* Основной контейнер формы */}
        <div className={styles.markFormWrapper}> {/* Обертка для flex-расположения */}
          <div className={styles.markColumn}> {/* Колонка с полями формы */}
            <div className={styles.title}>Настройка Метки</div> {/* Заголовок */}
            
            {/* Поле ввода названия */}
            <Input
              placeholder="Курьер №1"
              value={formData.name}
              label="Название"
              onChange={(e) => handleInputChange('name', e.target.value)}
            />

            {/* Секция координат */}
            <div className={styles.coordinateSection}>
              <div className={styles.coordinateRow}> {/* Строка для двух полей координат */}
                <div className={styles.coordinateInput}> {/* Контейнер для поля широты */}
                  <Input
                    placeholder="58.002407"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange('latitude', e.target.value)
                    }
                    error={ // Отображение ошибки при невалидных данных
                      !isValidCoords && formData.latitude !== ''
                        ? 'От -90 до 90'
                        : undefined
                    }
                    label="Широта"
                    
                  />
                </div>
                <div className={styles.coordinateInput}> {/* Контейнер для поля долготы */}
                  <Input
                    placeholder="56.260992"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange('longitude', e.target.value)
                    }
                    error={ // Отображение ошибки при невалидных данных
                      !isValidCoords && formData.longitude !== ''
                        ? 'От -180 до 180'
                        : undefined
                    }
                    label="Долгота"
                  />
                </div>
              </div>
            </div>

            {/* Поле ввода email */}
            <Input
              placeholder="mail@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              type="email"
              label="Email"
              // Добавляем параметр для отображения ошибки, если компонент Input его поддерживает
              error={formData.email && !validateEmail(formData.email) ? "Некорректный email" : undefined}
            />

            {/* Поле ввода телефона */}
            <Input
              placeholder="Телефон +7(800)5553535"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              type="tel" // Указание типа для мобильных устройств
              label="Телефон"
              error={formData.phone && !validatePhone(formData.phone) ? "Некорректный номер" : undefined}
            />

            {/* Поле ввода часов работы */}
            <Input
              placeholder="Пн-пт, 9:00 - 19:00"
              value={formData.workingHours}
              onChange={(e) =>handleInputChange('workingHours', e.target.value)
              }
              label="Часы работы"
            />

            {/* Поле ввода названия компании */}
            <Input
              placeholder="ООО Название компании"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              label="Название Компании"
            />

            {/* Футер формы с кнопкой и сообщениями */}
            <div className={styles.formFooter}>
              {/* Кнопка сохранения */}
              <Button
                
                disabled={!isValidCoords || !hasUnsavedChanges} // Блокировка при невалидных данных или отсутствии изменений
                onClick={handleSubmit}
                className={styles.saveButton}
              >
                Сохранить Метку
              </Button>

              {/* Сообщение о сохраненных изменениях */}
              {!hasUnsavedChanges && isValidCoords && (
                <div className={styles.savedMessage}>
                  Все изменения сохранены
                </div>
              )}

              {/* Индикатор несохраненных изменений */}
              {hasUnsavedChanges && (
                <div className={styles.unsavedIndicator}>
                  Есть несохраненные изменения
                </div>
              )}
            </div>
          </div>

          {/* Колонка с картой */}
          <div className={styles.mapWrapper}>
            <div className={styles.mapContainer}>
              {/* Динамически загружаемый компонент карты */}
              <MapComponent
                markerPosition={markerPosition} // Позиция маркера
                onMapClick={handleMapClick} // Обработчик клика по карте
                zoom={15} // Уровень приближения
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
