import React from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

const NotificationPermissionDialog = ({ open, onOpenChange, onEnable, onSkip }) => {
    const { t, dir } = useThemeLanguage();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md" dir={dir}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                            {t('enableNotificationsTitle')}
                        </span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                        {t('enableNotificationsDesc')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-start gap-4 mt-6">
                    <AlertDialogAction asChild>
                        <Button onClick={onEnable} className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-primary/20">
                            {t('enable')}
                        </Button>
                    </AlertDialogAction>
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" onClick={onSkip} className="flex-1 rounded-2xl h-12 font-bold text-muted-foreground hover:bg-muted/50">
                            {t('notNow')}
                        </Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default NotificationPermissionDialog;
