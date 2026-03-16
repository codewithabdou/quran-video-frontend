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
    const { t, dir } = useThemeLanguage();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative focus-visible:ring-0 h-10 w-10 rounded-full overflow-hidden border border-border/20 shadow-premium hover:scale-110 transition-all duration-300 p-0 bg-background/50 backdrop-blur-sm"
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" dir={dir} className="w-64 p-2 rounded-[2rem] border-border/10 shadow-premium bg-card/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                {/* User info header */}
                <div className="px-4 py-3 mb-2 rounded-[1.5rem] bg-muted/30 border border-border/5">
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
