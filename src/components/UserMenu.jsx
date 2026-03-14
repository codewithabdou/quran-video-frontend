import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, History, Shield, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const UserMenu = () => {
    const { user, isAdmin, logout } = useAuth();
    const { t } = useThemeLanguage();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/50 backdrop-blur border-border hover:bg-accent hover:text-accent-foreground transition-all rounded-full overflow-hidden w-9 h-9 p-0"
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <User className="h-[1.2rem] w-[1.2rem]" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                {/* User info header */}
                <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded">
                            <Shield className="w-3 h-3" />
                            {t('navAdmin')}
                        </span>
                    )}
                </div>

                <DropdownMenuItem
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <History className="w-4 h-4" />
                    {t('myHistory')}
                </DropdownMenuItem>

                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Shield className="w-4 h-4" />
                        {t('adminDashboard')}
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="w-4 h-4" />
                    {t('signOut')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
