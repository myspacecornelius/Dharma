import { Post } from "../types/post";

const API_URL = import.meta.env.VITE_API_URL;

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/posts`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}
