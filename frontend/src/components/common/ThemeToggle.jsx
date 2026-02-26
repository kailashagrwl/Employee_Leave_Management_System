import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
                setDark(true);
            }
        } catch (e) { }
    }, []);

    const toggle = () => {
        try {
            if (dark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                setDark(false);
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                setDark(true);
            }
        } catch (e) { }
    };

    return (
        <button onClick={toggle} title="Toggle theme" className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-emerald-600 dark:bg-[#0b1520] dark:border-gray-700 dark:text-emerald-300">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
