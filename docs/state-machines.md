# State Machines

## Resume → Career Matches (Durable + Streaming)

```mermaid
stateDiagram-v2
    [*] --> Landing
    Landing --> UploadResume: user selects file
    UploadResume --> ValidateResume
    ValidateResume --> ValidationFailed: invalid file/size/format
    ValidationFailed --> UploadResume: user retries

    ValidateResume --> ParseResume
    ParseResume --> ExtractProfile
    ParseResume --> ParseFailed: unreadable/unsupported
    ParseFailed --> UploadResume: user retries

    ExtractProfile --> PersistProfile
    PersistProfile --> TriggerJobFetch: durable workflow start

    TriggerJobFetch --> JobFetchQueued
    JobFetchQueued --> JobFetchRunning
    JobFetchRunning --> JobFetchFailed
    JobFetchFailed --> RetryJobFetch: retry/backoff
    RetryJobFetch --> JobFetchQueued
    JobFetchRunning --> JobsFetched

    JobsFetched --> AnalysisQueued
    AnalysisQueued --> AnalysisRunning
    AnalysisRunning --> AnalysisFailed
    AnalysisFailed --> RetryAnalysis: retry/backoff
    RetryAnalysis --> AnalysisQueued

    AnalysisRunning --> StreamResults
    StreamResults --> RenderResults
    RenderResults --> ResultsExplore
    ResultsExplore --> Done

    Done --> [*]
```

**Notes**
- Durable work begins at `TriggerJobFetch` and continues through `AnalysisRunning`.
- UI renders from a stream (`StreamResults`) instead of polling.
- Failures are retryable where the workflow can safely resume.

## Results Exploration (Filters + Sorts)

```mermaid
stateDiagram-v2
    [*] --> ResultsLoaded
    ResultsLoaded --> Idle

    Idle --> ApplyFilter: user selects filter
    Idle --> ApplySort: user changes sort
    Idle --> UpdateSearch: keyword change
    Idle --> ChangePage: pagination
    Idle --> ClearAll: reset filters/sorts

    ApplyFilter --> QueryUpdate
    ApplySort --> QueryUpdate
    UpdateSearch --> QueryUpdate
    ChangePage --> QueryUpdate
    ClearAll --> QueryUpdate

    QueryUpdate --> FetchResults
    FetchResults --> RenderResults
    RenderResults --> Idle

    FetchResults --> FetchFailed
    FetchFailed --> Idle: show error, allow retry
```

**Notes**
- Query state is derived from filters + sort + pagination, not ad-hoc local state.
- Keep the fetch read-only; avoid writing anything during filter/sort changes.

## Resume Improvement (Inline Editing)

```mermaid
stateDiagram-v2
    [*] --> OpenEditor
    OpenEditor --> LoadResume
    LoadResume --> AnalyzeResume

    AnalyzeResume --> StreamSuggestions
    StreamSuggestions --> SuggestionsReady
    AnalyzeResume --> AnalysisFailed
    AnalysisFailed --> AnalyzeResume: retry/backoff

    SuggestionsReady --> EditResume
    EditResume --> ValidateEdits
    ValidateEdits --> SaveDraft
    ValidateEdits --> EditError: invalid format/constraints
    EditError --> EditResume

    SaveDraft --> VersionSnapshot
    VersionSnapshot --> RecomputeMatches: optional re-run
    RecomputeMatches --> ResultsLoaded
```

**Notes**
- Suggestions can stream into the editor so the user can start editing early.
- Every save creates a snapshot for undo/compare and future scoring.
