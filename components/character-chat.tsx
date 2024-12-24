'use client'

import { Character } from '../types/arena'

interface CharacterChatProps {
  character: Character
  messages?: string[]
}

export default function CharacterChat({ character, messages = [] }: CharacterChatProps) {
  return (
    <div className="bg-black/50 p-4 rounded-lg h-[200px] overflow-y-auto">
      {messages.map((message, index) => (
        <div key={index} className="mb-2">
          <span className="font-bold">{character.name}:</span> {message}
        </div>
      ))}
    </div>
  )
}

