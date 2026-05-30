import { PostComposer } from "@/components/admin/PostComposer";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostComposer postId={id} />;
}
