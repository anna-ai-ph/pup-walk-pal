
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertCircle, Bell, CheckCircle, Info, Settings, Trophy, Clock, ArrowRight, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { Notification, NotificationType } from '@/context/types';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationService } from '@/services/NotificationService';

const Notifications = () => {
  const { 
    state, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    getUnreadNotificationsCount,
    acceptWalkSwap
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("unread");
  
  // Redirect to registration if not registered
  useEffect(() => {
    if (!state.isRegistered) {
      navigate('/register');
    }
  }, [state.isRegistered, navigate]);

  // Clean up old notifications when the component mounts
  useEffect(() => {
    if (state.householdId) {
      NotificationService.deleteOldReadNotifications(state.householdId);
    }
  }, [state.householdId]);
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.relatedId && notification.type === 'walk_completed') {
      navigate('/statistics');
    } else if (notification.relatedId && ['walk_missed', 'cover_request', 'walk_reminder'].includes(notification.type)) {
      navigate('/schedule');
    }
  };
  
  const handleAcceptSwap = (notification: Notification) => {
    if (!notification.relatedId) {
      toast.error("Cannot accept swap: Missing walk information");
      return;
    }
    
    // Check if this notification has already been accepted
    if (notification.acceptedBy) {
      toast.error("This swap has already been accepted by another family member");
      return;
    }
    
    // Accept the walk swap
    acceptWalkSwap(notification.id, notification.relatedId);
  };
  
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    toast.success('All notifications marked as read');
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'walk_missed':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'cover_request':
        return <Info className="text-amber-500" size={20} />;
      case 'walk_swap_request':
        return <ArrowRight className="text-blue-500" size={20} />;
      case 'walk_swap_accepted':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'walk_completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'achievement':
        return <Trophy className="text-purple-500" size={20} />;
      case 'walk_reminder':
        return <Clock className="text-blue-500" size={20} />;
      default:
        return <Bell className="text-primary" size={20} />;
    }
  };
  
  // Format date for display
  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  // Filter notifications
  const unreadNotifications = state.notifications.filter(n => !n.read);
  const readNotifications = state.notifications.filter(n => n.read);
  const unreadCount = getUnreadNotificationsCount();
  
  // Get date one week ago for filtering out old notifications
  const oneWeekAgo = subDays(new Date(), 7);
  
  // Filter out notifications older than one week (only from the UI)
  const filteredReadNotifications = readNotifications.filter(n => 
    n.time > oneWeekAgo
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 mt-16 mb-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 animate-enter">
              Notifications
            </h1>
            <p className="text-gray-500 animate-enter animation-delay-100">
              Stay updated on walks and household activity
            </p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="unread" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <span className="absolute top-0 right-1 -mt-1 -mr-1 flex items-center justify-center bg-primary text-white text-xs rounded-full h-5 min-w-5 px-1">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archive">
              Archive ({filteredReadNotifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length > 0 ? (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-primary/20">
                <div className="mt-1 space-y-3">
                  {unreadNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="flex p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatNotificationTime(notification.time)}
                        </p>
                        
                        {/* Action buttons for walk swap requests */}
                        {notification.type === 'walk_swap_request' && !notification.acceptedBy && (
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleAcceptSwap(notification)}
                            >
                              Accept Swap
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Ignore
                            </Button>
                          </div>
                        )}
                        
                        {/* Display if already accepted by someone */}
                        {notification.type === 'walk_swap_request' && notification.acceptedBy && (
                          <p className="mt-2 text-sm text-gray-500 italic">
                            Already accepted by {state.members.find(m => m.id === notification.acceptedBy)?.name || 'another family member'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <Bell className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500">No unread notifications</p>
                <p className="text-sm text-gray-400 mt-1">Check the archive for previous notifications</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="archive" className="space-y-4">
            {filteredReadNotifications.length > 0 ? (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="mt-1 space-y-3">
                  {filteredReadNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="flex p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-700">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatNotificationTime(notification.time)}
                        </p>
                        
                        {/* Display if already accepted by someone */}
                        {notification.type === 'walk_swap_request' && notification.acceptedBy && (
                          <p className="mt-2 text-sm text-gray-500 italic">
                            Accepted by {state.members.find(m => m.id === notification.acceptedBy)?.name || 'another family member'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Read notifications are automatically removed after 7 days
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <Archive className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500">No archived notifications</p>
                <p className="text-sm text-gray-400 mt-1">Notifications will appear here after you've read them</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mt-6">
          <h2 className="font-semibold mb-4">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts on your device</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Walk Reminders</h3>
                <p className="text-sm text-gray-500">Get reminded before your walks</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Delete Period</h3>
                <p className="text-sm text-gray-500">Read notifications are removed after 7 days</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
