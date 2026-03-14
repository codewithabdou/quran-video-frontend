import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Button } from './ui/button';
import { LogIn } from 'lucide-react';

const LoginButton = ({ onClick, className }) => {
    const { t } = useThemeLanguage();

    return (
        <Button
            onClick={onClick}
            variant="outline"
            className={`rounded-full gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300 ${className}`}
        >
            <LogIn className="w-4 h-4" />
            {t('loginWithGoogle')}
        </Button>
    );
};

export default LoginButton;
