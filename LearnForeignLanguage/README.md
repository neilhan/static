# Learn Foreign Language - Conversation Trainer

## Features

- **Conversation Editor**: Write conversations in a simple text format.
- **Parsing**: Automatically separates conversations by empty lines and translations by hyphens (`-`).
- **Collections**: Organize conversations into multiple collections.
- **Playback**: Listen to the target language pronunciation using browser text-to-speech.
- **Native Translation**: Toggle to play the native translation after each sentence.
- **Repetition Pause**: Toggle to include a pause matching the duration of the target speech for repetition.
- **Persistence**: Automatically saves your work to local storage.
- **Spaced Repetition (SRS)**: Tracks review times for each conversation to optimize recall.

## Data Structure

```mermaid
classDiagram
    class AppState {
        ConversationCollection[] collections
        string activeCollectionId
    }
    class ConversationCollection {
        string id
        string name
        string rawInput
        Conversation[] conversations
        string targetVoiceURI
        string targetLang
        string nativeVoiceURI
        string nativeLang
        PlaybackSettings playbackSettings
        Record~string, SRSData~ srsData
    }
    class PlaybackSettings {
        boolean playNative
        boolean includePause
    }
    class Conversation {
        string id
        string contentHash
        Sentence[] sentences
    }
    class Sentence {
        string target
        string native
    }
    class SRSData {
        number lastReviewed
        number nextReview
        number interval
        number repetition
        number easeFactor
    }
    AppState --> ConversationCollection
    ConversationCollection --> PlaybackSettings
    ConversationCollection --> Conversation
    ConversationCollection --> SRSData : map by contentHash
    Conversation --> Sentence
```

## Development

To run this project:

```bash
pnpm install
pnpm dev
```

## Planned Features

- Highlight sentence being played (Implemented)
- Playback from cursor position (Implemented)
- Visual indicator for SRS due date
