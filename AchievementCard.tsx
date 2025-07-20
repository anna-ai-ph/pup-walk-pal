
import { useApp } from '@/context/AppContext';
import { Award, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AchievementCard = () => {
  const { state } = useApp();
  
  // Sort members by walk count to find the "Walk Champion"
  const sortedByWalks = [...state.members].sort((a, b) => b.walkCount - a.walkCount);
  const walkChampion = sortedByWalks[0];
  
  // Find the longest walk duration
  let longestWalkMember = state.members[0];
  let longestWalkDuration = 0;
  
  state.walks
    .filter(walk => walk.status === 'Completed' && walk.duration)
    .forEach(walk => {
      if (walk.duration && walk.duration > longestWalkDuration) {
        longestWalkDuration = walk.duration;
        longestWalkMember = state.members.find(m => m.id === walk.assignedTo) || state.members[0];
      }
    });
  
  // Check if current user has any achievements
  const currentUserAchievements = state.members
    .find(m => m.id === state.currentUser)?.achievements || [];
  
  // Generate achievement badges
  const achievements = [
    {
      title: 'Walk Champion',
      description: `Most walks this month (${walkChampion.walkCount})`,
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      member: walkChampion,
    },
    {
      title: 'Longest Walk',
      description: `${longestWalkDuration} minutes`,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      member: longestWalkMember,
    }
  ];
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-enter animation-delay-100">
      <h3 className="font-medium text-gray-500 text-sm mb-3 flex items-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2"></span>
        Achievements
      </h3>
      
      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <div
            key={achievement.title}
            className={cn(
              "flex items-center p-3 rounded-lg border",
              achievement.bg,
              achievement.border,
              "hover-scale"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
              "bg-white"
            )}>
              <achievement.icon className={achievement.color} size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{achievement.title}</p>
              <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-white">
              {achievement.member.profilePicture ? (
                <img 
                  src={achievement.member.profilePicture} 
                  alt={achievement.member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                  {achievement.member.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {currentUserAchievements.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium">Your achievements</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentUserAchievements.map(achievement => (
              <span 
                key={achievement}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                <Award size={12} className="mr-1" />
                {achievement}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">Complete more walks to earn achievements!</p>
        </div>
      )}
    </div>
  );
};
