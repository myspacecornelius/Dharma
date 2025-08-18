
import Image from 'next/image';

export type PostProps = {
  user: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  content: {
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  };
  tags: string[];
};

export default function Post({ user, timestamp, content, tags }: PostProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-4 my-4 w-full max-w-2xl">
      <div className="flex items-center mb-4">
        <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="rounded-full mr-4" />
        <div>
          <p className="font-bold">{user.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{timestamp}</p>
        </div>
      </div>
      {content.text && <p className="mb-4">{content.text}</p>}
      {content.mediaUrl && (
        <div className="mb-4">
          {content.mediaType === 'image' ? (
            <Image src={content.mediaUrl} alt="Post media" width={600} height={400} className="rounded-lg" />
          ) : (
            <video src={content.mediaUrl} controls className="rounded-lg w-full"></video>
          )}
        </div>
      )}
      <div className="flex space-x-2">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-zinc-600">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-around mt-4 pt-2 border-t border-gray-200 dark:border-zinc-700">
        <button className="hover:bg-gray-200 dark:hover:bg-zinc-700 p-2 rounded-lg">Like</button>
        <button className="hover:bg-gray-200 dark:hover:bg-zinc-700 p-2 rounded-lg">Save</button>
        <button className="hover:bg-gray-200 dark:hover:bg-zinc-700 p-2 rounded-lg">Repost</button>
      </div>
    </div>
  );
}

