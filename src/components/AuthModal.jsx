import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Video, ShieldCheck, LogIn } from 'lucide-react';

const AuthModal = ({ isOpen, onOpenChange }) => {
    const { t, dir } = useThemeLanguage();
    const { login } = useAuth();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl" dir={dir}>
                <DialogHeader className="pt-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-6">
                        <Video className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="text-center space-y-3">
                        <DialogTitle className="text-3xl font-bold text-foreground">
                            {t('authModalTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground leading-relaxed px-4">
                            {t('authModalDesc')}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 py-8">
                    <Button 
                        onClick={() => {
                            onOpenChange(false);
                            login();
                        }}
                        className="w-full h-14 rounded-2xl bg-white border border-border/50 shadow-sm hover:bg-gray-50 text-gray-900 font-bold transition-all duration-300 group"
                    >
                        <LogIn className="w-4 h-4" />
                        {t('loginWithGoogle')}
                    </Button>
                    
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center justify-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        {t('secureAuthGoogle')}
                    </p>
                </div>
                
                <div className="border-t border-border/5 pt-6 text-center">
                    <Button 
                        variant="ghost"
                        className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-widest" 
                        onClick={() => onOpenChange(false)}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
