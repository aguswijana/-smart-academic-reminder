'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type ThemeContextType = {
    dark: boolean
    toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    dark: false,
    toggleDark: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('darkMode')
        if (saved === 'true') setDark(true)
    }, [])

    const toggleDark = () => {
        setDark(prev => {
            localStorage.setItem('darkMode', String(!prev))
            return !prev
        })
    }

    return (
        <ThemeContext.Provider value={{ dark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)