import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIPreferencesContextType {
    isHighZoomEnabled: boolean;
    toggleHighZoom: () => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextType | undefined>(undefined);

export const UIPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Persist preference in localStorage
    const [isHighZoomEnabled, setIsHighZoomEnabled] = useState(() => {
        const saved = localStorage.getItem('isHighZoomEnabled');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('isHighZoomEnabled', isHighZoomEnabled.toString());
    }, [isHighZoomEnabled]);

    const toggleHighZoom = () => {
        setIsHighZoomEnabled(prev => !prev);
    };

    return (
        <UIPreferencesContext.Provider value={{ isHighZoomEnabled, toggleHighZoom }}>
            {children}
        </UIPreferencesContext.Provider>
    );
};

export const useUIPreferences = () => {
    const context = useContext(UIPreferencesContext);
    if (context === undefined) {
        throw new Error('useUIPreferences must be used within a UIPreferencesProvider');
    }
    return context;
};
