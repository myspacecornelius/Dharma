import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Post() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h3 className="font-bold">shadcn</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">New York, NY</p>
        </div>
      </div>
      <p className="text-gray-800 dark:text-gray-200 mb-4">
        Just copped the new kicks! 🔥
      </p>
      <div className="flex justify-between text-gray-500 dark:text-gray-400">
        <button className="hover:text-blue-500">Like</button>
        <button className="hover:text-green-500">Comment</button>
        <button className="hover:text-yellow-500">Share</button>
      </div>
    </div>
  );
}
