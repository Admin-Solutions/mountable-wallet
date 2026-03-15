import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { WalletConfigProvider } from './context/WalletConfigContext'
import { WalletPage } from './components/WalletPage'

/**
 * Self-contained wallet overlay — no framer-motion in this shell.
 * CSS handles slide-up / fade so there's no React instance conflict
 * when mounted alongside a host app that also bundles framer-motion.
 */

export function MountableWallet({ config, onClose }) {
  const [visible, setVisible] = useState(false)
  const sheetRef = useRef(null)
  const dragStartY = useRef(null)
  const dragCurrentY = useRef(0)

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Lock body scroll while open
  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

  // Notify host (style guard integration)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mw:open'))
    return () => window.dispatchEvent(new CustomEvent('mw:close'))
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 350)
  }

  // ── Drag-to-dismiss (touch + mouse) ──────────────────────────────────────
  const handlePointerDown = (e) => {
    // Only drag from the handle area (first 48px of sheet)
    const rect = sheetRef.current?.getBoundingClientRect()
    if (!rect) return
    const offsetFromTop = e.clientY - rect.top
    if (offsetFromTop > 48) return

    dragStartY.current = e.clientY
    dragCurrentY.current = 0

    const onMove = (ev) => {
      const dy = Math.max(0, ev.clientY - dragStartY.current)
      dragCurrentY.current = dy
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'none'
        sheetRef.current.style.transform = `translateY(${dy}px)`
      }
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      if (dragCurrentY.current > 80) {
        close()
      } else {
        if (sheetRef.current) {
          sheetRef.current.style.transition = ''
          sheetRef.current.style.transform = ''
        }
      }
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  // Intercept wheel on horizontal scroll containers
  const handleWheel = (e) => {
    let el = e.target
    while (el) {
      const style = window.getComputedStyle(el)
      const ox = style.overflowX
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += e.deltaY
        return
      }
      el = el.parentElement
    }
  }

  return (
    <WalletConfigProvider config={config}>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
        className="mw-wallet-root"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 70,
          height: 'calc(100dvh - var(--sai-top, 0px) - 1rem)',
          borderRadius: '1.5rem 1.5rem 0 0',
          display: 'flex',
          flexDirection: 'column',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0, cursor: 'grab' }}>
          <div style={{ width: 48, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 8px', flexShrink: 0 }}>
          <button
            onClick={close}
            style={{ padding: 8, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X style={{ width: 20, height: 20, opacity: 0.5 }} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <WalletPage />
        </div>
      </div>
    </WalletConfigProvider>
  )
}

export default MountableWallet
