
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType, Walk, HouseholdMember } from '@/context/types';
import { supabase } from '@/integrations/supabase/client';

export class NotificationService {
  // Create a notification
  static createNotification(
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string
  ): Notification {
    return {
      id: uuidv4(),
      type,
      title,
      message,
      time: new Date(),
      read: false,
      relatedId
    };
  }

  // Generate walk completed notification
  static createWalkCompletedNotification(walk: Walk, walkerName: string): Notification {
    const timeString = walk.duration 
      ? `(${walk.duration} minutes)` 
      : '';
    
    return this.createNotification(
      'walk_completed',
      'Walk completed',
      `${walkerName} completed a walk ${timeString}`,
      walk.id
    );
  }

  // Generate walk missed notification
  static createWalkMissedNotification(walk: Walk, assignedTo: string): Notification {
    const time = walk.date instanceof Date 
      ? walk.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : new Date(walk.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return this.createNotification(
      'walk_missed',
      'Walk missed',
      `The walk scheduled at ${time} was not completed`,
      walk.id
    );
  }

  // Generate cover request notification
  static createCoverRequestNotification(walk: Walk, requesterName: string): Notification {
    const date = walk.date instanceof Date ? walk.date : new Date(walk.date);
    const dateString = date.toLocaleDateString([], { weekday: 'long' });
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return this.createNotification(
      'cover_request',
      'Walk cover request',
      `${requesterName} needs someone to cover the walk on ${dateString} at ${timeString}`,
      walk.id
    );
  }

  // Generate walk swap request notification
  static createWalkSwapRequestNotification(walk: Walk, requesterName: string): Notification {
    const date = walk.date instanceof Date ? walk.date : new Date(walk.date);
    const dateString = date.toLocaleDateString([], { weekday: 'long' });
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return this.createNotification(
      'walk_swap_request',
      'Walk swap request',
      `${requesterName} is requesting someone to swap their walk on ${dateString} at ${timeString}`,
      walk.id
    );
  }

  // Generate walk swap accepted notification
  static createWalkSwapAcceptedNotification(walk: Walk, acceptorName: string): Notification {
    const date = walk.date instanceof Date ? walk.date : new Date(walk.date);
    const dateString = date.toLocaleDateString([], { weekday: 'long' });
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return this.createNotification(
      'walk_swap_accepted',
      'Walk swap accepted',
      `${acceptorName} has agreed to take your walk on ${dateString} at ${timeString}`,
      walk.id
    );
  }

  // Generate achievement notification
  static createAchievementNotification(member: HouseholdMember, achievement: string): Notification {
    return this.createNotification(
      'achievement',
      'New achievement unlocked',
      `${member.name} earned the "${achievement}" badge`,
      member.id
    );
  }

  // Generate walk reminder notification
  static createWalkReminderNotification(walk: Walk): Notification {
    const date = walk.date instanceof Date ? walk.date : new Date(walk.date);
    const dateString = date.toLocaleDateString([], { weekday: 'long' });
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return this.createNotification(
      'walk_reminder',
      'Upcoming walk reminder',
      `You have a walk scheduled ${dateString} at ${timeString}`,
      walk.id
    );
  }

  // Improved saveNotification method to ensure proper persistence
  static async saveNotification(householdId: string, notification: Notification): Promise<boolean> {
    try {
      console.log('Saving notification to database:', notification.title);
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          household_id: householdId,
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: notification.time.toISOString(),
          read: notification.read,
          related_id: notification.relatedId,
          accepted_by: notification.acceptedBy
        });
      
      if (error) {
        console.error('Error saving notification:', error);
        return false;
      }
      
      console.log('Notification saved successfully:', notification.id);
      return true;
    } catch (error) {
      console.error('Error saving notification:', error);
      return false;
    }
  }

  // Enhanced fetchNotifications method to get all household notifications
  static async fetchNotifications(householdId: string): Promise<Notification[]> {
    try {
      console.log('Fetching notifications for household:', householdId);
      
      // Add a limit of 100 notifications to prevent fetching too many at once
      // Order by time descending to get the newest notifications first
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('household_id', householdId)
        .order('time', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      
      console.log(`Found ${data.length} notifications for household`);
      
      return data.map(item => ({
        id: item.id,
        type: item.type as NotificationType,
        title: item.title,
        message: item.message,
        time: new Date(item.time),
        read: item.read,
        relatedId: item.related_id,
        acceptedBy: item.accepted_by
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Update notification accepted_by in Supabase
  static async updateNotificationAcceptedBy(householdId: string, notificationId: string, acceptedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ accepted_by: acceptedBy })
        .eq('household_id', householdId)
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error updating notification acceptance:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating notification acceptance:', error);
      return false;
    }
  }

  // Mark notification as read in Supabase
  static async markAsRead(householdId: string, notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('household_id', householdId)
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read in Supabase
  static async markAllAsRead(householdId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('household_id', householdId);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete old read notifications (older than 7 days)
  static async deleteOldReadNotifications(householdId: string): Promise<boolean> {
    try {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('household_id', householdId)
        .eq('read', true)
        .lt('time', sevenDaysAgo.toISOString());
      
      if (error) {
        console.error('Error deleting old notifications:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      return false;
    }
  }

  // Set up realtime subscription to notifications table
  static setupRealtimeNotifications(householdId: string, onInsert: (notification: Notification) => void): { unsubscribe: () => void } {
    console.log('Setting up realtime notifications for household:', householdId);
    
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `household_id=eq.${householdId}`
        }, 
        (payload) => {
          console.log('New notification received:', payload);
          if (payload.new) {
            const newNotification: Notification = {
              id: payload.new.id,
              type: payload.new.type as NotificationType,
              title: payload.new.title,
              message: payload.new.message,
              time: new Date(payload.new.time),
              read: payload.new.read,
              relatedId: payload.new.related_id,
              acceptedBy: payload.new.accepted_by
            };
            
            onInsert(newNotification);
          }
        }
      )
      .subscribe();
      
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from notifications channel');
        supabase.removeChannel(channel);
      }
    };
  }
}
