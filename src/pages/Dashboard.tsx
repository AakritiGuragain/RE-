import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPoints, useUserWasteStats, useImpactStats, useUserBadges } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Recycle, 
  Leaf, 
  Trophy, 
  Camera, 
  MapPin, 
  Users, 
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: pointsData } = useUserPoints();
  const { data: wasteStats } = useUserWasteStats();
  const { data: impactStats } = useImpactStats();
  const { data: userBadges } = useUserBadges(user?.id || '');

  const quickActions = [
    {
      title: 'Scan Waste',
      description: 'Take a photo to classify waste',
      icon: Camera,
      href: '/scan',
      color: 'bg-green-500',
    },
    {
      title: 'Find Drop Points',
      description: 'Locate nearby collection points',
      icon: MapPin,
      href: '/drop-points',
      color: 'bg-blue-500',
    },
    {
      title: 'Community Feed',
      description: 'Share and connect with others',
      icon: Users,
      href: '/community',
      color: 'bg-purple-500',
    },
    {
      title: 'Missions',
      description: 'Complete eco-challenges',
      icon: Target,
      href: '/missions',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to make a positive impact today?
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {pointsData?.points || 0}
                </span>
                <span className="text-gray-600">points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wasteStats?.totalWeight || 0} kg
              </div>
              <p className="text-xs text-muted-foreground">
                {wasteStats?.totalItems || 0} items recycled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {impactStats?.totalCo2Saved || 0} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Environmental impact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userBadges?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Achievements unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wasteStats?.recentSubmissions?.slice(0, 5).map((submission: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{submission.categoryName}</p>
                          <p className="text-sm text-gray-600">
                            {submission.weight}kg • {submission.pointsEarned} points
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-gray-600 text-center py-4">
                        No recent activity. Start recycling to see your progress!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Goal</CardTitle>
                  <CardDescription>
                    Recycle 50kg this month to earn bonus points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.min((wasteStats?.monthlyWeight || 0) / 50 * 100, 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((wasteStats?.monthlyWeight || 0) / 50 * 100, 100)} 
                      className="h-2"
                    />
                    <p className="text-sm text-gray-600">
                      {wasteStats?.monthlyWeight || 0}kg of 50kg goal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Your Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {userBadges?.map((badge: any) => (
                    <div key={badge.id} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No badges earned yet</p>
                      <p className="text-sm text-gray-500">Start recycling to unlock achievements!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Plastic Recycled</span>
                      <span className="text-sm text-gray-600">
                        {wasteStats?.categoryBreakdown?.PLASTIC || 0}kg
                      </span>
                    </div>
                    <Progress 
                      value={((wasteStats?.categoryBreakdown?.PLASTIC || 0) / (wasteStats?.totalWeight || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Paper Recycled</span>
                      <span className="text-sm text-gray-600">
                        {wasteStats?.categoryBreakdown?.PAPER || 0}kg
                      </span>
                    </div>
                    <Progress 
                      value={((wasteStats?.categoryBreakdown?.PAPER || 0) / (wasteStats?.totalWeight || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Metal Recycled</span>
                      <span className="text-sm text-gray-600">
                        {wasteStats?.categoryBreakdown?.METAL || 0}kg
                      </span>
                    </div>
                    <Progress 
                      value={((wasteStats?.categoryBreakdown?.METAL || 0) / (wasteStats?.totalWeight || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
