export interface Post {
  id: number;
  content_text: string;
  user: {
    display_name: string;
    avatar_url: string;
  };
  location: {
    name: string;
  };
}
