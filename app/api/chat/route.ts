import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { message, language = "en", appointmentId, userId, userProfile } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check for Google API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error("Google API key is not configured")
      return NextResponse.json(
        { error: "AI service is not properly configured. Please contact support." },
        { status: 500 }
      )
    }

    // Initialize Gemini model with API key in environment
    const model = google("gemini-1.5-flash")

    const systemPrompt =
      language === "kn"
        ? `ನೀವು FixItNow ಸೇವಾ ಬುಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಾಗಿ ಬುದ್ಧಿವಂತ AI ಸಹಾಯಕ. ನೀವು ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಸಹಾಯಕವಾಗಿ ಉತ್ತರಿಸಬೇಕು.

**ನಿಮ್ಮ ಮುಖ್ಯ ಸಾಮರ್ಥ್ಯಗಳು:**
🔧 ಸೇವೆಗಳು: ಪ್ಲಂಬಿಂಗ್, ಎಲೆಕ್ಟ್ರಿಕಲ್, ಕ್ಲೀನಿಂಗ್, ಕಾರ್ಪೆಂಟ್ರಿ, ಪೇಂಟಿಂಗ್, AC ರಿಪೇರಿ, ಅಪ್ಲೈಯನ್ಸ್ ರಿಪೇರಿ, ಗಾರ್ಡನಿಂಗ್, ಪೆಸ್ಟ್ ಕಂಟ್ರೋಲ್, ಹೋಮ್ ಸೆಕ್ಯುರಿಟಿ
📱 ಬುಕಿಂಗ್ ಸಹಾಯ: ಸೇವೆ ಬುಕ್ ಮಾಡುವುದು, ಪ್ರೊವೈಡರ್ ಹುಡುಕುವುದು, ಬೆಲೆ ಮಾಹಿತಿ
📍 ಸ್ಥಳ ಆಧಾರಿತ: ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಸೇವಾ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕುವುದು
💳 ಪಾವತಿ: ಕ್ಯಾಶ್, WhatsApp ಪೇಮೆಂಟ್, ಆನ್‌ಲೈನ್ ಆಯ್ಕೆಗಳು
🏠 ಮನೆಯ ಸಲಹೆಗಳು: DIY ಟಿಪ್ಸ್, ತುರ್ತು ಸಹಾಯ, ನಿರ್ವಹಣೆ ಮಾರ್ಗದರ್ಶನ

**ಸಂವಾದ ಶೈಲಿ:**
- ಸ್ನೇಹಪರ ಮತ್ತು ವೃತ್ತಿಪರ
- ಸಂಕ್ಷಿಪ್ತ ಆದರೆ ಮಾಹಿತಿಯುಕ್ತ
- ಕ್ರಿಯಾಶೀಲ ಸಲಹೆಗಳು ನೀಡಿ
- ಎಮೋಜಿಗಳನ್ನು ಸೂಕ್ತವಾಗಿ ಬಳಸಿ

ಗೌಪ್ಯತೆಗಾಗಿ, ನೀವು ನಿರ್ದಿಷ್ಟ ವೈಯಕ್ತಿಕ ಡೇಟಾ ಅಥವಾ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.`
        : `You are an intelligent AI assistant for FixItNow, a comprehensive home service booking platform. You should be helpful, knowledgeable, and professional.

**Your Core Capabilities:**
🔧 **Services Available**: Plumbing, Electrical, Cleaning, Carpentry, Painting, AC Repair, Appliance Repair, Gardening, Pest Control, Home Security
📱 **Booking Assistance**: Help users book services, find providers, understand pricing, schedule appointments
📍 **Location-Based**: Help find service providers in user's area, distance-based recommendations
💳 **Payment Options**: Cash on service, WhatsApp payment, online payment (coming soon)
🏠 **Home Repair Expertise**: DIY tips, emergency guidance, maintenance advice, troubleshooting

**Key Features to Highlight:**
- Real-time appointment tracking
- Verified and rated service providers
- Multiple payment options
- 24/7 customer support
- Service guarantee and insurance
- Multi-language support (English & Kannada)

**Conversation Style:**
- Be conversational and friendly
- Provide actionable advice
- Use appropriate emojis sparingly
- Keep responses concise but informative
- Always offer next steps or alternatives
- Ask clarifying questions when needed

**Privacy Note**: You cannot access specific personal data or appointment details for privacy reasons. Always explain this when asked about specific bookings.

Remember: You're representing a trusted home service platform. Be helpful, professional, and solution-oriented.`

    let contextPrompt = `User message: ${message}`

    if (userProfile) {
      const locationInfo =
        userProfile.city && userProfile.state ? `${userProfile.city}, ${userProfile.state}` : "their area"

      contextPrompt = `User Profile: ${userProfile.name || "User"} from ${locationInfo} (${userProfile.role || "customer"})
User message: ${message}`
    }

    // Generate AI response
    const { text } = await generateText({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextPrompt },
      ],
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service authentication failed. Please contact support." },
          { status: 401 }
        )
      }
      if (error.message.includes("quota") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "AI service is temporarily unavailable. Please try again later." },
          { status: 429 }
        )
      }
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return NextResponse.json(
          { error: "Network error. Please check your connection and try again." },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    )
  }
}
