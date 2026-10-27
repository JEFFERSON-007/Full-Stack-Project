require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const UserModel = require('./models/User');
const CollectionModel = require('./models/Collection');
const NoteModel = require('./models/Note');
const NoteRevisionModel = require('./models/NoteRevision');
const MindMapModel = require('./models/MindMap');

const seedData = async () => {
  console.log('🌱 Starting Folio Knowledge Base Seeding...');
  await connectDB();

  // Clean existing demo data
  const DEMO_EMAIL = 'alex.chen@folio.workspace';
  
  const existingUser = await UserModel.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    const userId = existingUser._id || existingUser.id;
    console.log(`Cleaning previous data for ${DEMO_EMAIL}...`);
    await NoteModel.deleteMany({ user: userId });
    await CollectionModel.deleteMany({ user: userId });
    await NoteRevisionModel.deleteMany({ user: userId });
    await MindMapModel.deleteMany({ user: userId });
    await UserModel.findByIdAndDelete(userId);
  }

  // 1. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('folio2026', salt);

  const demoUser = await UserModel.create({
    name: 'Alex Chen',
    email: DEMO_EMAIL,
    password: hashedPassword,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    preferences: {
      theme: 'warm',
      defaultView: 'grid'
    }
  });

  const userId = demoUser._id || demoUser.id;
  console.log(`👤 Created Demo User: ${demoUser.name} (${demoUser.email})`);

  // 2. Create Collections
  const colCS = await CollectionModel.create({
    user: userId,
    name: 'Computer Science Core',
    description: 'Algorithms, data structures, and computer science foundations.',
    color: '#596A50',
    icon: 'binary'
  });

  const colArchitecture = await CollectionModel.create({
    user: userId,
    name: 'System Architecture',
    description: 'Cloud design, microservices, distributed systems, and AWS pipelines.',
    color: '#BF765C',
    icon: 'cpu'
  });

  const colWeb = await CollectionModel.create({
    user: userId,
    name: 'Modern Web Engineering',
    description: 'React, TypeScript, state management, and modern browser APIs.',
    color: '#D99B26',
    icon: 'globe'
  });

  const colAI = await CollectionModel.create({
    user: userId,
    name: 'Machine Learning & AI',
    description: 'Neural networks, embeddings, transformers, and model evaluation.',
    color: '#4E7271',
    icon: 'sparkles'
  });

  const colProjects = await CollectionModel.create({
    user: userId,
    name: 'Project Ideas & Research',
    description: 'Architectural spikes, full-stack blueprints, and product experiments.',
    color: '#6E6D66',
    icon: 'lightbulb'
  });

  console.log('📁 Created 5 Knowledge Collections.');

  // 3. Create First Wave of Notes (so we can cross-link them)
  const note1 = await NoteModel.create({
    user: userId,
    title: 'JavaScript Event Loop & Microtask Concurrency',
    content: `# JavaScript Event Loop & Microtask Queue

JavaScript runs on a single-threaded event loop, yet handles high-throughput asynchronous I/O via the call stack, Web APIs, and two primary task queues:

1. **Call Stack**: Synchronous execution frames.
2. **Microtask Queue**: Promises (\`.then\`, \`.catch\`, \`await\`), \`queueMicrotask()\`, and \`MutationObserver\`. Microtasks have priority and run *immediately* after the current script executes, draining completely before the next macrotask.
3. **Macrotask Queue**: \`setTimeout\`, \`setInterval\`, \`setImmediate\`, and DOM events.

### Execution Example
When an async function awaits a Promise, the engine yields control and registers the resumption as a microtask:

\`\`\`javascript
console.log('1: Sync script start');

setTimeout(() => {
  console.log('4: Macrotask timer executed');
}, 0);

Promise.resolve().then(() => {
  console.log('2: Microtask 1 resolved');
}).then(() => {
  console.log('3: Microtask 2 chained');
});

console.log('Sync script end');
\`\`\`

**Key Takeaway**: Heavy tasks inside microtasks can starve the event loop and freeze UI rendering. Always batch intensive calculations using \`requestAnimationFrame\` or web workers.`,
    type: 'code',
    codeLanguage: 'javascript',
    tags: ['javascript', 'concurrency', 'v8', 'event-loop', 'performance'],
    collectionId: colWeb._id || colWeb.id,
    isFavorite: true,
    isPinned: true,
    createdAt: new Date(Date.now() - 17 * 86400000),
    updatedAt: new Date(Date.now() - 16 * 86400000),
    relatedNotes: []
  });

  const note2 = await NoteModel.create({
    user: userId,
    title: 'Data Structures: Hash Tables & Collision Resolution',
    content: `# Hash Tables & Amortized O(1) Lookups

Hash tables map arbitrary keys to fixed integer indices via hash functions. When two keys produce the same bucket index, collision resolution determines performance:

### Resolution Strategies
- **Separate Chaining**: Each bucket points to a linked list (or balanced red-black tree when chain length > 8, as in Java's HashMap). Worst case lookup: O(log N).
- **Open Addressing (Linear/Quadratic Probing)**: If bucket is occupied, probe step \`k\` spaces forward. Sensitive to clustering and load factor (\`α = n/k\`).
- **Robin Hood Hashing**: Balances search variance by stealing from the rich (short probe distance) and giving to the poor.

### Complexity Matrix
| Operation | Average | Worst Case |
|---|---|---|
| Search | O(1) | O(N) |
| Insert | O(1) | O(N) |
| Delete | O(1) | O(N) |

Space complexity is O(N) where table resizes typically at load factor \`α > 0.75\`.`,
    type: 'text',
    tags: ['algorithms', 'data-structures', 'hash-table', 'cs-core'],
    collectionId: colCS._id || colCS.id,
    isFavorite: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 14 * 86400000),
    updatedAt: new Date(Date.now() - 13 * 86400000),
    relatedNotes: []
  });

  const note3 = await NoteModel.create({
    user: userId,
    title: 'AWS Data Engineering: Serverless Streaming Architecture',
    content: `# Serverless Streaming Data Pipeline on AWS

Designing real-time event ingestion for IoT telemetry and user clickstream without managing EC2 instances.

### Architectural Blueprint
\`\`\`
[Data Producers] 
       │ (JSON Payloads via HTTPS)
       ▼
[Amazon Kinesis Data Streams] 
       │ (Sharded Partition Keys)
       ▼
[AWS Lambda Consumers] ────► [Amazon DynamoDB] (Hot Store O(1) queries)
       │
       ▼
[Amazon Kinesis Data Firehose] 
       │ (Buffered Parquet format conversion)
       ▼
[Amazon S3 Data Lake] ────► [AWS Glue Catalog] ────► [Amazon Athena (SQL)]
\`\`\`

### Design Considerations
- **Partition Key Selection**: Ensure high cardinality (e.g., \`deviceId_timestamp\`) to prevent hot shards.
- **Backpressure & Dead-Letter Queues (DLQ)**: Configure SQS DLQ on Lambda triggers to safely isolate corrupted messages.
- **Cost Optimization**: Firehose automatic gzip compression reduces S3 storage costs by ~75%.`,
    type: 'research',
    tags: ['aws', 'data-engineering', 'kinesis', 'serverless', 'system-design'],
    collectionId: colArchitecture._id || colArchitecture.id,
    isFavorite: true,
    isPinned: true,
    createdAt: new Date(Date.now() - 10 * 86400000),
    updatedAt: new Date(Date.now() - 9 * 86400000),
    relatedNotes: []
  });

  const note4 = await NoteModel.create({
    user: userId,
    title: 'Machine Learning: Transformer Attention & Self-Attention',
    content: `# The Transformer Architecture: Attention Is All You Need

Traditional RNNs process tokens sequentially, creating bottleneck gradients and preventing parallelization across long contexts. Transformers solve this with **Scaled Dot-Product Attention**:

### Mathematical Formulation
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

- **Queries ($Q$)**: What the current token is seeking.
- **Keys ($K$)**: What other tokens offer.
- **Values ($V$)**: The actual information payload.
- **Scaling Factor $\\sqrt{d_k}$**: Prevents the dot product from growing too large in high dimensions, which would cause vanishing gradients in the softmax.

### Multi-Head Attention
Instead of performing a single attention function, Multi-Head Attention projects $Q, K, V$ into $h$ distinct representation subspaces, enabling the model to jointly attend to semantic syntax, coreference, and positional relationships.`,
    type: 'research',
    tags: ['machine-learning', 'transformers', 'ai', 'deep-learning', 'math'],
    collectionId: colAI._id || colAI.id,
    isFavorite: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 7 * 86400000),
    updatedAt: new Date(Date.now() - 6 * 86400000),
    relatedNotes: []
  });

  const note5 = await NoteModel.create({
    user: userId,
    title: 'Full Stack Project: Offline-First Local-First Knowledge Engine',
    content: `# Project Spec: Local-First CRDT Knowledge Workspace

A study on building high-performance offline-first web applications using Conflict-free Replicated Data Types (CRDTs).

### Core Pillars
1. **Zero-Latency Interactions**: All mutations apply immediately to IndexedDB via local state.
2. **Peer-to-Peer Sync**: Optional WebRTC synchronization with central fallback via WebSocket.
3. **Graph Traversal**: Notes form a directed acyclic graph (DAG) traversed via bidirectional links.

### Tech Stack
- Frontend: React + TypeScript + Canvas
- CRDT Engine: Yjs or Automerge
- Vector Indexing: Local client-side embeddings via Transformers.js in Web Workers.
- Storage: OPFS (Origin Private File System) and SQLite WASM.`,
    type: 'text',
    tags: ['full-stack', 'project-ideas', 'crdt', 'local-first', 'architecture'],
    collectionId: colProjects._id || colProjects.id,
    isFavorite: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 4 * 86400000),
    updatedAt: new Date(Date.now() - 3 * 86400000),
    relatedNotes: []
  });

  const note6 = await NoteModel.create({
    user: userId,
    title: 'Refined Typography & Micro-Interactions Reference',
    content: `# Digital Editorial Typography & Design Principles

A curated compilation of web interface guidelines, color theory, and typographic hierarchy for software craftsmen:

- **Type Scale Ratio**: Major Second (1.125) or Minor Third (1.2) prevents jarring transitions between headings and body text.
- **Line Length (Measure)**: 55 to 75 characters per line ensures effortless optical tracking across paragraphs.
- **Color Harmony**: Monochromatic neutral backgrounds (warm stone/ivory) with muted organic accents (forest olive, terracotta) reduce visual fatigue.

Resource: https://practicaltypography.com/`,
    type: 'link',
    sourceUrl: 'https://practicaltypography.com/',
    tags: ['design', 'typography', 'ux', 'css', 'design-system'],
    collectionId: colWeb._id || colWeb.id,
    isFavorite: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 2 * 86400000),
    updatedAt: new Date(Date.now() - 1 * 86400000),
    relatedNotes: []
  });

  const note7 = await NoteModel.create({
    user: userId,
    title: 'Distributed Consensus: Raft vs Multi-Paxos Protocol',
    content: `# Raft vs Multi-Paxos in Distributed Systems

Consensus algorithms allow a collection of machines to work as a coherent group that can survive failures of some of its members.

### Core Differences
- **Decomposed States**: Raft explicitly separates Leader Election, Log Replication, and Safety invariants.
- **Leader Invariance**: In Raft, a leader is only elected if it possesses all committed log entries from prior terms (Leader Completeness Property).
- **Membership Changes**: Raft utilizes joint consensus transition phases to dynamically reconfigure clusters without downtime.

### Production Implementations
- **Etcd**: Raft in Go (Kubernetes control plane)
- **CockroachDB**: Multi-Raft consensus per range
- **Chubby**: Paxos lock service at Google`,
    type: 'research',
    tags: ['distributed-systems', 'consensus', 'raft', 'system-design'],
    collectionId: colArchitecture._id || colArchitecture.id,
    isFavorite: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 1 * 86400000),
    updatedAt: new Date(Date.now() - 12 * 3600000),
    relatedNotes: []
  });

  // Cross-link notes to construct a rich, meaningful Knowledge Graph!
  console.log('🔗 Constructing Knowledge Graph relationships...');
  await NoteModel.findByIdAndUpdate(note1._id || note1.id, {
    relatedNotes: [note2._id || note2.id, note5._id || note5.id]
  });

  await NoteModel.findByIdAndUpdate(note2._id || note2.id, {
    relatedNotes: [note1._id || note1.id, note3._id || note3.id]
  });

  await NoteModel.findByIdAndUpdate(note3._id || note3.id, {
    relatedNotes: [note2._id || note2.id, note5._id || note5.id]
  });

  await NoteModel.findByIdAndUpdate(note4._id || note4.id, {
    relatedNotes: [note2._id || note2.id, note3._id || note3.id]
  });

  await NoteModel.findByIdAndUpdate(note7._id || note7.id, {
    relatedNotes: [note3._id || note3.id, note2._id || note2.id, note5._id || note5.id]
  });

  await NoteModel.findByIdAndUpdate(note5._id || note5.id, {
    relatedNotes: [note1._id || note1.id, note3._id || note3.id, note6._id || note6.id]
  });

  await NoteModel.findByIdAndUpdate(note6._id || note6.id, {
    relatedNotes: [note1._id || note1.id, note5._id || note5.id]
  });

  // 4. Create Revisions for realistic history
  console.log('📜 Recording note version revisions...');
  const note1Id = note1._id || note1.id;
  await NoteRevisionModel.create({
    noteId: note1Id,
    user: userId,
    title: 'JavaScript Event Loop Basics',
    content: 'Initial notes on single-threaded execution and call stacks.',
    type: 'text',
    tags: ['javascript', 'basics'],
    changeSummary: 'Initial draft before adding microtasks',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  await NoteRevisionModel.create({
    noteId: note1Id,
    user: userId,
    title: 'JavaScript Event Loop & Microtask Concurrency',
    content: note1.content,
    type: 'code',
    tags: note1.tags,
    changeSummary: 'Added code demonstration and performance considerations',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  });

  // 5. Create a pre-populated Mind Map
  console.log('🧠 Creating interactive Mind Map...');
  await MindMapModel.create({
    user: userId,
    name: 'Full Stack Engineering Architecture Roadmap',
    description: 'Master breakdown of computer science, distributed cloud systems, and modern frontend design.',
    nodes: [
      {
        id: 'node-root',
        type: 'mindMapNode',
        position: { x: 400, y: 250 },
        data: {
          label: 'Full Stack Engineering',
          isRoot: true,
          color: '#596A50',
          noteId: note5._id || note5.id,
          noteTitle: note5.title
        }
      },
      {
        id: 'node-cs',
        type: 'mindMapNode',
        position: { x: 120, y: 100 },
        data: {
          label: 'CS Core & Algorithms',
          color: '#596A50',
          noteId: note2._id || note2.id,
          noteTitle: note2.title
        }
      },
      {
        id: 'node-web',
        type: 'mindMapNode',
        position: { x: 120, y: 380 },
        data: {
          label: 'Modern Web & V8 Engine',
          color: '#D99B26',
          noteId: note1._id || note1.id,
          noteTitle: note1.title
        }
      },
      {
        id: 'node-cloud',
        type: 'mindMapNode',
        position: { x: 680, y: 100 },
        data: {
          label: 'Cloud & Distributed Streaming',
          color: '#BF765C',
          noteId: note3._id || note3.id,
          noteTitle: note3.title
        }
      },
      {
        id: 'node-ai',
        type: 'mindMapNode',
        position: { x: 680, y: 380 },
        data: {
          label: 'Machine Learning & Embeddings',
          color: '#4E7271',
          noteId: note4._id || note4.id,
          noteTitle: note4.title
        }
      }
    ],
    edges: [
      { id: 'edge-root-cs', source: 'node-root', target: 'node-cs', animated: true },
      { id: 'edge-root-web', source: 'node-root', target: 'node-web', animated: true },
      { id: 'edge-root-cloud', source: 'node-root', target: 'node-cloud', animated: true },
      { id: 'edge-root-ai', source: 'node-root', target: 'node-ai', animated: true }
    ]
  });

  console.log('\n========================================================');
  console.log('✅ Demo Seed Data Created Successfully!');
  console.log(`👤 Demo Account: ${DEMO_EMAIL}`);
  console.log('🔑 Password: folio2026');
  console.log('========================================================\n');
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = seedData;
