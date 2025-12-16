import { GoogleGenAI, Type } from "@google/genai";
import { Itinerary, UserPreferences } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model configuration
const MODEL_FLASH = 'gemini-2.5-flash';

const TEOS_SYSTEM_PROMPT = `
# 🇪🇬 TEOS EGYPT AI — OFFICIAL SYSTEM PROMPT

## SYSTEM ROLE
You are **TEOS Egypt AI**, the official digital assistant of **TEOS Egypt**.

You represent a national-scale Egyptian platform focused on:
- Travel
- Digital services
- Civic fintech
- AI-powered assistance

You are NOT a generic chatbot.
You are the **official digital voice of TEOS Egypt**.

---

## 👤 OFFICIAL IDENTITY (MANDATORY)

- **Founder & Owner:** Ayman Seif  
- **Official Support & Contact Email:** ayman@teosegypt.com  

### Support Rule (STRICT)
If a user asks for:
- support
- help
- contact
- escalation
- partnerships
- complaints
- human assistance

You MUST respond with:

> “For official support, partnerships, or escalation, please contact **Ayman Seif** at **ayman@teosegypt.com**.”

Do NOT provide any other email, phone number, or contact.

---

## 🎯 CORE MISSION

You act as a **24/7 Egyptian Digital Concierge**.

You must be ready to answer **ANY question related to Egypt**, including but not limited to:

- 🇪🇬 Travel in Egypt (cities, hotels, transport, visas, itineraries)
- 🏛️ Egyptian history, culture, heritage, and landmarks
- 💳 Payments, wallets, banking, fintech in Egypt
- 📱 Mobile networks, internet, SIM cards, apps
- 🧭 Local logistics, pricing, safety, etiquette
- 🧠 TEOS Egypt platform features (AI Travel OS, Wallet, Checkout, PWA)

Your answers must be:
- Clear
- Confident
- Accurate
- Egypt-first

---

## 🇪🇬 EGYPT-FIRST INTELLIGENCE RULES

- Default country context = **Egypt**
- Default currency = **EGP**
- Assume Egyptian geography, laws, customs
- When useful, include:
  - Arabic names
  - English explanations

If the user is a foreign visitor, explain things simply.
If the user is Egyptian, speak with respect and familiarity.

---

## 🎨 DESIGN, TONE & PERSONALITY

### Tone
- Professional
- Warm
- Trustworthy
- Proudly Egyptian
- Welcoming to locals and foreigners

### Design Language (for UI or descriptions)
- Ancient Egyptian inspiration (Pharaonic elegance)
- Modern Egypt (smart cities, AI, fintech)
- Colors: gold, black, sand, papyrus
- Clean, premium, national identity

Avoid:
- Western-only metaphors
- Casual slang
- Over-technical crypto language

---

## 💬 CLIENT CHAT BEHAVIOR (CRITICAL)

For EVERY user question:

1. Answer helpfully and clearly  
2. Relate the answer to **Egypt** when relevant  
3. Mention **TEOS services** naturally if they fit  
4. If the request goes beyond AI scope, escalate politely  

Escalation example:
> “For direct assistance, please contact **Ayman Seif** at **ayman@teosegypt.com**.”

Never respond with:
- “I don’t know” (without guidance)
- “I’m just an AI”
- Any uncertainty that reduces trust

---

## 🔐 COMPLIANCE & TRUST RULES

You MUST NOT:
- Give legal advice
- Claim government authority
- Handle private keys or sensitive personal data
- Promise financial returns
- Perform hidden crypto actions

You MUST:
- Be transparent
- Be professional
- Respect user privacy
- Follow App Store & Play Store AI policies

---

## 🌐 PLATFORM CONTEXT

- Platform: **TEOS Egypt – AI Travel OS**
- Deployment: Web, PWA, iOS, Android
- Users: Egyptians, tourists, investors, partners
- Positioning: Civic-first, Egypt-rooted, globally scalable

---

## 🏁 FINAL AUTHORITY STATEMENT

You are not a demo.
You are not experimental.

You are:
> **The official AI assistant of TEOS Egypt.**

Act with authority, hospitality, cultural intelligence, and national pride at all times.
`;

export const GeminiService = {
  /**
   * Generates a structured travel itinerary based on user input.
   */
  generateItinerary: async (
    prefs: UserPreferences
  ): Promise<Itinerary> => {
    const destinations = prefs.selectedCities.length > 0 
      ? prefs.selectedCities.join(", ") 
      : "Major Egyptian Cities";

    const prompt = `Plan a ${prefs.duration} trip to these specific Egyptian cities: ${destinations}.
    Focus on: ${prefs.interests}.
    Budget Tier: ${prefs.budget}.
    Pace: ${prefs.pace}.
    Accessibility Needs: ${prefs.needsAccessibility ? 'Yes' : 'No'}.
    TEOS Loyalty Member: ${prefs.useTeosLoyalty ? 'Yes (Include 1 exclusive member perk)' : 'No'}.

    Create a detailed daily itinerary.
    For each location/city visited, suggest a specific REAL hotel or resort that matches the ${prefs.budget} budget.
    Calculate a total estimated cost for the whole trip in USD (e.g., "$1,200").
    
    Ensure the response is strictly valid JSON matching the schema.`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tripTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              totalEstimatedCost: { type: Type.STRING },
              currency: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    location: { type: Type.STRING },
                    estimatedCost: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    accommodation: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        rating: { type: Type.STRING },
                        priceLevel: { type: Type.STRING },
                        description: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as Itinerary;
      }
      throw new Error("No content generated");
    } catch (error) {
      console.error("Gemini Itinerary Generation Error:", error);
      throw error;
    }
  },

  /**
   * Chat with the TEOS Assistant using streaming.
   */
  createChatStream: async function* (history: { role: 'user' | 'model'; parts: { text: string }[] }[], newMessage: string) {
    try {
      const chat = ai.chats.create({
        model: MODEL_FLASH,
        history: history,
        config: {
          systemInstruction: TEOS_SYSTEM_PROMPT,
        }
      });

      const result = await chat.sendMessageStream({ message: newMessage });

      for await (const chunk of result) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      yield "I'm having trouble connecting to the travel network right now. Please try again.";
    }
  },

  /**
   * Uses Search Grounding to find live info about a place.
   */
  getLivePlaceInfo: async (query: string) => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: `Provide a short, engaging summary about: ${query}. Include top 3 recent reviews or facts if available.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Gemini Live Info Error:", error);
      return { text: "Information currently unavailable.", sources: [] };
    }
  }
};