import { Post as PostType } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-4">
        <Avatar>
          <AvatarImage src={post.user.avatar_url} alt={post.user.display_name} />
          <AvatarFallback>{post.user.display_name[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h3 className="font-bold">{post.user.display_name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{post.location.name}</p>
        </div>
      </div>
      <p className="text-gray-800 dark:text-gray-200 mb-4">
        {post.content_text}
      </p>
      <div className="flex justify-between text-gray-500 dark:text-gray-400">
        <button className="hover:text-blue-500">Like</button>
        <button className="hover:text-green-500">Comment</button>
        <button className="hover:text-yellow-500">Share</button>
      </div>
    </div>
  );
}
