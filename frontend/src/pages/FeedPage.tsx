import { HeatCheckCard } from "@/components/posts/HeatCheckCard";
import { IntelReportCard } from "@/components/posts/IntelReportCard";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { posts as mockPosts } from "@/mocks/posts";
import { useState } from "react";

export const FeedPage = () => {
    const [posts, setPosts] = useState(mockPosts);

    const renderPost = (post: any) => {
        switch (post.post_type) {
            case "text":
                return <PostCard key={post.id} post={post} />;
            case "heat_check":
                return <HeatCheckCard key={post.id} post={post} />;
            case "intel_report":
                return <IntelReportCard key={post.id} post={post} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="sticky top-0 z-10 bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button className="w-full">Create Post</Button>
            </div>
            {posts.map(renderPost)}
        </div>
    );
};
