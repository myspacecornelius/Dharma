import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../lib/api";
import { Post as PostType } from "../types/post";
import { Post } from "./Post";

export function Feed() {
  const { data: posts, isLoading, isError } = useQuery<PostType[], Error>({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching posts</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {posts?.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
