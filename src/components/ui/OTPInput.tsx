import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  className?: string
}

export const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 4, 
  onComplete, 
  className 
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      onComplete(otp.join(''))
    }
  }, [otp, onComplete])

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return

    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={cn('flex gap-2', className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors'
          )}
        />
      ))}
    </div>
  )
}
