# Refactoring Examples - Before & After

## Example 1: Dashboard Page (Simplified)

### BEFORE:
```tsx
export default function DashboardPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then(res => res.json())
      .then(data => setAgents(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents(agents.filter(a => a.id !== id));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>
          <h3>{agent.name}</h3>
          <button onClick={() => handleDelete(agent.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### AFTER:
```tsx
import { CardSkeleton } from "@/components/ui/skeletons";
import { EmptyFeed } from "@/components/ui/empty-states";
import { toast } from "@/components/ui/toast";
import { useConfirmation } from "@/components/ui/confirmation-dialog";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { confirm, ConfirmationDialog } = useConfirmation();

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load agents", {
        onRetry: fetchAgents
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = (agent) => {
    confirm({
      title: `Delete "${agent.name}"?`,
      description: "This action cannot be undone.",
      variant: "destructive",
      onConfirm: async () => {
        const oldAgents = [...agents];
        setAgents(agents.filter(a => a.id !== agent.id));

        try {
          await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
          toast.undo(`"${agent.name}" deleted`, {
            onUndo: () => setAgents(oldAgents)
          });
        } catch (error) {
          setAgents(oldAgents);
          toast.error("Failed to delete");
        }
      }
    });
  };

  return (
    <ErrorBoundary variant="page">
      <div>
        {loading && <CardSkeleton count={3} variant="default" />}

        {error && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={fetchAgents}>Retry</button>
          </div>
        )}

        {!loading && !error && agents.length === 0 && (
          <EmptyFeed
            title="No agents yet"
            description="Create your first AI companion"
            actionLabel="Create Agent"
            onAction={() => router.push("/create")}
          />
        )}

        {!loading && !error && agents.length > 0 && (
          agents.map(agent => (
            <div key={agent.id}>
              <h3>{agent.name}</h3>
              <button onClick={() => handleDelete(agent)}>Delete</button>
            </div>
          ))
        )}

        <ConfirmationDialog />
      </div>
    </ErrorBoundary>
  );
}
```

## Example 2: Chat Component

### BEFORE:
```tsx
function Chat({ agentId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${agentId}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .finally(() => setLoading(false));
  }, [agentId]);

  const sendMessage = async (text) => {
    setSending(true);
    await fetch(`/api/agents/${agentId}/message`, {
      method: "POST",
      body: JSON.stringify({ text })
    });
    setSending(false);
  };

  if (loading) return <div>Loading chat...</div>;

  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
      <button disabled={sending} onClick={() => sendMessage("Hi")}>
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
```

### AFTER:
```tsx
import { ChatSkeleton } from "@/components/ui/skeletons";
import { EmptyChat } from "@/components/ui/empty-states";
import { LoadingButton } from "@/components/ui/loading-button";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { toast } from "@/components/ui/toast";
import { withRetry } from "@/lib/utils/retry";

function Chat({ agentId, agentName }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await withRetry(
        () => fetch(`/api/agents/${agentId}/messages`).then(r => r.json()),
        { maxRetries: 3 }
      );
      setMessages(data);
    } catch (error) {
      toast.error("Failed to load messages", {
        onRetry: fetchMessages
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [agentId]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setSending(true);
    setIsTyping(true);

    const tempMsg = { id: "temp", text, isUser: true };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error("Failed to send");

      const data = await response.json();
      setMessages(prev => [...prev.filter(m => m.id !== "temp"), data]);

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== "temp"));
      toast.error("Failed to send message", {
        onRetry: () => sendMessage(text)
      });
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  return (
    <div>
      {loading ? (
        <ChatSkeleton count={6} />
      ) : messages.length === 0 ? (
        <EmptyChat agentName={agentName} />
      ) : (
        <>
          {messages.map(msg => (
            <div key={msg.id}>{msg.text}</div>
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}

      <LoadingButton
        loading={sending}
        loadingText="Sending..."
        onClick={() => sendMessage("Hi")}
      >
        Send
      </LoadingButton>
    </div>
  );
}
```

## Example 3: Search with Debounce

### BEFORE:
```tsx
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    onSearch(query);
  }, [query]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### AFTER:
```tsx
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="pl-10"
        aria-label="Search"
      />
    </div>
  );
}
```

## Example 4: Form with Auto-save

### BEFORE:
```tsx
function ProfileForm({ profile }) {
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ name })
    });
    setSaving(false);
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
```

### AFTER:
```tsx
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SaveIndicator, SaveStatus } from "@/components/ui/save-indicator";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

function ProfileForm({ profile }) {
  const [name, setName] = useState(profile.name);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debouncedName = useDebounce(name, 1000);

  useEffect(() => {
    if (debouncedName === profile.name) return;

    const saveProfile = async () => {
      setSaveStatus("saving");
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: debouncedName })
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        setSaveStatus("error");
        toast.error("Failed to save profile");
      }
    };

    saveProfile();
  }, [debouncedName]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="name">Name</label>
        <SaveIndicator status={saveStatus} />
      </div>
      <Input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
    </div>
  );
}
```

## Example 5: Infinite Scroll List

### BEFORE:
```tsx
function FeedList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/posts?page=${page}`)
      .then(res => res.json())
      .then(data => setPosts(prev => [...prev, ...data]));
  }, [page]);

  return (
    <div>
      {posts.map(post => <div key={post.id}>{post.title}</div>)}
      <button onClick={() => setPage(p => p + 1)}>Load More</button>
    </div>
  );
}
```

### AFTER:
```tsx
import { useEffect, useRef, useCallback } from "react";
import { ListSkeleton } from "@/components/ui/skeletons";
import { EmptyFeed } from "@/components/ui/empty-states";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

function FeedList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const fetchPosts = async (pageNum: number) => {
    try {
      const isInitial = pageNum === 1;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/posts?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => pageNum === 1 ? data : [...prev, ...data]);
      }
    } catch (error) {
      toast.error("Failed to load posts", {
        onRetry: () => fetchPosts(pageNum)
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  // Intersection Observer for infinite scroll
  const lastPostRef = useCallback((node) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  if (loading && page === 1) {
    return <ListSkeleton count={5} variant="detailed" />;
  }

  if (!loading && posts.length === 0) {
    return <EmptyFeed onAction={() => router.push("/create")} />;
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={staggerItem}
            ref={index === posts.length - 1 ? lastPostRef : null}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>

      {loadingMore && <ListSkeleton count={2} variant="compact" />}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-muted-foreground py-8">
          No more posts to load
        </p>
      )}
    </motion.div>
  );
}
```

## Key Improvements Summary

### 1. Loading States
- ❌ Generic "Loading..." text
- ✅ Skeleton loaders matching actual content

### 2. Error Handling
- ❌ Silent failures or console.log
- ✅ Toast notifications with retry

### 3. Empty States
- ❌ Blank screen or no feedback
- ✅ Beautiful empty state with CTA

### 4. Confirmations
- ❌ Native browser confirm()
- ✅ Custom modal with undo option

### 5. Forms
- ❌ Manual save button
- ✅ Auto-save with status indicator

### 6. Search
- ❌ Immediate API calls
- ✅ Debounced with loading state

### 7. Lists
- ❌ Load more button
- ✅ Infinite scroll with intersection observer

### 8. Animations
- ❌ Abrupt state changes
- ✅ Smooth transitions with Framer Motion

### 9. Accessibility
- ❌ Missing labels and focus states
- ✅ Full ARIA support and keyboard navigation

### 10. Mobile
- ❌ Desktop-only design
- ✅ Touch-friendly with proper sizing
