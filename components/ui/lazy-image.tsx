"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  [key: string]: any // Permitir otros props
}

export default function LazyImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  ...rest
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '')
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      setCurrentSrc(src)
      return
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setCurrentSrc(src)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (observer && observer.disconnect) observer.disconnect()
    }
  }, [src, priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else {
      onError?.()
    }
  }

  const imageProps = {
    src: hasError ? fallbackSrc : currentSrc,
    alt,
    className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
    onLoad: handleLoad,
    onError: handleError,
    sizes,
    ...rest,
    ...(fill ? { fill } : { width, height })
  }

  // Estilos inline para el skeleton si no es fill
  const skeletonStyle = fill
    ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }
    : { width: width || 100, height: height || 100, display: 'block' }

  return (
    <div
      ref={imgRef}
      className={`relative${fill ? ' w-full h-full' : ''}`}
      role="img"
      aria-label={alt}
    >
      {!isLoaded && isInView && (
        <Skeleton style={skeletonStyle as React.CSSProperties} />
      )}
      {isInView && (
        <Image
          {...imageProps}
          priority={priority}
        />
      )}
      {!isInView && !priority && (
        <Skeleton style={skeletonStyle as React.CSSProperties} />
      )}
    </div>
  )
} 