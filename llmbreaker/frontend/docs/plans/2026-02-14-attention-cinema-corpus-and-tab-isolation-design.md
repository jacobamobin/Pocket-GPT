# Attention Cinema Corpus + Per-Tab Model Isolation Design

**Goal:** Add corpus selection/upload to AttentionCinemaTab, show model debug info panel, remove settings gear, and filter the ModelDropdown to show only models for the active tab's feature type.

**Architecture:** AttentionCinemaTab gains DatasetSelector + TextInputPanel for corpus; a ModelInfoCard component shows n_layer/n_head/n_embd/vocab/params from session.modelConfig. ModelDropdown reads activeTab from UIContext to filter models by feature_type.

**Tech Stack:** React, existing DatasetSelector/TextInputPanel shared components, UIContext activeTab.

---

## Changes

### AttentionCinemaTab
- Add DatasetSelector (built-in datasets) + TextInputPanel (paste/upload custom text) in the top row
- Store `datasetId` + `text` + `uploadedId` state; pass to `createSession`
- Remove `onOpenConfig` from TrainingControls (or confirm it's not passed)
- Add ModelInfoCard below TrainingControls that shows model architecture stats when session exists

### ModelInfoCard (new shared component)
- Shows: n_layer, n_head, n_embd, vocab_size, block_size, total params estimate
- Only renders when modelConfig is available

### ModelDropdown
- Read `ui.activeTab` from UIContext
- Map activeTab → feature_type string
- Filter `models` list to only show entries where `model.feature_type === currentFeatureType`
- "Save current model" section only shows active session matching current tab
