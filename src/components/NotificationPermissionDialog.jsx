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
import { BellRing } from "lucide-react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

const NotificationPermissionDialog = ({ open, onOpenChange, onEnable, onSkip }) => {
    const { t, dir } = useThemeLanguage();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md" dir={dir}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-purple-600" />
                        {t('enableNotificationsTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('enableNotificationsDesc')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-start gap-2">
                    <AlertDialogAction onClick={onEnable} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {t('enable')}
                    </AlertDialogAction>
                    <AlertDialogCancel onClick={onSkip} className="mt-0">
                        {t('notNow')}
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default NotificationPermissionDialog;
