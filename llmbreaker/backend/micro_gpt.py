"""
MicroGPT — ~7,900 parameter character-level transformer.

Architecture (per design doc Section 4):
  - Token embeddings:      vocab_size × n_embd   (65 × 16 = 1,040)
  - Positional embeddings: block_size × n_embd   (64 × 16 = 1,024)
  - 2 × TransformerBlock:
      LayerNorm1  (32)
      MultiHeadAttention (2 heads × 384 Q/K/V + 256 proj = 1,024)
      LayerNorm2  (32)
      FeedForward (16→64→16, 2,048)
  - Final LayerNorm: 32
  - Output head: weight-tied to token embeddings (0 extra params)
  Total: ~7,900 parameters
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class Head(nn.Module):
    """Single causal self-attention head."""

    def __init__(self, n_embd: int, head_size: int, block_size: int, dropout: float):
        super().__init__()
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.key   = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)

        # Lower-triangular causal mask (not a parameter)
        self.register_buffer(
            'tril',
            torch.tril(torch.ones(block_size, block_size))
        )
        self.dropout = nn.Dropout(dropout)

        # Captured after each forward pass for visualization
        self.last_attention: torch.Tensor | None = None

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, C = x.shape
        q = self.query(x)   # (B, T, head_size)
        k = self.key(x)     # (B, T, head_size)
        v = self.value(x)   # (B, T, head_size)

        head_size = q.shape[-1]
        # Scaled dot-product attention scores
        scores = q @ k.transpose(-2, -1) * (head_size ** -0.5)  # (B, T, T)

        # Apply causal mask
        scores = scores.masked_fill(self.tril[:T, :T] == 0, float('-inf'))

        # Softmax → attention weights
        attn_weights = F.softmax(scores, dim=-1)  # (B, T, T)

        # Capture for visualization (detach from graph, move to CPU)
        self.last_attention = attn_weights.detach().cpu()

        attn_weights = self.dropout(attn_weights)
        out = attn_weights @ v  # (B, T, head_size)
        return out


class MultiHeadAttention(nn.Module):
    """Multiple attention heads in parallel, then projected."""

    def __init__(self, n_embd: int, n_head: int, block_size: int, dropout: float):
        super().__init__()
        assert n_embd % n_head == 0, "n_embd must be divisible by n_head"
        head_size = n_embd // n_head
        self.heads = nn.ModuleList([
            Head(n_embd, head_size, block_size, dropout)
            for _ in range(n_head)
        ])
        self.proj    = nn.Linear(n_embd, n_embd, bias=False)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Run all heads, concatenate along embedding dim
        out = torch.cat([h(x) for h in self.heads], dim=-1)  # (B, T, n_embd)
        return self.dropout(self.proj(out))


class FeedForward(nn.Module):
    """Position-wise feed-forward: expand → ReLU → contract → dropout."""

    def __init__(self, n_embd: int, dropout: float):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd, bias=False),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd, bias=False),
            nn.Dropout(dropout),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class TransformerBlock(nn.Module):
    """One transformer block: pre-norm attention + pre-norm feedforward."""

    def __init__(self, n_embd: int, n_head: int, block_size: int, dropout: float):
        super().__init__()
        self.ln1 = nn.LayerNorm(n_embd)
        self.sa  = MultiHeadAttention(n_embd, n_head, block_size, dropout)
        self.ln2 = nn.LayerNorm(n_embd)
        self.ff  = FeedForward(n_embd, dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.sa(self.ln1(x))
        x = x + self.ff(self.ln2(x))
        return x


class MicroGPT(nn.Module):
    """
    Tiny character-level GPT (~7,900 parameters).

    Config keys:
        vocab_size  (int)   – number of unique characters
        n_embd      (int)   – embedding dimension (default 16)
        n_layer     (int)   – number of transformer blocks (default 2)
        n_head      (int)   – attention heads per block (default 2)
        block_size  (int)   – context length (default 64)
        dropout     (float) – dropout probability (default 0.0)
        weight_tying (bool) – tie output head to token embeddings (default True)
    """

    def __init__(self, config: dict):
        super().__init__()
        self.vocab_size  = config['vocab_size']
        self.n_embd      = config.get('n_embd', 16)
        self.n_layer     = config.get('n_layer', 2)
        self.n_head      = config.get('n_head', 2)
        self.block_size  = config.get('block_size', 64)
        dropout          = config.get('dropout', 0.0)

        # Embedding tables
        self.token_embedding_table    = nn.Embedding(self.vocab_size, self.n_embd)
        self.position_embedding_table = nn.Embedding(self.block_size, self.n_embd)

        # Transformer blocks
        self.blocks = nn.ModuleList([
            TransformerBlock(self.n_embd, self.n_head, self.block_size, dropout)
            for _ in range(self.n_layer)
        ])

        # Final layer norm
        self.ln_f = nn.LayerNorm(self.n_embd)

        # Language model head
        self.lm_head = nn.Linear(self.n_embd, self.vocab_size, bias=False)

        # Weight tying: share token embedding and output head weights
        if config.get('weight_tying', True):
            self.lm_head.weight = self.token_embedding_table.weight

        # Initialize weights
        self.apply(self._init_weights)

    def _init_weights(self, module: nn.Module):
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(
        self,
        idx: torch.Tensor,
        targets: torch.Tensor | None = None,
    ) -> tuple[torch.Tensor, torch.Tensor | None]:
        """
        Args:
            idx:     (B, T) token indices
            targets: (B, T) next-token targets (optional)

        Returns:
            logits: (B, T, vocab_size)
            loss:   scalar cross-entropy loss (None if no targets)
        """
        B, T = idx.shape
        assert T <= self.block_size, \
            f"Sequence length {T} exceeds block_size {self.block_size}"

        device = idx.device
        tok_emb = self.token_embedding_table(idx)                         # (B, T, C)
        pos_emb = self.position_embedding_table(
            torch.arange(T, device=device)
        )                                                                  # (T, C)
        x = tok_emb + pos_emb                                             # (B, T, C)

        for block in self.blocks:
            x = block(x)

        x = self.ln_f(x)
        logits = self.lm_head(x)                                          # (B, T, vocab_size)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.view(-1, self.vocab_size),
                targets.view(-1),
            )

        return logits, loss

    @torch.no_grad()
    def generate(
        self,
        idx: torch.Tensor,
        max_new_tokens: int,
        temperature: float = 1.0,
    ) -> torch.Tensor:
        """
        Autoregressively generate `max_new_tokens` tokens.

        Args:
            idx:            (1, T) seed context
            max_new_tokens: number of tokens to generate
            temperature:    sampling temperature (>1 = more random)

        Returns:
            (1, T + max_new_tokens) token tensor
        """
        for _ in range(max_new_tokens):
            # Crop to block_size
            idx_cond = idx[:, -self.block_size:]
            logits, _ = self.forward(idx_cond)
            # Take logits at the last time step
            logits = logits[:, -1, :] / temperature        # (1, vocab_size)
            probs  = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)  # (1, 1)
            idx = torch.cat([idx, idx_next], dim=1)
        return idx

    def extract_attention_weights(self) -> list[dict]:
        """
        Return the most recently captured attention matrices from all heads.

        Returns list of dicts:
            {'layer': int, 'head': int, 'matrix': List[List[float]]}
        """
        snapshots = []
        for layer_idx, block in enumerate(self.blocks):
            for head_idx, head in enumerate(block.sa.heads):
                if head.last_attention is None:
                    continue
                # Take the first example in the batch: (T, T)
                matrix = head.last_attention[0].numpy().tolist()
                snapshots.append({
                    'layer':  layer_idx,
                    'head':   head_idx,
                    'matrix': matrix,
                })
        return snapshots
