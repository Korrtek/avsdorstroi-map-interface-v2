'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './MapComponent.module.scss'

// Пути к иконкам через опции иконки взяты с CDN самой библы
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Создаем кастомную иконку для активного маркера
const activeIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  className: 'active-marker'
})

const defaultIcon = L.icon({
  iconRetinaUrl: L.Icon.Default.prototype.options.iconRetinaUrl || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: L.Icon.Default.prototype.options.iconUrl || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: L.Icon.Default.prototype.options.shadowUrl || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

interface MapComponentProps {
  markers: Array<{
    id: string
    position: [number, number]
    title?: string
  }>
  activeMarkerId?: string | null // Делаем optional
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (markerId: string) => void
  zoom?: number
  className?: string
}

export const MapComponent: React.FC<MapComponentProps> = ({
  markers,
  activeMarkerId = null, // Добавляем значение по умолчанию
  onMapClick,
  onMarkerClick,
  zoom = 13,
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    
    mapRef.current = L.map(mapContainerRef.current)
    
    // Центрируем карту по первой метке или используем дефолтные координаты
    if (markers.length > 0) {
      mapRef.current.setView(markers[0].position, zoom)
    } else {
      mapRef.current.setView([58.002407, 56.260992], zoom)
    }
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current)
    
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current.clear()
      }
    }
  }, [])

  // Обновление маркеров
  useEffect(() => {
    if (!mapRef.current) return

    // Удаляем старые маркеры
    const currentIds = new Set(markers.map(m => m.id))
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Добавляем или обновляем маркеры
    markers.forEach(markerData => {
      const existingMarker = markersRef.current.get(markerData.id)
      
      if (existingMarker) {
        existingMarker.setLatLng(markerData.position)
        
        // Обновляем иконку в зависимости от активности
        if (activeMarkerId === markerData.id) {
          existingMarker.setIcon(activeIcon)
        } else {
          existingMarker.setIcon(defaultIcon)
        }
        
        // Обновляем всплывающее окно
        if (markerData.title) {
          existingMarker.bindPopup(`<b>${markerData.title}</b>`)
        }
      } else {
        const marker = L.marker(markerData.position, {
          icon: activeMarkerId === markerData.id ? activeIcon : defaultIcon
        }).addTo(mapRef.current!)
        
        if (markerData.title) {
          marker.bindPopup(`<b>${markerData.title}</b>`)
        }
        
        // Добавляем обработчик клика по маркеру
        marker.on('click', () => {
          onMarkerClick(markerData.id)
        })
        
        markersRef.current.set(markerData.id, marker)
      }
    })

    // Центрируем карту на активном маркере
    if (activeMarkerId) {
      const activeMarker = markers.find(m => m.id === activeMarkerId)
      if (activeMarker && mapRef.current) {
        mapRef.current.setView(activeMarker.position, zoom)
      }
    }
  }, [markers, activeMarkerId, onMarkerClick, zoom])

  return <div ref={mapContainerRef} className={styles.map} />
}

export default MapComponent