import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const PostComposer = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full">Create Post</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="text">
                    <TabsList>
                        <TabsTrigger value="text">Text</TabsTrigger>
                        <TabsTrigger value="heat-check">Heat Check</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Textarea placeholder="What's on your mind?" />
                <Button>Post</Button>
            </DialogContent>
        </Dialog>
    );
};
