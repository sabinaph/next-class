"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Filter, Loader2, MessageSquare, Reply, Search, Send, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

type CommunityAuthor = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: Role;
};

type CommunityReaction = {
  id: string;
  userId: string;
};

type CommunityComment = {
  id: string;
  body: string;
  createdAt: string;
  author: CommunityAuthor;
  reactions: CommunityReaction[];
  replies: CommunityComment[];
};

type CommunityPost = {
  id: string;
  title: string;
  body: string;
  type: "QUESTION" | "DISCUSSION";
  createdAt: string;
  author: CommunityAuthor;
  reactions: CommunityReaction[];
  comments: CommunityComment[];
};

const getName = (author: CommunityAuthor) => {
  return author.name || `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Learner";
};

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [viewerId, setViewerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<"QUESTION" | "DISCUSSION">("QUESTION");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "QUESTION" | "DISCUSSION">("ALL");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const isAllowed = useMemo(
    () => !!session?.user?.role && ["STUDENT", "INSTRUCTOR"].includes(session.user.role),
    [session?.user?.role]
  );
  const currentViewerId = viewerId || session?.user?.id || "";
  const sessionRole =
    session?.user?.role && ["STUDENT", "INSTRUCTOR", "ADMIN"].includes(session.user.role)
      ? (session.user.role as Role)
      : "STUDENT";
  const nameParts = (session?.user?.name || "").trim().split(/\s+/).filter(Boolean);
  const currentAuthor: CommunityAuthor = {
    id: currentViewerId,
    name: session?.user?.name || null,
    firstName: nameParts[0] || null,
    lastName: nameParts.slice(1).join(" ") || null,
    role: sessionRole,
  };
  const questionsCount = useMemo(
    () => posts.filter((post) => post.type === "QUESTION").length,
    [posts]
  );
  const discussionsCount = useMemo(
    () => posts.filter((post) => post.type === "DISCUSSION").length,
    [posts]
  );
  const totalCommentsCount = useMemo(
    () => posts.reduce((sum, post) => sum + post.comments.length, 0),
    [posts]
  );
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesType = typeFilter === "ALL" || post.type === typeFilter;
      const haystack = `${post.title} ${post.body} ${getName(post.author)}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesType && matchesSearch;
    });
  }, [posts, searchQuery, typeFilter]);

  const loadPosts = async () => {
    if (!isAllowed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/community/posts", { cache: "no-store" });
      const payload = (await response
        .json()
        .catch(() => null)) as {
        success?: boolean;
        posts?: CommunityPost[];
        viewerId?: string;
      } | null;

      if (response.ok && payload?.success) {
        setPosts(payload.posts || []);
        setViewerId(payload.viewerId || "");
      } else {
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAllowed) {
      void loadPosts();
    }
  }, [status, isAllowed]);

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: postType,
          title: postTitle,
          body: postBody,
        }),
      });

      if (response.ok) {
        setPostTitle("");
        setPostBody("");
        setPostType("QUESTION");
        await loadPosts();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitComment = async (postId: string, parentId?: string) => {
    if (!currentViewerId) return;

    const draftKey = parentId || postId;
    const text = (parentId ? replyDrafts[draftKey] : commentDrafts[draftKey]) || "";
    if (!text.trim()) return;

    const previousPosts = posts;
    const optimisticId = `temp-comment-${Date.now()}`;
    const optimisticComment: CommunityComment = {
      id: optimisticId,
      body: text,
      createdAt: new Date().toISOString(),
      author: currentAuthor,
      reactions: [],
      replies: [],
    };

    if (parentId) {
      setReplyDrafts((prev) => ({ ...prev, [draftKey]: "" }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === parentId
                ? { ...comment, replies: [...comment.replies, optimisticComment] }
                : comment
            ),
          };
        })
      );
    } else {
      setCommentDrafts((prev) => ({ ...prev, [draftKey]: "" }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, optimisticComment] }
            : post
        )
      );
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, parentId }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as { success?: boolean; comment?: Partial<CommunityComment> } | null;

      if (!response.ok || !payload?.success || !payload.comment) {
        throw new Error("Failed to add comment");
      }

      const normalizedComment: CommunityComment = {
        id: payload.comment.id || optimisticId,
        body: payload.comment.body || text,
        createdAt: payload.comment.createdAt || new Date().toISOString(),
        author: (payload.comment.author as CommunityAuthor) || currentAuthor,
        reactions: payload.comment.reactions || [],
        replies: payload.comment.replies || [],
      };

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          if (parentId) {
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === parentId
                  ? {
                      ...comment,
                      replies: comment.replies.map((reply) =>
                        reply.id === optimisticId ? normalizedComment : reply
                      ),
                    }
                  : comment
              ),
            };
          }

          return {
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === optimisticId ? normalizedComment : comment
            ),
          };
        })
      );
    } catch {
      setPosts(previousPosts);
      if (parentId) {
        setReplyDrafts((prev) => ({ ...prev, [draftKey]: text }));
      } else {
        setCommentDrafts((prev) => ({ ...prev, [draftKey]: text }));
      }
    }
  };

  const toggleReaction = async (postId: string, commentId?: string) => {
    if (!currentViewerId) return;

    const previousPosts = posts;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        if (commentId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id !== commentId) return comment;

              const hasReaction = comment.reactions.some(
                (reaction) => reaction.userId === currentViewerId
              );

              return {
                ...comment,
                reactions: hasReaction
                  ? comment.reactions.filter(
                      (reaction) => reaction.userId !== currentViewerId
                    )
                  : [...comment.reactions, { id: `temp-${Date.now()}`, userId: currentViewerId }],
              };
            }),
          };
        }

        const hasReaction = post.reactions.some(
          (reaction) => reaction.userId === currentViewerId
        );

        return {
          ...post,
          reactions: hasReaction
            ? post.reactions.filter((reaction) => reaction.userId !== currentViewerId)
            : [...post.reactions, { id: `temp-${Date.now()}`, userId: currentViewerId }],
        };
      })
    );

    try {
      const response = await fetch(`/api/community/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }
    } catch {
      setPosts(previousPosts);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">
        Loading community...
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-3xl font-bold">Community Q and A</h1>
          <p className="mt-3 text-muted-foreground">
            Login as a student or instructor to ask questions, comment, reply, and react.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm lg:p-8">
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Community Hub
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-4xl">Ask, Share, And Learn Together</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Start meaningful discussions, get answers faster, and build your learning momentum with the community.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Total Posts</p>
                <p className="mt-1 text-lg font-semibold">{posts.length}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="mt-1 text-lg font-semibold">{questionsCount}</p>
              </div>
              <div className="rounded-xl border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Comments</p>
                <p className="mt-1 text-lg font-semibold">{totalCommentsCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm lg:p-8">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-primary" />
            Explore Discussions
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="communitySearch">Search posts</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="communitySearch"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, text, or author"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Post type</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant={typeFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setTypeFilter("ALL")}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={typeFilter === "QUESTION" ? "default" : "outline"}
                  onClick={() => setTypeFilter("QUESTION")}
                >
                  Questions
                </Button>
                <Button
                  type="button"
                  variant={typeFilter === "DISCUSSION" ? "default" : "outline"}
                  onClick={() => setTypeFilter("DISCUSSION")}
                >
                  Discussions
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredPosts.length}</span> of {posts.length} posts.
              <span className="ml-2">Discussions: {discussionsCount}</span>
            </p>
          </div>
        </section>
      </div>

      <form onSubmit={submitPost} className="mb-8 space-y-4 rounded-2xl border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="postType">Post Type</Label>
            <select
              id="postType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={postType}
              onChange={(e) => setPostType(e.target.value as "QUESTION" | "DISCUSSION")}
            >
              <option value="QUESTION">Question</option>
              <option value="DISCUSSION">Discussion</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="postTitle">Title</Label>
            <Input
              id="postTitle"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="What do you want to ask or share?"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="postBody">Details</Label>
          <Textarea
            id="postBody"
            rows={4}
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            placeholder="Describe your question or thought..."
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publish Post
        </Button>
      </form>

      <div className="space-y-5">
        {isLoading ? (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No posts yet. Start the first discussion.
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No posts matched your search or filter.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.id} className="rounded-2xl border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`rounded-full px-2 py-1 ${
                    post.type === "QUESTION"
                      ? "border border-primary/35 bg-primary/10 text-primary"
                      : "border border-border bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {post.type === "QUESTION" ? "Question" : "Discussion"}
                </span>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                <span>by {getName(post.author)} ({post.author.role.toLowerCase()})</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{post.body}</p>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  size="sm"
                  variant={post.reactions.some((reaction) => reaction.userId === currentViewerId) ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => void toggleReaction(post.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.reactions.length}
                </Button>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.comments.length} comments
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border bg-background p-3">
                    <p className="text-sm font-medium">{getName(comment.author)}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={comment.reactions.some((reaction) => reaction.userId === currentViewerId) ? "default" : "outline"}
                        className="h-7 gap-1 px-2"
                        onClick={() => void toggleReaction(post.id, comment.id)}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {comment.reactions.length}
                      </Button>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Input
                        value={replyDrafts[comment.id] || ""}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [comment.id]: e.target.value,
                          }))
                        }
                        placeholder="Reply to this comment"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => void submitComment(post.id, comment.id)}
                      >
                        <Reply className="h-3.5 w-3.5" />
                        Reply
                      </Button>
                    </div>

                    {comment.replies.length > 0 ? (
                      <div className="mt-3 space-y-2 border-l pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="rounded-lg border bg-card p-2.5">
                            <p className="text-xs font-medium">{getName(reply.author)}</p>
                            <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={commentDrafts[post.id] || ""}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    placeholder="Add a comment"
                  />
                  <Button size="sm" onClick={() => void submitComment(post.id)}>
                    Comment
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
