'use client';

import { useState, useEffect } from 'react';
import Post, { PostProps } from './components/Post';
import PostCreationModal from './components/PostCreationModal';
import apiClient from './lib/apiClient';

export default function Home() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get('/posts/global');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async (data: any) => {
    try {
      // In a real app, you would handle file uploads to S3 first
      const response = await apiClient.post('/posts/', data);
      setPosts([response.data, ...posts]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-8">Social Feed</h1>
      <button onClick={() => setModalOpen(true)} className="mb-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Create Post</button>
      {isModalOpen && <PostCreationModal onClose={() => setModalOpen(false)} onSubmit={handleCreatePost} />}
      <div className="w-full max-w-2xl">
        {posts.map((post, index) => (
          <Post key={index} {...post} />
        ))}
      </div>
    </main>
  );
}
