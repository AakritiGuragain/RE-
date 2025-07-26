import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  usePosts, 
  useCreatePost, 
  useLikePost, 
  useCommentOnPost,
  useUploadFile 
} from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Camera, 
  Send,
  MapPin,
  Trophy,
  Lightbulb,
  Users,
  Plus,
  Image as ImageIcon
} from 'lucide-react';

const Community = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [newPost, setNewPost] = useState({ content: '', type: 'GENERAL' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: postsData, refetch: refetchPosts } = usePosts(1, 20, selectedTab === 'all' ? undefined : selectedTab);
  const createPostMutation = useCreatePost();
  const likePostMutation = useLikePost();
  const commentMutation = useCommentOnPost();
  const uploadFileMutation = useUploadFile();

  const postTypes = [
    { value: 'GENERAL', label: 'General', icon: Users, color: 'bg-blue-500' },
    { value: 'HOTSPOT', label: 'Hotspot', icon: MapPin, color: 'bg-red-500' },
    { value: 'ACHIEVEMENT', label: 'Achievement', icon: Trophy, color: 'bg-yellow-500' },
    { value: 'TIP', label: 'Tip', icon: Lightbulb, color: 'bg-green-500' },
  ];

  const handleCreatePost = async () => {
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: selectedImage,
          folder: 'posts'
        });
        imageUrl = uploadResult.url;
      }

      await createPostMutation.mutateAsync({
        content: newPost.content,
        type: newPost.type as any,
        imageUrl: imageUrl || undefined,
      });

      setNewPost({ content: '', type: 'GENERAL' });
      setSelectedImage(null);
      setShowCreatePost(false);
      refetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync(postId);
      refetchPosts();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community</h1>
              <p className="text-gray-600 mt-1">
                Connect with fellow eco-warriors and share your journey
              </p>
            </div>
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <Card>
            <CardHeader>
              <CardTitle>Create a New Post</CardTitle>
              <CardDescription>Share your thoughts with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-600">@{user?.username}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Post Type</label>
                <div className="flex flex-wrap gap-2">
                  {postTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={newPost.type === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewPost({ ...newPost, type: type.value })}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />

              {selectedImage && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setSelectedImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreatePost(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() || createPostMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createPostMutation.isPending ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post Filters */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="HOTSPOT">Hotspots</TabsTrigger>
            <TabsTrigger value="ACHIEVEMENT">Achievements</TabsTrigger>
            <TabsTrigger value="TIP">Tips</TabsTrigger>
            <TabsTrigger value="GENERAL">General</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {/* Posts Feed */}
            <div className="space-y-4">
              {postsData?.posts?.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    {/* Post Header */}
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={post.author.profilePicture} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{post.author.name}</p>
                          <p className="text-sm text-gray-600">@{post.author.username}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-600">{formatTimeAgo(post.createdAt)}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {post.type.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mt-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                      
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="Post image"
                          className="mt-4 w-full h-64 object-cover rounded-lg"
                        />
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className={post.isLiked ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likesCount}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.commentsCount}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {post.comments.slice(0, 3).map((comment: any) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.author.profilePicture} />
                              <AvatarFallback className="text-xs">
                                {comment.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg p-3">
                                <p className="font-medium text-sm">{comment.author.name}</p>
                                <p className="text-sm text-gray-900">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {formatTimeAgo(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {post.commentsCount > 3 && (
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            View all {post.commentsCount} comments
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profilePicture} />
                          <AvatarFallback className="text-xs">
                            {user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            placeholder="Write a comment..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                commentMutation.mutate({
                                  postId: post.id,
                                  content: e.currentTarget.value.trim()
                                });
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No posts yet</p>
                  <p className="text-sm text-gray-500">Be the first to share something with the community!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
