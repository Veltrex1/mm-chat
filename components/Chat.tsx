'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
  inputType?: 'text' | 'email' | 'date' | 'select' | 'multi-select' | 'consent';
  field?: string;
  allowCustom?: boolean;
}

interface Answers {
  consent: string;
  first_name: string;
  email: string;
  wedding_date: string;
  date_of_birth: string;
  partner_first_name: string;
  partner_date_of_birth: string;
  partner_fav_color: string;
  partner_hobbies: string;
  partner_love_language: string;
}

const CALCULATOR_URL = 'https://married-more-calculator-5mfl-f9grmy7nq.vercel.app';

const HOBBY_OPTIONS = [
  'Reading',
  'Cooking',
  'Fitness',
  'Gaming',
  'Travel',
  'Music',
  'Art & Crafts',
  'Sports',
  'Movies & TV',
  'Outdoors',
  'Photography',
  'Dancing',
];

const LOVE_LANGUAGES = [
  'Words of Affirmation',
  'Quality Time',
  'Receiving Gifts',
  'Acts of Service',
  'Physical Touch',
];

// Warm acknowledgment messages to use after user responses
const getAcknowledgment = (field: string, value: string, answers: Answers): string => {
  switch (field) {
    case 'consent':
      return "Wonderful! We're so happy to have you here.";
    case 'first_name':
      return `It's so lovely to meet you, ${value}!`;
    case 'email':
      return "Perfect, thank you for sharing that with us!";
    case 'wedding_date':
      return "What a special day to celebrate!";
    case 'date_of_birth':
      return "Great, thank you for sharing!";
    case 'partner_first_name':
      return `${value} — what a lovely name!`;
    case 'partner_date_of_birth':
      return "Wonderful, we'll make sure to remember that!";
    case 'partner_fav_color':
      return `${value} — beautiful choice!`;
    case 'partner_hobbies':
      return "Those are wonderful interests! This really helps us find the perfect ideas.";
    case 'partner_love_language':
      return `That's beautiful — ${value.toLowerCase()} is such a meaningful way to show love.`;
    default:
      return "Great, thank you for sharing!";
  }
};

const chatFlow: Omit<Message, 'id'>[] = [
  {
    type: 'bot',
    content: "Hey there! Welcome — I'm so glad you're here.",
  },
  {
    type: 'bot',
    content: "Before we dive in, I just want to ask: do we have your permission to store these details? This helps us send you thoughtful reminders and personalized gift ideas.",
    inputType: 'consent',
    field: 'consent',
    options: ['Yes, I\'d love that!', 'No thanks'],
  },
  {
    type: 'bot',
    content: "Let's start with the basics — what's your first name?",
    inputType: 'text',
    field: 'first_name',
  },
  {
    type: 'bot',
    content: "And what's the best email to reach you at? We'll use this to send you helpful reminders.",
    inputType: 'email',
    field: 'email',
  },
  {
    type: 'bot',
    content: "Now for the fun stuff! When's your wedding anniversary?",
    inputType: 'date',
    field: 'wedding_date',
  },
  {
    type: 'bot',
    content: "And when's your birthday? We'd love to celebrate you too!",
    inputType: 'date',
    field: 'date_of_birth',
  },
  {
    type: 'bot',
    content: "Now let's talk about your special someone! What's your spouse or partner's first name?",
    inputType: 'text',
    field: 'partner_first_name',
  },
  {
    type: 'bot',
    content: "When's {{partner_first_name}}'s birthday?",
    inputType: 'date',
    field: 'partner_date_of_birth',
  },
  {
    type: 'bot',
    content: "Here's a fun one — what's {{partner_first_name}}'s favorite color?",
    inputType: 'text',
    field: 'partner_fav_color',
  },
  {
    type: 'bot',
    content: "What hobbies or interests does {{partner_first_name}} absolutely love? Pick as many as you'd like, or add your own!",
    inputType: 'multi-select',
    field: 'partner_hobbies',
    options: HOBBY_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "Last question! Which love language do you think fits {{partner_first_name}} best?",
    inputType: 'select',
    field: 'partner_love_language',
    options: LOVE_LANGUAGES,
  },
  {
    type: 'bot',
    content: "You're amazing, {{first_name}}! Thank you so much for sharing all of this with us. We'll use it to send you thoughtful reminders and perfect gift ideas for {{partner_first_name}}. Taking you to your calculator now...",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');
  const [answers, setAnswers] = useState<Answers>({
    consent: '',
    first_name: '',
    email: '',
    wedding_date: '',
    date_of_birth: '',
    partner_first_name: '',
    partner_date_of_birth: '',
    partner_fav_color: '',
    partner_hobbies: '',
    partner_love_language: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [declined, setDeclined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentStep === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      addBotMessage(0);
    }
  }, []);

  const processContent = (content: string) => {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return answers[key as keyof Answers] || '';
    });
  };

  const addBotMessage = async (stepIndex: number) => {
    if (stepIndex >= chatFlow.length) return;

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
    setIsTyping(false);

    const step = chatFlow[stepIndex];
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      ...step,
      content: processContent(step.content),
    };

    setMessages((prev) => [...prev, newMessage]);

    // If this step doesn't require input, move to next
    if (!step.inputType && !step.options) {
      if (stepIndex === chatFlow.length - 1) {
        // Final message - save and redirect
        setIsComplete(true);
        await saveAndRedirect();
      } else {
        setTimeout(() => {
          setCurrentStep(stepIndex + 1);
          addBotMessage(stepIndex + 1);
        }, 1200);
      }
    }
  };

  const addAcknowledgmentThenNextQuestion = async (field: string, value: string, newAnswers: Answers, nextStep: number) => {
    // Add acknowledgment message
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
    setIsTyping(false);

    const ackMessage: Message = {
      id: `ack-${Date.now()}`,
      type: 'bot',
      content: getAcknowledgment(field, value, newAnswers),
    };
    setMessages((prev) => [...prev, ackMessage]);

    // Wait a moment, then add the next question
    setTimeout(() => {
      addBotMessage(nextStep);
    }, 800);
  };

  const saveAndRedirect = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
    
    // Redirect after a brief moment
    setTimeout(() => {
      window.location.href = CALCULATOR_URL;
    }, 2500);
  };

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    const currentFlow = chatFlow[currentStep];
    if (!currentFlow.field) return;

    // Handle consent decline
    if (currentFlow.field === 'consent' && value === 'No thanks') {
      setDeclined(true);
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: value,
      };
      setMessages((prev) => [...prev, userMessage]);
      
      setTimeout(async () => {
        setIsTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsTyping(false);
        
        const declineMessage: Message = {
          id: `decline-${Date.now()}`,
          type: 'bot',
          content: "No problem at all — we totally understand! You can still use our calculator. Taking you there now...",
        };
        setMessages((prev) => [...prev, declineMessage]);
        setTimeout(() => {
          window.location.href = CALCULATOR_URL;
        }, 2000);
      }, 400);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: value,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Update answers
    const newAnswers = { ...answers, [currentFlow.field]: value };
    setAnswers(newAnswers);

    // Clear input and move to next step
    setInputValue('');
    setSelectedHobbies([]);
    setCustomHobby('');
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Add acknowledgment then next question (with warm delay)
    setTimeout(() => {
      addAcknowledgmentThenNextQuestion(currentFlow.field!, value, newAnswers, nextStep);
    }, 300);
  };

  const handleHobbyToggle = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby)
        ? prev.filter((h) => h !== hobby)
        : [...prev, hobby]
    );
  };

  const handleAddCustomHobby = () => {
    if (customHobby.trim() && !selectedHobbies.includes(customHobby.trim())) {
      setSelectedHobbies((prev) => [...prev, customHobby.trim()]);
      setCustomHobby('');
    }
  };

  const handleSubmitHobbies = () => {
    if (selectedHobbies.length > 0) {
      handleSubmit(selectedHobbies.join(', '));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const currentFlow = chatFlow[currentStep];
  const showInput = currentFlow?.inputType && !isComplete && !declined;
  const showOptions = currentFlow?.options && (currentFlow?.inputType === 'select' || currentFlow?.inputType === 'consent') && !isComplete && !declined;
  const showMultiSelect = currentFlow?.inputType === 'multi-select' && !isComplete && !declined;
  const showDateInput = currentFlow?.inputType === 'date' && !isComplete && !declined;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-8 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="brand-title text-4xl md:text-5xl">
            MarriedMore
          </h1>
          <p className="text-warm-500 mt-2 text-sm tracking-wide">Building stronger partnerships</p>
        </motion.div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-44">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                    message.type === 'user'
                      ? 'chat-bubble-user text-white rounded-br-sm'
                      : 'chat-bubble-bot text-warm-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="chat-bubble-bot rounded-2xl rounded-bl-sm px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="typing-dot w-2 h-2 bg-warm-400 rounded-full"></span>
                    <span className="typing-dot w-2 h-2 bg-warm-400 rounded-full"></span>
                    <span className="typing-dot w-2 h-2 bg-warm-400 rounded-full"></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Saving/Redirecting State */}
          <AnimatePresence>
            {isSaving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center pt-8"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-coral-200 border-t-coral-500 animate-spin"></div>
                  <p className="text-warm-600">Taking you to your calculator...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <AnimatePresence>
        {(showInput || showOptions || showMultiSelect || showDateInput) && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bottom-gradient pt-10 pb-8 px-4"
          >
            <div className="max-w-2xl mx-auto">
              {/* Consent / Single Select Buttons */}
              {showOptions && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {currentFlow.options?.map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmit(option)}
                      className={`px-6 py-3.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        currentFlow.inputType === 'consent'
                          ? option.includes('love') || option.includes('Yes')
                            ? 'option-btn-primary shadow-md'
                            : 'option-btn'
                          : 'option-btn hover:shadow-sm'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Multi-Select for Hobbies */}
              {showMultiSelect && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentFlow.options?.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleHobbyToggle(option)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedHobbies.includes(option)
                            ? 'option-btn-selected shadow-md'
                            : 'option-btn'
                        }`}
                      >
                        {selectedHobbies.includes(option) && '✓ '}
                        {option}
                      </motion.button>
                    ))}
                    {/* Custom hobbies added */}
                    {selectedHobbies
                      .filter((h) => !HOBBY_OPTIONS.includes(h))
                      .map((hobby) => (
                        <motion.button
                          key={hobby}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleHobbyToggle(hobby)}
                          className="px-4 py-2.5 rounded-full text-sm font-medium option-btn-selected shadow-md"
                        >
                          ✓ {hobby}
                        </motion.button>
                      ))}
                  </div>
                  
                  {/* Add custom hobby */}
                  {currentFlow.allowCustom && (
                    <div className="flex gap-2 justify-center">
                      <input
                        type="text"
                        value={customHobby}
                        onChange={(e) => setCustomHobby(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomHobby()}
                        placeholder="Add another..."
                        className="chat-input px-4 py-2.5 rounded-full text-warm-800 placeholder:text-warm-400 text-sm w-40"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddCustomHobby}
                        disabled={!customHobby.trim()}
                        className="px-4 py-2.5 bg-cream-200 text-warm-600 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-cream-300 transition-colors"
                      >
                        + Add
                      </motion.button>
                    </div>
                  )}

                  {/* Submit hobbies */}
                  <div className="flex justify-center pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitHobbies}
                      disabled={selectedHobbies.length === 0}
                      className="px-8 py-3.5 option-btn-primary rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                      Continue ({selectedHobbies.length} selected)
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Date Input */}
              {showDateInput && (
                <div className="flex gap-3 justify-center">
                  <input
                    ref={inputRef}
                    type="date"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="chat-input px-5 py-3.5 rounded-full text-warm-800 text-[15px] min-w-[200px]"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubmit(formatDateForDisplay(inputValue))}
                    disabled={!inputValue}
                    className="px-6 py-3.5 option-btn-primary rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </motion.button>
                </div>
              )}

              {/* Text/Email Input */}
              {showInput && currentFlow.inputType !== 'select' && currentFlow.inputType !== 'consent' && currentFlow.inputType !== 'multi-select' && currentFlow.inputType !== 'date' && (
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type={currentFlow.inputType}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      currentFlow.inputType === 'email'
                        ? 'your@email.com'
                        : 'Type your answer...'
                    }
                    className="chat-input flex-1 px-5 py-3.5 rounded-full text-warm-800 placeholder:text-warm-400 text-[15px]"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubmit(inputValue)}
                    disabled={!inputValue.trim()}
                    className="px-6 py-3.5 option-btn-primary rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
