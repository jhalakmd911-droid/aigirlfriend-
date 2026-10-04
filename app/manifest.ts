// app/manifest.ts
import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Girlfriend - Your Companion',
    short_name: 'AI Girlfriend',
    description: 'Your personal AI companion for chat, voice, photos, and memories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05030d',
    theme_color: '#05030d',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
