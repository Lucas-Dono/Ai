# Memory and RAG System

This document explains the persistent memory and RAG (Retrieval-Augmented Generation) system implemented in Phase 5.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Performance](#performance)
7. [Configuration](#configuration)

## Overview

The memory system provides agents with long-term memory capabilities using:

- **Vector Embeddings**: Text is converted to 384-dimensional vectors using Xenova Transformers
- **Semantic Search**: Fast similarity search using HNSW (Hierarchical Navigable Small World)
- **RAG Integration**: Relevant past conversations are automatically included in prompts
- **Local Processing**: Embeddings generated locally without external API calls
- **Persistent Storage**: Vector indices saved to disk for durability

### Key Features

✅ **Unlimited Context**: Agents can remember conversations from weeks or months ago
✅ **Semantic Understanding**: Finds relevant context even with different wording
✅ **Fast Retrieval**: Sub-millisecond similarity search
✅ **Privacy-Friendly**: All processing done locally, no data sent to external services
✅ **Automatic Integration**: Seamlessly enhances responses without user intervention
✅ **Memory Management**: Users can view, search, and clear memories

## Architecture

### Components Hierarchy

```
┌─────────────────────────────────────────┐
│         Chat Interface (User)           │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Memory Manager (RAG Logic)         │
│  - buildEnhancedPrompt()                │
│  - retrieveContext()                    │
│  - storeMessage()                       │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴───────┐
        ↓              ↓
┌──────────────┐ ┌─────────────────┐
│  Embeddings  │ │  Vector Store   │
│   (Xenova)   │ │    (HNSW)       │
└──────────────┘ └─────────────────┘
```

### Data Flow

```
1. User sends message
        ↓
2. Generate embedding for query
        ↓
3. Search vector store for similar past messages
        ↓
4. Retrieve top K most relevant memories
        ↓
5. Build enhanced prompt with:
   - Base system prompt
   - Emotional state
   - Relationship context
   - Relevant past conversations
        ↓
6. Generate response with LLM
        ↓
7. Store new message embeddings
        ↓
8. Return response to user
```

## Components

### 1. Embedding Service

**Location**: `lib/memory/embeddings.ts`

Generates vector embeddings using Xenova Transformers.

#### Key Functions

```typescript
// Generate embedding for text
const embedding = await generateEmbedding(text);
// Returns: number[] (384 dimensions)

// Generate embeddings in batch
const embeddings = await generateEmbeddings(texts);
// Returns: number[][]

// Calculate similarity
const similarity = cosineSimilarity(embedding1, embedding2);
// Returns: number (0-1, higher = more similar)

// Find most similar from a list
const results = findMostSimilar(queryEmbedding, embeddings, topK);
```

#### Model Details

- **Model**: `Xenova/all-MiniLM-L6-v2`
- **Dimensions**: 384
- **Language**: English
- **Speed**: ~50ms per embedding on CPU
- **Quality**: Good for semantic similarity

### 2. Vector Store

**Location**: `lib/memory/vector-store.ts`

Fast similarity search using HNSW algorithm.

#### Key Features

- **HNSW Algorithm**: Approximate nearest neighbor search
- **Cosine Distance**: Measures semantic similarity
- **Persistent Storage**: Indices saved to `.vector-store/` directory
- **Auto-Save**: Saves every 5 minutes and on process exit
- **Per-Agent Stores**: Each agent has isolated vector space

#### Usage

```typescript
import { getVectorStore } from "@/lib/memory/vector-store";

// Get store for agent
const store = await getVectorStore(agentId);

// Add vector
const id = await store.add(embedding, {
  agentId,
  userId,
  content: "Hello world",
  role: "user",
  timestamp: Date.now(),
});

// Search
const results = await store.search(queryEmbedding, 5);
// Returns: SearchResult[] with id, similarity, metadata

// Get by ID
const metadata = store.getById(id);

// Delete
await store.delete(id);

// Save to disk
await store.save();
```

### 3. Memory Manager

**Location**: `lib/memory/manager.ts`

High-level interface for memory operations with RAG integration.

#### Core Methods

**Store Message**
```typescript
const manager = createMemoryManager(agentId, userId);

await manager.storeMessage("Hello!", "user", {
  messageId: "msg_123",
  emotions: ["happy", "curious"],
});
```

**Retrieve Context with RAG**
```typescript
const context = await manager.retrieveContext(userMessage, {
  maxRelevantMessages: 5,
  similarityThreshold: 0.6,
  includeRecentMessages: 3,
  timeWindow: 7 * 24 * 60 * 60 * 1000, // 1 week
});

console.log(context);
// {
//   relevantMessages: [...],
//   summary: "5 relevant messages retrieved...",
//   relationshipHistory: "Trust 75%, Affinity 80%..."
// }
```

**Build Enhanced Prompt**
```typescript
const enhancedPrompt = await manager.buildEnhancedPrompt(
  baseSystemPrompt,
  userMessage
);

// Result includes:
// - Original system prompt
// - Relationship context
// - Relevant past conversations with similarity scores
// - Instructions to use context
```

**Search Memories**
```typescript
const results = await manager.searchMemories("vacation plans", 10);
// Returns memories semantically similar to "vacation plans"
```

**Memory Statistics**
```typescript
const stats = await manager.getStats();
// {
//   totalMemories: 247,
//   oldestMemory: Date,
//   newestMemory: Date,
//   averageSimilarity: 0.73
// }
```

**Clear Memories**
```typescript
await manager.clearMemories();
// Deletes all memories for this agent-user pair
```

## Usage

### Integration in Chat Endpoints

The memory system is automatically integrated in both REST API and WebSocket handlers.

**Example from `/api/agents/[id]/message`**:

```typescript
// Create memory manager
const memoryManager = createMemoryManager(agentId, userId);

// Build enhanced prompt with RAG
const enhancedPrompt = await memoryManager.buildEnhancedPrompt(
  emotionalPrompt,
  userMessage
);

// Generate response with enhanced context
const response = await llm.generate({
  systemPrompt: enhancedPrompt,
  messages: recentMessages,
});

// Store both messages in memory
await Promise.all([
  memoryManager.storeMessage(userMessage, "user"),
  memoryManager.storeMessage(response, "assistant", {
    emotions,
    relationLevel,
  }),
]);
```

### Memory Viewer Component

**Location**: `components/memory/MemoryViewer.tsx`

React component for viewing and managing memories.

```tsx
import { MemoryViewer } from "@/components/memory/MemoryViewer";

<MemoryViewer agentId={agent.id} agentName={agent.name} />
```

**Features**:
- View memory statistics
- Search through past conversations
- Clear all memories
- See relevance scores
- Filter by role (user/assistant)

## API Endpoints

### GET /api/agents/[id]/memory

Get memory statistics for an agent.

**Response**:
```json
{
  "totalMemories": 247,
  "oldestMemory": "2025-01-15T10:30:00.000Z",
  "newestMemory": "2025-01-22T14:45:00.000Z",
  "averageSimilarity": 0.73
}
```

### POST /api/agents/[id]/memory/search

Search through memories semantically.

**Request**:
```json
{
  "query": "What did we talk about regarding vacation?",
  "limit": 10
}
```

**Response**:
```json
{
  "query": "What did we talk about regarding vacation?",
  "results": [
    {
      "content": "I'm planning a vacation to Hawaii next month",
      "role": "user",
      "timestamp": "2025-01-20T15:30:00.000Z",
      "similarity": 0.87
    },
    {
      "content": "That sounds wonderful! Hawaii is beautiful in February...",
      "role": "assistant",
      "timestamp": "2025-01-20T15:30:15.000Z",
      "similarity": 0.84
    }
  ],
  "count": 2
}
```

### DELETE /api/agents/[id]/memory

Clear all memories for an agent.

**Response**:
```json
{
  "success": true,
  "message": "Memories cleared successfully"
}
```

## Performance

### Embedding Generation

- **Speed**: ~50ms per message on CPU
- **Model Size**: ~80MB (downloaded once, cached locally)
- **Batch Processing**: 5 messages in parallel

### Vector Search

- **Speed**: <1ms for search in 10,000 vectors
- **Accuracy**: >95% recall for top-10 results
- **Scalability**: Supports up to 100,000 vectors per agent

### Memory Usage

- **Embeddings**: 384 floats × 4 bytes = ~1.5KB per message
- **10,000 messages**: ~15MB in memory
- **Disk Storage**: Compressed indices ~10MB per 10,000 messages

### Optimization Tips

1. **Adjust Similarity Threshold**: Higher threshold (0.7+) = fewer but more relevant results
2. **Time Windows**: Use `timeWindow` option to limit search to recent period
3. **Batch Storage**: Store multiple messages at once when possible
4. **Regular Cleanup**: Clear old memories periodically

## Configuration

### Environment Variables

No environment variables required! Everything runs locally.

### Tuning Parameters

**In `lib/memory/manager.ts`**:

```typescript
const context = await manager.retrieveContext(query, {
  maxRelevantMessages: 5,        // Max memories to retrieve
  similarityThreshold: 0.6,      // Min similarity (0-1)
  includeRecentMessages: 3,      // Always include N recent messages
  timeWindow: 7 * 24 * 60 * 60 * 1000  // Search within time window
});
```

**In `lib/memory/vector-store.ts`**:

```typescript
// Adjust max elements per index
await vectorStore.initialize(maxElements: 50000);

// Change auto-save interval (default: 5 minutes)
setInterval(() => saveAllStores(), 10 * 60 * 1000);
```

**In `lib/memory/embeddings.ts`**:

```typescript
// Change embedding model (requires model change)
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

// Adjust batch size for parallel processing
const batchSize = 10;  // Higher = faster but more memory
```

### Storage Location

Vector indices and metadata are stored in:
```
.vector-store/
├── {agentId1}.index          # HNSW index
├── {agentId1}.metadata.json  # Metadata and mappings
├── {agentId2}.index
└── {agentId2}.metadata.json
```

**Important**: Add `.vector-store/` to `.gitignore` to avoid committing large binary files.

## Examples

### Basic RAG Flow

```typescript
import { createMemoryManager } from "@/lib/memory/manager";

// Create manager
const manager = createMemoryManager(agentId, userId);

// User asks a question
const userMessage = "What was that restaurant recommendation?";

// Build prompt with relevant context
const enhancedPrompt = await manager.buildEnhancedPrompt(
  basePrompt,
  userMessage
);

// Enhanced prompt now includes:
// - Original system prompt
// - Relevant past conversations about restaurants
// - Relationship context

// Generate response with LLM
const response = await llm.generate({
  systemPrompt: enhancedPrompt,
  messages: [{ role: "user", content: userMessage }],
});

// Store the interaction
await manager.storeMessage(userMessage, "user");
await manager.storeMessage(response, "assistant");
```

### Manual Memory Search

```typescript
const manager = createMemoryManager(agentId, userId);

// Search for specific topic
const memories = await manager.searchMemories("birthday plans", 5);

console.log(`Found ${memories.length} relevant memories:`);
memories.forEach((memory) => {
  console.log(`[${memory.similarity.toFixed(2)}] ${memory.content}`);
});
```

### Memory Cleanup

```typescript
const manager = createMemoryManager(agentId, userId);

// Get stats before cleanup
const before = await manager.getStats();
console.log(`Memories before: ${before.totalMemories}`);

// Clear all memories
await manager.clearMemories();

// Verify
const after = await manager.getStats();
console.log(`Memories after: ${after.totalMemories}`);
```

## Troubleshooting

### Model Download Fails

**Problem**: First run downloads the model, might fail on slow connections.

**Solution**: The model is cached in `.cache/transformers/`. If download fails, delete the cache and try again. The model is ~80MB.

### Memory Search Returns No Results

**Problem**: No results even though relevant conversations exist.

**Solution**:
1. Check similarity threshold (try lowering to 0.5)
2. Verify memories are being stored (check stats endpoint)
3. Ensure embeddings are being generated (check logs)

### High Memory Usage

**Problem**: Application uses too much RAM.

**Solution**:
1. Reduce `maxElements` in vector store initialization
2. Clear old memories periodically
3. Use time windows to limit search scope

### Slow Embedding Generation

**Problem**: Embeddings take too long to generate.

**Solution**:
1. First run is slower (model loading) - subsequent runs are fast
2. Use batch processing for multiple messages
3. Consider upgrading CPU or using GPU

## Future Enhancements

- [ ] **Conversation Summarization**: Automatically summarize long conversations
- [ ] **Memory Importance Scoring**: Prioritize important memories
- [ ] **Cross-Agent Memory Sharing**: Share context between related agents
- [ ] **Multilingual Support**: Add support for non-English languages
- [ ] **GPU Acceleration**: Optional GPU support for faster embeddings
- [ ] **Memory Export**: Export memories as JSON/CSV
- [ ] **Memory Analytics**: Visualize memory distribution and clusters
- [ ] **Selective Forgetting**: Automatically prune less important memories
