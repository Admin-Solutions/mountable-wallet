import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export function DateRangePicker({ options = [], selected, onChange }) {
  const scrollRef = useRef(null)
  const selectedRef = useRef(null)

  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current
      const item = selectedRef.current
      const containerWidth = container.offsetWidth
      const itemLeft = item.offsetLeft
      const itemWidth = item.offsetWidth
      container.scrollTo({
        left: itemLeft - (containerWidth / 2) + (itemWidth / 2),
        behavior: 'smooth',
      })
    }
  }, [selected])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto mw-scrollbar-hide py-2 px-1 -mx-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {options.map((option) => {
        const isSelected = option.id === selected
        return (
          <button
            key={option.id}
            ref={isSelected ? selectedRef : null}
            onClick={() => onChange(option.id)}
            className={`
              relative px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium
              transition-colors flex-shrink-0
              ${isSelected
                ? 'bg-wallet-accent text-white'
                : 'bg-wallet-bg-tertiary/50 text-wallet-text-secondary hover:text-wallet-text hover:bg-wallet-bg-tertiary'
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="mw-period-highlight"
                className="absolute inset-0 bg-wallet-accent rounded-full"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default DateRangePicker
