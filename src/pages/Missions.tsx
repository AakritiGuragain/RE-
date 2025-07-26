import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useActiveMissions, 
  useUserMissions, 
  useJoinMission,
  useMissionProgress 
} from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Trophy, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock,
  Coins,
  Leaf,
  Recycle,
  Star,
  Gift
} from 'lucide-react';

const Missions = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('available');
  
  const { data: activeMissions } = useActiveMissions();
  const { data: userMissions } = useUserMissions();
  const { data: completedMissions } = useUserMissions('COMPLETED');
  const joinMissionMutation = useJoinMission();

  const handleJoinMission = async (missionId: string) => {
    try {
      await joinMissionMutation.mutateAsync(missionId);
    } catch (error) {
      console.error('Failed to join mission:', error);
    }
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'RECYCLING': return Recycle;
      case 'COMMUNITY': return Users;
      case 'EDUCATION': return Star;
      case 'CHALLENGE': return Target;
      default: return Trophy;
    }
  };

  const getMissionColor = (type: string) => {
    switch (type) {
      case 'RECYCLING': return 'bg-green-500';
      case 'COMMUNITY': return 'bg-blue-500';
      case 'EDUCATION': return 'bg-purple-500';
      case 'CHALLENGE': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) return 'Ends today';
    if (diffInDays === 1) return '1 day left';
    return `${diffInDays} days left`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eco Missions</h1>
              <p className="text-gray-600 mt-1">
                Complete challenges and earn rewards while making a positive impact
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {userMissions?.filter((m: any) => m.status === 'ACTIVE').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {completedMissions?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Missions</TabsTrigger>
            <TabsTrigger value="active">My Active Missions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Available Missions */}
          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMissions?.map((mission: any) => {
                const Icon = getMissionIcon(mission.type);
                const isJoined = userMissions?.some((um: any) => um.missionId === mission.id);
                
                return (
                  <Card key={mission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${getMissionColor(mission.type)}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {mission.type.toLowerCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <CardDescription>{mission.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{mission.pointsReward} points</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatTimeRemaining(mission.endDate)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Participants</span>
                          <span>{mission.participantsCount} joined</span>
                        </div>
                        <Progress value={(mission.participantsCount / mission.maxParticipants) * 100} />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {mission.requirements?.map((req: string, index: number) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => handleJoinMission(mission.id)}
                        disabled={isJoined || joinMissionMutation.isPending}
                      >
                        {isJoined ? 'Already Joined' : 'Join Mission'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Active Missions */}
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userMissions?.filter((mission: any) => mission.status === 'ACTIVE').map((userMission: any) => {
                const mission = userMission.mission;
                const Icon = getMissionIcon(mission.type);
                const progress = (userMission.progress / mission.targetValue) * 100;
                
                return (
                  <Card key={userMission.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${getMissionColor(mission.type)}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <CardDescription>{mission.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{userMission.progress} / {mission.targetValue}</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} />
                        <p className="text-xs text-gray-600">
                          {Math.round(progress)}% complete
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span>{mission.pointsReward} points</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{formatTimeRemaining(mission.endDate)}</span>
                        </div>
                      </div>

                      {userMission.progress >= mission.targetValue && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-800 font-medium">Mission Completed!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }) || (
                <div className="col-span-full text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active missions</p>
                  <p className="text-sm text-gray-500">Join some missions to start earning rewards!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Completed Missions */}
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedMissions?.map((userMission: any) => {
                const mission = userMission.mission;
                const Icon = getMissionIcon(mission.type);
                
                return (
                  <Card key={userMission.id} className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${getMissionColor(mission.type)}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <CardDescription>{mission.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{mission.pointsReward} points earned</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(userMission.completedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Progress value={100} className="bg-green-200" />
                        <p className="text-sm text-green-700 font-medium">
                          Mission completed successfully!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) || (
                <div className="col-span-full text-center py-12">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No completed missions yet</p>
                  <p className="text-sm text-gray-500">Complete your first mission to see it here!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Missions;
