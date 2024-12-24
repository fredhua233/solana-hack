'use client'

import { useState, useEffect } from 'react'
import { Character } from '../types/arena'
import { sendTip, generateCharacterResponse, generateThankYouMessage} from '../actions/arena-actions'
import VoteProgress from './vote-progress'
import BattleResults from './battle-results'
import CharacterChat from './character-chat'
import Image from 'next/image';


export default function Arena() {
  const [timeLeft, setTimeLeft] = useState(80) // 1:20 in seconds
  const [userWalletAddress, setUserWalletAddress] = useState('');
  const [tipAmount, setTipAmount] = useState(10); // Default tip amount
  const [isGameOver, setIsGameOver] = useState(false)
  const [characters, setCharacters] = useState<{
    left: Character
    right: Character
  }>({
    left: {
      id: '1',
      name: 'Luigi Magione',
      avatar: 'https://upcdn.io/FW25cFg/raw/luigi.gif',
      score: 0,
      tips: 0,
      wallet: 'Erq2wKwDXF7vEW8uNn2emUa8JuwCkfLX7rATjmnJ6NNj'
    },
    right: {
      id: '2',
      name: 'Brian Thompson',
      avatar: 'https://upcdn.io/FW25cFg/raw/brian.gif',
      score: 0,
      tips: 0,
      wallet: 'HvQp3SYY9qUKqyFZ3L8TfufZD62S5N6qq1itJM9f9RTd'
    }
  })

  const [messages, setMessages] = useState<{
    left: string[]
    right: string[]
  }>({
    left: [],
    right: []
  })

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsGameOver(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)

      // Generate AI responses every 10 seconds
      if (timeLeft % 10 === 0) {
        generateCharacterResponse(characters.left).then(response => {
          setMessages(prev => ({
            ...prev,
            left: [...prev.left, response]
          }))
        })
        generateCharacterResponse(characters.right).then(response => {
          setMessages(prev => ({
            ...prev,
            right: [...prev.right, response]
          }))
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, characters])

  const handleTip = async (characterId: string) => {
    // Assuming you have a way to get the sender's wallet address, e.g., from a state or context
    if (!userWalletAddress) {
      alert('Please enter your wallet address.');
      return;
    }
    const recipientAddress = characters[characterId === '1' ? 'left' : 'right'].wallet;
    const amount = tipAmount; // The tip amount

    const result = await sendTip(userWalletAddress, recipientAddress, amount);
    if (result.success) {
      setCharacters(prev => ({
        ...prev,
        [characterId === '1' ? 'left' : 'right']: {
          ...prev[characterId === '1' ? 'left' : 'right'],
          score: prev[characterId === '1' ? 'left' : 'right'].score + result.newScore!
        }
      }));

      const thankYouMessage = await generateThankYouMessage(characters[characterId === '1' ? 'left' : 'right']);
      setMessages(prev => ({
        ...prev,
        [characterId === '1' ? 'left' : 'right']: [...prev[characterId === '1' ? 'left' : 'right'], thankYouMessage]
      }));
    }
  }

  const handleRestart = () => {
    setTimeLeft(80);
    setIsGameOver(false);
    setMessages({ left: [], right: [] });
    setCharacters({
      left: { ...characters.left, score: 0, tips: 0 },
      right: { ...characters.right, score: 0, tips: 0 }
    });
  };

  if (isGameOver) {
    const winner = characters.left.score > characters.right.score ? characters.left : characters.right
    const loser = characters.left.score > characters.right.score ? characters.right : characters.left
    return <BattleResults winner={winner} loser={loser} onRestart={handleRestart} />
  }

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-center text-4xl font-bold mb-8">THE ARENA</h1>

        <div className="mb-4">
          <label htmlFor="walletAddress" className="block text-sm font-medium text-slate-100">
            Your Wallet Address
          </label>
          <input
            type="text"
            id="walletAddress"
            name="walletAddress"
            value={userWalletAddress}
            onChange={(e) => setUserWalletAddress(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="Enter your public wallet address"
          />
        </div>

        {/* Vote Progress Bar */}
        <div className="mb-8 mt-4">
          <VoteProgress
            leftScore={characters.left.score}
            rightScore={characters.right.score}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tipAmount" className="block text-sm font-medium text-slate-100">
            Select Tip Amount
          </label>
          <select
            id="tipAmount"
            name="tipAmount"
            value={tipAmount}
            onChange={(e) => setTipAmount(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value={10}>$1</option>
            <option value={20}>$2</option>
            <option value={50}>$5</option>
            <option value={100}>$10</option>
          </select>
        </div>


        <div className="grid grid-cols-2 gap-4">
          {/* Left Character */}
          <div className="bg-gradient-to-r from-[#942832] to-transparent p-6 rounded-lg">
            <div className="text-2xl font-bold mb-4">{characters.left.name}</div>
            <Image
              src={characters.left.avatar}
              alt={characters.left.name}
              width={400}
              height={400}
              className="w-full aspect-square object-cover rounded-lg mb-4"
            />
            <div className="text-4xl font-mono mb-4">{characters.left.score}</div>
            <button
              onClick={() => handleTip(characters.left.id)}
              className="w-full bg-[#ff4656] text-white py-3 rounded-lg font-mono"
            >
              SEND ${tipAmount} TIPS IN $XXX
            </button>
            <div className="mt-4">
              <CharacterChat
                character={characters.left}
                messages={messages.left}
              />
            </div>
          </div>

          {/* Right Character */}
          <div className="bg-gradient-to-l from-[#105bcc] to-transparent p-6 rounded-lg">
            <div className="text-2xl font-bold mb-4">{characters.right.name}</div>
            <Image
              src={characters.right.avatar}
              alt={characters.right.name}
              width={400}
              height={400}
              className="w-full aspect-square object-cover rounded-lg mb-4"
            />
            <div className="text-4xl font-mono mb-4">{characters.right.score}</div>
            <button
              onClick={() => handleTip(characters.right.id)}
              className="w-full bg-[#146ef5] text-white py-3 rounded-lg font-mono"
            >
              SEND ${tipAmount} TIPS IN $XXX
            </button>
            <div className="mt-4">
              <CharacterChat
                character={characters.right}
                messages={messages.right}
              />
            </div>
          </div>
        </div>
        {/* Timer */}
        <div className="text-center mt-8">
          <div className="text-2xl font-mono mb-2">TIME LEFT</div>
          <div className="text-6xl font-mono">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}

