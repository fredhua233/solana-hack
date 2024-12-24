interface VoteProgressProps {
  leftScore: number
  rightScore: number
}

export default function VoteProgress({ leftScore, rightScore }: VoteProgressProps) {
  const total = leftScore + rightScore
  const leftPercentage = total === 0 ? 50 : (leftScore / total) * 100
  
  return (
    <div className="relative h-12">
      {/* Score displays */}
      <div className="absolute inset-0 flex justify-between items-center px-4 z-20">
        <div className="font-mono text-2xl text-black">{leftScore}</div>
        <div className="font-mono text-2xl text-black">{rightScore}</div>
      </div>
      
      {/* Progress bar container */}
      <div className="absolute inset-0 flex">
        {/* Left side (red) */}
        <div 
          className="h-full bg-[#942832] transition-all duration-500 ease-out"
          style={{ width: `${leftPercentage}%` }}
        />
        {/* Right side (blue) */}
        <div 
          className="h-full bg-[#105bcc] transition-all duration-500 ease-out"
          style={{ width: `${100 - leftPercentage}%` }}
        />
      </div>
      
      {/* Divider line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />
    </div>
  )
}

