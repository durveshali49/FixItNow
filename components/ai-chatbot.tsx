"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  isFromAI: boolean
  timestamp: Date
  language?: string
}

interface AIChatbotProps {
  user?: any
  appointmentId?: string
  className?: string
  userProfile?: any
}

export function AIChatbot({ user, appointmentId, className, userProfile }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<"en" | "kn">("en")
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history when component mounts
  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory()
    }
  }, [isOpen, user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const loadChatHistory = async () => {
    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("appointment_id", appointmentId || null)
      .order("created_at", { ascending: true })
      .limit(50)

    if (!error && data) {
      const chatMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        content: msg.message,
        isFromAI: msg.is_from_ai,
        timestamp: new Date(msg.created_at),
        language: msg.language,
      }))
      setMessages(chatMessages)
    }
  }

  const saveChatMessage = async (content: string, isFromAI: boolean) => {
    if (!user) return

    const supabase = createClient()
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      appointment_id: appointmentId || null,
      message: content,
      is_from_ai: isFromAI,
      language: language,
    })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isFromAI: false,
      timestamp: new Date(),
      language,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Save user message
    try {
      await saveChatMessage(userMessage.content, false)
    } catch (error) {
      console.warn("Failed to save user message:", error)
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          language,
          appointmentId,
          userId: user?.id,
          userProfile: userProfile
            ? {
                name: userProfile.full_name,
                city: userProfile.city,
                state: userProfile.state,
                role: userProfile.role,
              }
            : null,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.response) {
        throw new Error("No response from AI")
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isFromAI: true,
        timestamp: new Date(),
        language,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Save AI message
      try {
        await saveChatMessage(aiMessage.content, true)
      } catch (error) {
        console.warn("Failed to save AI message:", error)
      }

      // Show notification if chat is minimized
      if (isMinimized) {
        setHasNewMessage(true)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          language === "kn"
            ? "ಕ್ಷಮಿಸಿ, ನಾನು ಈಗ ಸಹಾಯ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ. ದೋಷ: API ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ."
            : "Sorry, I cannot help right now. Please try again later. Error: Unable to connect to AI service.",
        isFromAI: true,
        timestamp: new Date(),
        language,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getWelcomeMessage = () => {
    const userName = userProfile?.full_name ? `, ${userProfile.full_name.split(" ")[0]}` : ""
    if (language === "kn") {
      return `ನಮಸ್ಕಾರ${userName}! ನಾನು FixItNow AI ಸಹಾಯಕ. ಸೇವೆ ಬುಕ್ ಮಾಡಲು, ಪ್ರೊವೈಡರ್‌ಗಳನ್ನು ಹುಡುಕಲು, ಅಥವಾ ಮನೆಯ ರಿಪೇರಿ ಸಲಹೆಗಳಿಗಾಗಿ ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`
    }
    return `Hello${userName}! I'm your FixItNow AI assistant. I'm here to help you book services, find providers, track appointments, or get home repair advice. What can I help you with today?`
  }

  const getQuickActions = () => {
    const actions =
      language === "kn"
        ? ["ಸೇವೆ ಬುಕ್ ಮಾಡಿ", "ಪ್ರೊವೈಡರ್ ಹುಡುಕಿ", "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಸ್ಥಿತಿ", "ಪ್ಲಂಬಿಂಗ್ ಸಹಾಯ"]
        : ["Book a service", "Find providers", "Check appointment", "Get repair tips"]

    return actions
  }

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
    setTimeout(() => sendMessage(), 100)
  }

  const handleExpand = () => {
    setIsMinimized(false)
    setHasNewMessage(false)
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 relative"
        >
          <MessageCircle className="h-6 w-6" />
          <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-400" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card
        className={`w-80 border-border shadow-xl transition-all duration-300 ${isMinimized ? "h-14" : "h-[500px]"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm flex items-center gap-1">
                FixItNow AI
                <Sparkles className="h-3 w-3 text-primary" />
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setLanguage(language === "en" ? "kn" : "en")}
                >
                  {language === "en" ? "English" : "ಕನ್ನಡ"}
                </Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleExpand} className="h-8 w-8 p-0 relative">
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              {hasNewMessage && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <>
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 rounded-lg max-w-[240px] border border-primary/20">
                        <p className="text-sm">{getWelcomeMessage()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {getQuickActions().map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="text-xs h-7 px-2 border-primary/20 hover:bg-primary/10"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.isFromAI ? "" : "flex-row-reverse"}`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        className={`text-xs ${
                          message.isFromAI
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {message.isFromAI ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`p-3 rounded-lg max-w-[240px] transition-all duration-200 ${
                        message.isFromAI
                          ? "bg-gradient-to-r from-muted to-muted/80 border border-border/50"
                          : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gradient-to-r from-muted to-muted/80 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-gradient-to-r from-background to-muted/20">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  placeholder={language === "kn" ? "ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ..." : "Type your message..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 border-border focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {language === "kn" ? "AI ಸಹಾಯಕ • ಗೌರವಾನ್ವಿತ ಮತ್ತು ಸಹಾಯಕ" : "AI Assistant • Helpful and respectful"}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
