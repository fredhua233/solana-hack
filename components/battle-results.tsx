import { Character } from '../types/arena'
import { Button } from "@/components/ui/button"
import Image from 'next/image';

interface BattleResultsProps {
  winner: Character
  loser: Character
  onRestart: () => void
}

export default function BattleResults({ winner, loser, onRestart }: BattleResultsProps) {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-center text-4xl font-bold mb-8">THE ARENA</h1>
        
        <div className="relative">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#942832] via-transparent to-[#105bcc]" />
          
          {/* Content */}
          <div className="relative z-10 text-center py-12">
            <div className="text-2xl font-mono mb-4">WINNER</div>
            <h2 className="text-6xl font-mono mb-8">{winner.name}</h2>
            
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <Image 
                  src={winner.avatar} 
                  alt={winner.name}
                  className="w-full aspect-square object-cover rounded-lg mb-4"
                />
                <div className="text-4xl font-mono text-[#942832]">
                  WINNER {winner.score}
                </div>
              </div>
              <div>
                <Image 
                  src={loser.avatar} 
                  alt={loser.name}
                  className="w-full aspect-square object-cover rounded-lg mb-4 opacity-50"
                />
                <div className="text-4xl font-mono text-[#105bcc]">
                  {loser.score}
                </div>
              </div>
            </div>
            <div className="mt-12">
              <Button 
                onClick={onRestart}
                className="bg-white text-black hover:bg-white/90 font-mono text-lg px-8 py-6"
                aria-label="Restart battle"
              >
                RESTART BATTLE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

