import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import InfoIcon from '../shared/InfoIcon'

// ── Char group classification ─────────────────────────────────────────────────
const CHAR_GROUPS = {
  vowels:      new Set('aeiouAEIOU'),
  consonants:  new Set('bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'),
  digits:      new Set('0123456789'),
  punctuation: new Set('.,;:!?\'"()-'),
  whitespace:  new Set(' \t\n\r'),
}

const GROUP_META = {
  vowels:      { label: 'Vowel',       hex: 0x60a5fa, css: '#60a5fa' },
  consonants:  { label: 'Consonant',   hex: 0x34d399, css: '#34d399' },
  digits:      { label: 'Digit',       hex: 0xfbbf24, css: '#fbbf24' },
  punctuation: { label: 'Punctuation', hex: 0xf472b6, css: '#f472b6' },
  whitespace:  { label: 'Whitespace',  hex: 0x94a3b8, css: '#94a3b8' },
  other:       { label: 'Other',       hex: 0xa78bfa, css: '#a78bfa' },
}

function getGroup(ch) {
  if (CHAR_GROUPS.vowels.has(ch))      return 'vowels'
  if (CHAR_GROUPS.consonants.has(ch))  return 'consonants'
  if (CHAR_GROUPS.digits.has(ch))      return 'digits'
  if (CHAR_GROUPS.punctuation.has(ch)) return 'punctuation'
  if (CHAR_GROUPS.whitespace.has(ch))  return 'whitespace'
  return 'other'
}

// ── Math helpers ──────────────────────────────────────────────────────────────
function dist3(a, b) {
  const dx = a[0]-b[0], dy = a[1]-b[1], dz = a[2]-b[2]
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

function cosineSim(a, b) {
  let dot = 0, ma = 0, mb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; ma += a[i]*a[i]; mb += b[i]*b[i] }
  const denom = Math.sqrt(ma) * Math.sqrt(mb)
  return denom === 0 ? 0 : dot / denom
}

function knn(idx, coords, k = 4) {
  const base = coords[idx]
  return coords
    .map((c, i) => ({ i, d: i === idx ? Infinity : dist3(base, c) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map(x => x.i)
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

// ── Stub component ────────────────────────────────────────────────────────────
export default function EmbeddingStarMap({ embeddingSnapshots = [], vocabInfo }) {
  return (
    <div className="card">
      <p className="text-slate-500 text-xs">scaffold only — scene coming in next task</p>
    </div>
  )
}
