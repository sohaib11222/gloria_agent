import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-md border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => {
  // Check if className contains a background color class
  const classNameStr = typeof className === 'string' ? className : '';
  const hasCustomBg = /bg-\w+/.test(classNameStr);
  
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-200 rounded-t-md',
        !hasCustomBg && 'bg-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardTitle: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <p
      className={cn('text-sm text-gray-600 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}
