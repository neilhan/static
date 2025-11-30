# domains
## entities
- sentence
- conversation, array of sentences

## app features
- store user settings to browser local storage
- allow user to create a collection of conversations
- allow user to playback a conversation
- playback a conversation means using synthesis feature browser build in function

## plan
1. **Clarify entities**
   - Define pure `Sentence` and `Conversation` types.
   - Create functional helpers (e.g. `buildConversation`) to build conversations from sentences.
2. **User settings storage**
   - Wrap `localStorage` access in a pure interface returning new state + required side effects.
   - Validate serialized settings before applying them to the store.
3. **Conversation collection workflow**
   - Implement an immutable store slice (e.g. reducer) for CRUD on conversations.
   - Provide UI that composes sentences, previews conversations, and persists snapshots to storage.
4. **Playback implementation**
   - Encapsulate Web Speech API usage in a functional synth controller that emits declarative commands.
   - Add playback controls per conversation with sequencing that waits for speech completion.
5. **Cross-cutting tasks**
   - Write tests for entity helpers, storage serialization, and playback orchestration.
   - Document setup plus browser support/fallbacks in `README.md`.