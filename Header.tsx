
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Home, Menu, PieChart, Power, Settings, User, Bell } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logoutUser, getMemberById, getUnreadNotificationsCount } = useApp();
  
  const currentMember = getMemberById(state.currentUser);
  const unreadCount = getUnreadNotificationsCount();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: PieChart, label: 'Statistics', path: '/statistics' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount > 0 ? unreadCount : undefined },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!state.isRegistered) return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white z-40 border-b border-gray-100">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center">
          <span className="font-bold text-xl text-primary">PupWalkPal</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              size="sm"
              className="relative"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-0 right-0 -mr-1 -mt-1 flex items-center justify-center h-5 w-5 p-0 text-[10px]"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hidden md:flex"
            onClick={() => navigate('/profile')}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentMember?.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentMember?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute top-0 right-0 -mr-1 -mt-1 flex items-center justify-center h-5 w-5 p-0 text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="py-6 flex flex-col h-full">
                <div className="flex items-center mb-6 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentMember?.profilePicture} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentMember?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <div className="font-medium">{currentMember?.name}</div>
                    <div className="text-sm text-gray-500">{currentMember?.role}</div>
                  </div>
                </div>
                
                <nav className="flex-1 space-y-1">
                  {menuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="w-full justify-start relative"
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto flex items-center justify-center h-5 w-5 p-0 text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </nav>
                
                <div className="border-t pt-4 mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <Power className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
