'use client';

import { useEffect, useState } from 'react';

import { Sun, Moon } from 'lucide-react';

export default function ToggleThemeButton() {
    const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

    // Detect system preference on first load
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            setTheme(systemTheme);
            
            document.documentElement.classList.toggle('dark', prefersDark);
        }
    }, []);
    
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        setTheme(newTheme);

        localStorage.setItem('theme', newTheme);

        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    if (theme === null) return null; // Don't render button until theme is detected

    return (
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24}/>}
        </button>
    );
}
