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
      className="mw-flex mw-gap-2 mw-overflow-x-auto mw-scrollbar-hide mw-py-2 mw-px-1 -mw-mx-1"
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
              mw-relative mw-px-4 mw-py-2 mw-rounded-full mw-whitespace-nowrap mw-text-sm mw-font-medium
              mw-transition-colors mw-flex-shrink-0
              ${isSelected
                ? 'mw-bg-wallet-accent mw-text-white'
                : 'mw-bg-wallet-bg-tertiary/50 mw-text-wallet-text-secondary hover:mw-text-wallet-text hover:mw-bg-wallet-bg-tertiary'
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="mw-period-highlight"
                className="mw-absolute mw-inset-0 mw-bg-wallet-accent mw-rounded-full"
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
