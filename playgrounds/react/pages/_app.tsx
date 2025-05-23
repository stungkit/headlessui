import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import './styles.css'

function disposables() {
  let disposables: Function[] = []

  let api = {
    requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
      let raf = requestAnimationFrame(...args)
      api.add(() => cancelAnimationFrame(raf))
    },

    nextFrame(...args: Parameters<typeof requestAnimationFrame>) {
      api.requestAnimationFrame(() => {
        api.requestAnimationFrame(...args)
      })
    },

    setTimeout(...args: Parameters<typeof setTimeout>) {
      let timer = setTimeout(...args)
      api.add(() => clearTimeout(timer))
    },

    add(cb: () => void) {
      disposables.push(cb)
    },

    dispose() {
      for (let dispose of disposables.splice(0)) {
        dispose()
      }
    },
  }

  return api
}

export function useDisposables() {
  // Using useState instead of useRef so that we can use the initializer function.
  let [d] = useState(disposables)
  useEffect(() => () => d.dispose(), [d])
  return d
}

enum KeyDisplayMac {
  ArrowUp = '↑',
  ArrowDown = '↓',
  ArrowLeft = '←',
  ArrowRight = '→',
  Home = '↖',
  End = '↘',
  Alt = '⌥',
  CapsLock = '⇪',
  Meta = '⌘',
  Shift = '⇧',
  Control = '⌃',
  Backspace = '⌫',
  Delete = '⌦',
  Enter = '↵',
  Escape = '⎋',
  Tab = '↹',
  PageUp = '⇞',
  PageDown = '⇟',
  ' ' = '␣',
}

enum KeyDisplayWindows {
  ArrowUp = '↑',
  ArrowDown = '↓',
  ArrowLeft = '←',
  ArrowRight = '→',
  Meta = 'Win',
  Control = 'Ctrl',
  Backspace = '⌫',
  Delete = 'Del',
  Escape = 'Esc',
  PageUp = 'PgUp',
  PageDown = 'PgDn',
  ' ' = '␣',
}

function tap<T>(value: T, cb: (value: T) => void) {
  cb(value)
  return value
}

function useKeyDisplay() {
  let [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return {}
  let isMac = navigator.userAgent.indexOf('Mac OS X') !== -1
  return isMac ? KeyDisplayMac : KeyDisplayWindows
}

function KeyCaster() {
  let [keys, setKeys] = useState<string[]>([])
  let d = useDisposables()
  let KeyDisplay = useKeyDisplay()

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      setKeys((current) => [
        event.shiftKey && event.key !== 'Shift'
          ? KeyDisplay[`Shift${event.key}`] ?? event.key
          : KeyDisplay[event.key] ?? event.key,
        ...current,
      ])
      d.setTimeout(() => setKeys((current) => tap(current.slice(), (clone) => clone.pop())), 2000)
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [d, KeyDisplay])

  if (keys.length <= 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 cursor-default select-none overflow-hidden rounded-md bg-blue-800 px-4 py-2 text-2xl tracking-wide text-blue-100 shadow-sm">
      {keys.slice().reverse().join(' ')}
    </div>
  )
}

function MyApp({ Component, pageProps }) {
  let router = useRouter()
  if (router.query.raw !== undefined) {
    return <Component {...pageProps} />
  }

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-gray-700 font-sans text-gray-900 antialiased">
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-700 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo className="h-6" />
          </Link>
          <span className="font-bold text-white">(React)</span>
        </header>

        <KeyCaster />

        <main className="flex-1 overflow-auto bg-gray-50">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  )
}

function Logo({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 243 42">
      <path
        fill="#fff"
        d="M65.74 13.663c-2.62 0-4.702.958-5.974 2.95V6.499h-4.163V33.32h4.163V23.051c0-3.908 2.159-5.518 4.896-5.518 2.62 0 4.317 1.533 4.317 4.445V33.32h4.162V21.557c0-4.982-3.083-7.894-7.4-7.894zM79.936 25.503h15.341c.077-.536.154-1.15.154-1.724 0-5.518-3.931-10.116-9.674-10.116-6.052 0-10.176 4.407-10.176 10.078 0 5.748 4.124 10.078 10.484 10.078 3.778 0 6.668-1.572 8.441-4.177l-3.43-1.993c-.925 1.341-2.66 2.376-4.972 2.376-3.084 0-5.512-1.533-6.168-4.521zm-.038-3.372c.578-2.873 2.698-4.713 5.82-4.713 2.506 0 4.934 1.418 5.512 4.713H79.898zM113.282 14.161v2.72c-1.465-1.992-3.739-3.218-6.746-3.218-5.242 0-9.597 4.368-9.597 10.078 0 5.67 4.355 10.078 9.597 10.078 3.007 0 5.281-1.227 6.746-3.258v2.76h4.162V14.16h-4.162zm-6.09 15.71c-3.469 0-6.091-2.567-6.091-6.13 0-3.564 2.622-6.131 6.091-6.131 3.469 0 6.09 2.567 6.09 6.13 0 3.564-2.621 6.132-6.09 6.132zM136.597 6.498v10.384c-1.465-1.993-3.739-3.219-6.746-3.219-5.242 0-9.597 4.368-9.597 10.078 0 5.67 4.355 10.078 9.597 10.078 3.007 0 5.281-1.227 6.746-3.258v2.76h4.163V6.497h-4.163zm-6.09 23.374c-3.469 0-6.09-2.568-6.09-6.131 0-3.564 2.621-6.131 6.09-6.131s6.09 2.567 6.09 6.13c0 3.564-2.621 6.132-6.09 6.132zM144.648 33.32h4.163V5.348h-4.163V33.32zM155.957 25.503h15.341c.077-.536.154-1.15.154-1.724 0-5.518-3.931-10.116-9.675-10.116-6.051 0-10.176 4.407-10.176 10.078 0 5.748 4.125 10.078 10.485 10.078 3.777 0 6.668-1.572 8.441-4.177l-3.43-1.993c-.926 1.341-2.66 2.376-4.973 2.376-3.083 0-5.512-1.533-6.167-4.521zm-.038-3.372c.578-2.873 2.698-4.713 5.82-4.713 2.505 0 4.934 1.418 5.512 4.713h-11.332zM177.137 19.45c0-1.38 1.311-2.032 2.814-2.032 1.581 0 2.93.69 3.623 2.184l3.508-1.954c-1.349-2.529-3.97-3.985-7.131-3.985-3.931 0-7.053 2.26-7.053 5.863 0 6.859 10.368 4.943 10.368 8.353 0 1.533-1.426 2.146-3.276 2.146-2.12 0-3.662-1.035-4.279-2.759l-3.584 2.07c1.233 2.758 4.008 4.483 7.863 4.483 4.163 0 7.516-2.07 7.516-5.902 0-7.088-10.369-4.98-10.369-8.468zM192.774 19.45c0-1.38 1.31-2.032 2.813-2.032 1.581 0 2.93.69 3.624 2.184l3.507-1.954c-1.349-2.529-3.97-3.985-7.131-3.985-3.931 0-7.053 2.26-7.053 5.863 0 6.859 10.368 4.943 10.368 8.353 0 1.533-1.426 2.146-3.276 2.146-2.12 0-3.662-1.035-4.278-2.759l-3.585 2.07c1.233 2.758 4.009 4.483 7.863 4.483 4.163 0 7.516-2.07 7.516-5.902 0-7.088-10.368-4.98-10.368-8.468zM224.523 28.9c2.889 0 5.027-1.715 5.027-4.53v-8.782h-2.588v8.577c0 1.268-.676 2.219-2.439 2.219s-2.438-.951-2.438-2.22v-8.576h-2.569v8.782c0 2.815 2.138 4.53 5.007 4.53zM232.257 15.588V28.64h2.588V15.588h-2.588z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M233.817 9.328H220.42c-2.96 0-5.359 2.385-5.359 5.327v13.318c0 2.942 2.399 5.327 5.359 5.327h13.397c2.959 0 5.358-2.385 5.358-5.327V14.655c0-2.942-2.399-5.327-5.358-5.327zM220.42 6.664c-4.439 0-8.038 3.578-8.038 7.99v13.319c0 4.413 3.599 7.99 8.038 7.99h13.397c4.439 0 8.038-3.577 8.038-7.99V14.655c0-4.413-3.599-7.99-8.038-7.99H220.42z"
        clipRule="evenodd"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M220.42 9.328h13.397c2.959 0 5.358 2.385 5.358 5.327v13.318c0 2.942-2.399 5.327-5.358 5.327H220.42c-2.96 0-5.359-2.385-5.359-5.327V14.655c0-2.942 2.399-5.327 5.359-5.327zm-8.038 5.327c0-4.413 3.599-7.99 8.038-7.99h13.397c4.439 0 8.038 3.577 8.038 7.99v13.318c0 4.413-3.599 7.99-8.038 7.99H220.42c-4.439 0-8.038-3.577-8.038-7.99V14.655z"
        clipRule="evenodd"
      />
      <path
        fill="url(#prefix__paint0_linear)"
        d="M8.577 26.097l25.779-8.556c-.514-3.201-.88-5.342-1.307-6.974-.457-1.756-.821-2.226-.965-2.39a5.026 5.026 0 00-1.81-1.306c-.2-.086-.762-.284-2.583-.175-1.924.116-4.453.507-8.455 1.137-4.003.63-6.529 1.035-8.395 1.516-1.766.456-2.239.817-2.403.96a4.999 4.999 0 00-1.315 1.8c-.085.198-.285.757-.175 2.568.116 1.913.51 4.426 1.143 8.405.178 1.114.337 2.113.486 3.015z"
      />
      <path
        fill="url(#prefix__paint1_linear)"
        fillRule="evenodd"
        d="M1.47 24.124C.244 16.427-.37 12.58.96 9.49A11.665 11.665 0 014.027 5.29c2.545-2.21 6.416-2.82 14.16-4.039C25.93.031 29.8-.578 32.907.743a11.729 11.729 0 014.225 3.05c2.223 2.53 2.836 6.38 4.063 14.076 1.226 7.698 1.84 11.546.511 14.636a11.666 11.666 0 01-3.069 4.199c-2.545 2.21-6.416 2.82-14.159 4.039-7.743 1.219-11.614 1.828-14.722.508a11.728 11.728 0 01-4.224-3.05C3.31 35.67 2.697 31.82 1.47 24.123zm13.657 13.668c2.074-.125 4.743-.54 8.697-1.163 3.953-.622 6.62-1.047 8.632-1.566 1.949-.502 2.846-.992 3.426-1.496a7.5 7.5 0 001.973-2.7c.302-.703.494-1.703.372-3.7-.125-2.063-.543-4.716-1.17-8.646-.625-3.93-1.053-6.582-1.574-8.582-.506-1.937-.999-2.83-1.505-3.405a7.54 7.54 0 00-2.716-1.961c-.707-.301-1.713-.492-3.723-.371-2.074.125-4.743.54-8.697 1.163-3.953.622-6.62 1.047-8.632 1.565-1.949.503-2.846.993-3.426 1.497a7.5 7.5 0 00-1.972 2.699c-.303.704-.495 1.704-.373 3.701.125 2.062.543 4.716 1.17 8.646.625 3.93 1.053 6.582 1.574 8.581.506 1.938 1 2.83 1.505 3.406a7.54 7.54 0 002.716 1.961c.707.3 1.713.492 3.723.37z"
        clipRule="evenodd"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear"
          x1="16.759"
          x2="23.386"
          y1="0"
          y2="41.662"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#66E3FF" />
          <stop offset="1" stopColor="#7064F9" />
        </linearGradient>
        <linearGradient
          id="prefix__paint1_linear"
          x1="16.759"
          x2="23.386"
          y1="0"
          y2="41.662"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#66E3FF" />
          <stop offset="1" stopColor="#7064F9" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default MyApp
