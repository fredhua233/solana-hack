export interface Character {
  id: string
  name: string
  avatar: string
  score: number
  tips: number
  wallet: string
}

export interface ArenaState {
  timeLeft: number
  isActive: boolean
  characters: {
    left: Character
    right: Character
  }
}

