'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './MapComponent.module.scss'


//  Пути к иконкам через опции иконки взяты с CDN самой библы
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapComponentProps {
  markerPosition: [number, number]
  onMapClick: (lat: number, lng: number) => void
  zoom?: number
  className?: string
}

export const MapComponent: React.FC<MapComponentProps> = ({
  markerPosition,
  onMapClick,
  zoom = 13,
}) =>  {
    // ссылки на Dom элементы
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Создание карты при монтировании компонента
    if (!mapContainerRef.current || mapRef.current) return
    mapRef.current = L.map(mapContainerRef.current).setView(
      markerPosition,
      zoom,
    )
    // Использую стандартную карту
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current)
    
    markerRef.current = L.marker(markerPosition)
      .addTo(mapRef.current)
      

    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(markerPosition)
    }

    if (mapRef.current) {
      mapRef.current.setView(markerPosition)
    }
  }, [markerPosition])

  return <div ref={mapContainerRef} className={styles.map} />
}

export default MapComponent