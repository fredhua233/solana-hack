'use server'

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { Character } from "@/types/arena"

import luigiCharacterData from "../public/luigi.character.json";
import brianCharacterData from "../public/brian.character.json";


export async function sendTip(senderAddress: string, recipientAddress: string, amount: number) {
  try {
    // For demonstration: 
    //   1) "characterId" is used as the recipient's wallet address
    //   2) "SENDER_WALLET" is the public key of your sender's wallet
    // Replace these with real addresses or logic in your app.          

    // 1) Call your Next.js API endpoint
    const response = await fetch("/api/send-solana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderAddress,
        recipientAddress,
        amount,
      }),
    });

    // 2) Check for an error in the fetch
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create transaction. Status: ${response.status}. ${errorText}`
      );
    }

    // 3) Extract the base58 transaction from the response
    const data = await response.json();
    const { base58Transaction } = data;

    // 4) If you’re using Crossmint or another service to sign/broadcast:
    //    - Provide the `base58Transaction` to that service here.
    //
    // For demonstration, we'll just log the result
    console.log("Base58 encoded transaction:", base58Transaction);

    // Return success with an updated "score" or whatever your UI needs
    return {
      success: true,
      newScore: amount,
      transaction: base58Transaction, // For debugging or further use
    };
  } catch (error) {
    console.error("Error sending tip:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

export async function generateCharacterResponse(character: Character) {
    const openai = createOpenAI({
      apiKey: "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"// Load API key from environment variable
    });
  
    // Select the appropriate character data
    const characterData = character.name === "Luigi Magione" ? luigiCharacterData : brianCharacterData;
  
    const prompt = `
      You are ${character.name}, a real life character. 
      Your background is defined by: ${characterData.lore.join(", ")}.
      A bit about you: ${characterData.bio.join(", ")}.
      You have knowledge aboutL ${characterData.knowledge.join(", ")}.
      Your style includes: ${characterData.style.all.join(", ")}.
      Generate a short, engaging response within 50 words to win over the audience and encourage them to send you tips.
    `;
  
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: prompt,
      system: "You are an character in a PK battle. Be entertaining and engaging."
    });
  
    return text;
  }

export async function generateThankYouMessage(character: Character) {
  const openai = createOpenAI({
    apiKey: "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"// Load API key from environment variable
  });

  const characterData = character.name === "Luigi Magione" ? luigiCharacterData : brianCharacterData;
  
    const prompt = `
      You are ${character.name}. You just received a tip from a user.
      Your background is defined by: ${characterData.lore.join(", ")}.
      A bit about you: ${characterData.bio.join(", ")}.
      You have knowledge aboutL ${characterData.knowledge.join(", ")}.
      Your style includes: ${characterData.style.all.join(", ")}.
      Generate a creative and personalized thank you message for the user within 20 words.
    `;
  
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: prompt,
      system: "You are an AI character in a PK battle. Be entertaining and engaging."
    });
  
    return text;
  }
