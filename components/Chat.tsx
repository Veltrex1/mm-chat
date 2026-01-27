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
  spouse_birth: string;
  spouse_first_name: string;
  self_birth: string;
  spouse_love_language: string;
  self_love_language: string;
  spouse_favorites: string;
  self_favorites: string;
  spouse_traits: string;
  self_traits: string;
  spouse_interests: string;
  self_interests: string;
  spouse_animal_lover: string;
  spouse_sports: string;
  spouse_fears: string;
  spouse_comforts: string;
  spouse_enjoy: string;
  spouse_avoid: string;
  gift_budget: string;
  gift_style: string;
  married_place: string;
  honeymoon_place: string;
  meet_story: string;
  share_results: string;
}

const CALCULATOR_URL = 'https://married-more-calculator-5mfl-f9grmy7nq.vercel.app';

const LOVE_LANGUAGES = [
  'Words of Affirmation',
  'Quality Time',
  'Receiving Gifts',
  'Acts of Service',
  'Physical Touch',
];

const TRAITS_OPTIONS = [
  'Adventurous',
  'Thrill-seeker',
  'Timid',
  'Romantic',
  'Efficient',
  'Playful',
  'Smart',
  'Funny',
  'Athletic',
  'Active',
  'Couch-potato',
  'Artistic',
  'Quiet',
  'Loud',
  'Talkative',
  'Homebody',
  'Outgoing',
  'Organized',
  'Neat-freak',
  'Messy',
  'Morning-person',
  'Night-owl',
  'Faith-filled',
  'Avid-reader',
  'Saver',
  'Spender',
  'Service-oriented',
  'Family-oriented',
  'Free-spirit',
];

const INTEREST_OPTIONS = [
  'History',
  'Future',
  'Sci-Fi',
  'Gaming',
  'Animation',
  'Sports',
  'Hobbies',
  'Collector',
];

const ENJOY_OPTIONS = [
  'A musical',
  'A concert',
  'Live play',
  'Adventure park',
  'Museum',
  'A sporting event',
  'Road trip',
  'Beach',
  'Mountains',
  'Rivers',
  'Castles',
  'Ruins',
  'International travel',
  'Domestic travel',
  'Cruises',
  'Retreats',
];

const GIFT_BUDGET_OPTIONS = [
  'Up to $50',
  '$50 - $100',
  '$100 - $250',
  '$250 - $500',
  '$500 - $1000',
  '$1000+',
  'Prefer to decide per occasion',
];

const GIFT_STYLE_OPTIONS = [
  'Experience - weekend trip',
  'Experience - local outing',
  'Jewelry',
  'Photo album or framed print',
  'Personalized art',
  'Spa/relaxation',
  'Tech or gadget',
  'Subscription/box',
  'Handwritten/keepsake',
  'Something practical',
  'Something sentimental',
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
    case 'spouse_birth':
      return "Great, thank you for sharing!";
    case 'spouse_first_name':
      return `${value} — what a lovely name!`;
    case 'self_birth':
      return "Wonderful, we'll remember this for your celebrations too.";
    case 'spouse_love_language':
      return `Beautiful — ${value.toLowerCase()} is such a meaningful way to show love.`;
    case 'self_love_language':
      return `Noted! ${value.toLowerCase()} helps us tailor ideas for you, too.`;
    case 'spouse_favorites':
      return "Lovely details — this will help us personalize ideas.";
    case 'self_favorites':
      return "Got it — we'll keep your favorites in mind too.";
    case 'spouse_traits':
      return "That paints a great picture of your spouse — thank you!";
    case 'self_traits':
      return "Great! This helps balance plans for both of you.";
    case 'spouse_interests':
      return "Wonderful! Those interests will inspire great ideas.";
    case 'self_interests':
      return "Love it — we'll include options you'll both enjoy.";
    case 'spouse_animal_lover':
      return "Noted — we'll keep that in mind for experiences.";
    case 'spouse_sports':
      return "Perfect — adding those teams to the list.";
    case 'spouse_fears':
      return "Thanks for sharing; we'll avoid anything that wouldn't feel good.";
    case 'spouse_comforts':
      return "Lovely — we'll lean into those comforts.";
    case 'spouse_enjoy':
      return "Great picks — those sound like fun!";
    case 'spouse_avoid':
      return "Thanks for flagging; we'll avoid these.";
    case 'gift_budget':
      return "Great — that helps us right-size recommendations.";
    case 'gift_style':
      return "Perfect, we'll tailor ideas to that vibe.";
    case 'married_place':
      return "Beautiful — we'll remember where your story started.";
    case 'honeymoon_place':
      return "Lovely! A special spot to keep in mind.";
    case 'meet_story':
      return "What a great story — thanks for sharing!";
    case 'share_results':
      return value.toLowerCase().includes('yes')
        ? "Wonderful — we'll prepare a copy for your spouse too."
        : "Got it — we'll keep the results just for you.";
    default:
      return "Great, thank you for sharing!";
  }
};

const chatFlow: Omit<Message, 'id'>[] = [
  {
    type: 'bot',
    content: "Welcome to MarriedMore! I'm Marry, your personal assistant to help you celebrate your marriage.",
  },
  {
    type: 'bot',
    content: "First, what’s your first name?",
    inputType: 'text',
    field: 'first_name',
  },
  {
    type: 'bot',
    content: "Thanks! I’ll keep track of details to email timely, thoughtful reminders and personalized gift ideas. Your information is only used by MarriedMore and will never be sold. May I keep these details for you?",
    inputType: 'consent',
    field: 'consent',
    options: ['Yes, please', 'No thanks'],
  },
  {
    type: 'bot',
    content: "What is your preferred email address to receive these reminders?",
    inputType: 'email',
    field: 'email',
  },
  {
    type: 'bot',
    content: "Anniversary date?",
    inputType: 'date',
    field: 'wedding_date',
  },
  {
    type: 'bot',
    content: "Where were you married?",
    inputType: 'text',
    field: 'married_place',
  },
  {
    type: 'bot',
    content: "Where was your honeymoon?",
    inputType: 'text',
    field: 'honeymoon_place',
  },
  {
    type: 'bot',
    content: "What's the story of how you met?",
    inputType: 'text',
    field: 'meet_story',
  },
  {
    type: 'bot',
    content: "Spouse’s birth month (and specific date if you’d like to share)?",
    inputType: 'text',
    field: 'spouse_birth',
  },
  {
    type: 'bot',
    content: "What’s your spouse’s first name?",
    inputType: 'text',
    field: 'spouse_first_name',
  },
  {
    type: 'bot',
    content: "Your birth month (and specific date if you’d like to share)?",
    inputType: 'text',
    field: 'self_birth',
  },
  {
    type: 'bot',
    content: "Do you know what matters more to your spouse: time together, words of affirmation, touch, acts of service, or receiving gifts?",
    inputType: 'select',
    field: 'spouse_love_language',
    options: LOVE_LANGUAGES,
  },
  {
    type: 'bot',
    content: "And what about you? Which love language fits you best?",
    inputType: 'select',
    field: 'self_love_language',
    options: LOVE_LANGUAGES,
  },
  {
    type: 'bot',
    content: "Describe your spouse’s favorites (color, food, drink, movies, music, art, destinations, adventures, ways to relax).",
    inputType: 'text',
    field: 'spouse_favorites',
  },
  {
    type: 'bot',
    content: "Describe your own favorites too.",
    inputType: 'text',
    field: 'self_favorites',
  },
  {
    type: 'bot',
    content: "Words to describe your spouse’s tendencies? Pick any that fit, or add your own.",
    inputType: 'multi-select',
    field: 'spouse_traits',
    options: TRAITS_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "And words to describe you?",
    inputType: 'multi-select',
    field: 'self_traits',
    options: TRAITS_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "What fascinates your spouse? (History, Sci-Fi, Gaming, Collector, etc.)",
    inputType: 'multi-select',
    field: 'spouse_interests',
    options: INTEREST_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "And what fascinates you?",
    inputType: 'multi-select',
    field: 'self_interests',
    options: INTEREST_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "Is your spouse an animal lover?",
    inputType: 'select',
    field: 'spouse_animal_lover',
    options: ['Yes', 'No', 'Somewhat'],
  },
  {
    type: 'bot',
    content: "Any favorite sports team(s)?",
    inputType: 'text',
    field: 'spouse_sports',
  },
  {
    type: 'bot',
    content: "Any fears we should be mindful of?",
    inputType: 'text',
    field: 'spouse_fears',
  },
  {
    type: 'bot',
    content: "Comforts or go-to feel-good things?",
    inputType: 'text',
    field: 'spouse_comforts',
  },
  {
    type: 'bot',
    content: "What would your spouse enjoy? Pick all that fit.",
    inputType: 'multi-select',
    field: 'spouse_enjoy',
    options: ENJOY_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "Anything they’d want to avoid? (allergies, limitations, dislikes, triggers)",
    inputType: 'text',
    field: 'spouse_avoid',
  },
  {
    type: 'bot',
    content: "How big of a gift are you thinking? Choose a ballpark budget.",
    inputType: 'select',
    field: 'gift_budget',
    options: GIFT_BUDGET_OPTIONS,
  },
  {
    type: 'bot',
    content: "What kind of gift feels right? (trip/experience, jewelry, photo album, etc.) Pick all that fit.",
    inputType: 'multi-select',
    field: 'gift_style',
    options: GIFT_STYLE_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: "Would you like your spouse to receive the results as well?",
    inputType: 'select',
    field: 'share_results',
    options: ['Yes, please send to my spouse too', 'No, just for me'],
  },
  {
    type: 'bot',
    content: "You're amazing, {{first_name}}! Thanks for sharing all of this with me. I'll use it to send thoughtful reminders and perfect gift ideas. Taking you to your calculator now...",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState('');
  const [answers, setAnswers] = useState<Answers>({
    consent: '',
    first_name: '',
    email: '',
    wedding_date: '',
    spouse_birth: '',
    spouse_first_name: '',
    self_birth: '',
    spouse_love_language: '',
    self_love_language: '',
    spouse_favorites: '',
    self_favorites: '',
    spouse_traits: '',
    self_traits: '',
    spouse_interests: '',
    self_interests: '',
    spouse_animal_lover: '',
    spouse_sports: '',
    spouse_fears: '',
    spouse_comforts: '',
    spouse_enjoy: '',
    spouse_avoid: '',
    gift_budget: '',
    gift_style: '',
    married_place: '',
    honeymoon_place: '',
    meet_story: '',
    share_results: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [declined, setDeclined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const autoScrollThreshold = 120; // px from bottom to auto-scroll

  const isNearBottom = () => {
    if (typeof document === 'undefined') return false;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    return scrollHeight - (scrollTop + clientHeight) < autoScrollThreshold;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  };

  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }
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
    setSelectedOptions([]);
    setCustomOption('');
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Add acknowledgment then next question (with warm delay)
    setTimeout(() => {
      addAcknowledgmentThenNextQuestion(currentFlow.field!, value, newAnswers, nextStep);
    }, 300);
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((h) => h !== option)
        : [...prev, option]
    );
  };

  const handleAddCustomOption = () => {
    if (customOption.trim() && !selectedOptions.includes(customOption.trim())) {
      setSelectedOptions((prev) => [...prev, customOption.trim()]);
      setCustomOption('');
    }
  };

  const handleSubmitOptions = () => {
    if (selectedOptions.length > 0) {
      handleSubmit(selectedOptions.join(', '));
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
  const baseOptions = currentFlow?.options || [];
  const needsInputBar = (showInput || showOptions || showMultiSelect || showDateInput) && !isTyping;

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
          {/* Spacer so buttons/inputs don’t overlap latest message */}
          <div className={needsInputBar ? 'h-36' : 'h-8'} />
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

              {/* Multi-Select for list questions */}
              {showMultiSelect && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentFlow.options?.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionToggle(option)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedOptions.includes(option)
                            ? 'option-btn-selected shadow-md'
                            : 'option-btn'
                        }`}
                      >
                        {selectedOptions.includes(option) && '✓ '}
                        {option}
                      </motion.button>
                    ))}
                    {/* Custom options added */}
                    {selectedOptions
                      .filter((h) => !baseOptions.includes(h))
                      .map((option) => (
                        <motion.button
                          key={option}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionToggle(option)}
                          className="px-4 py-2.5 rounded-full text-sm font-medium option-btn-selected shadow-md"
                        >
                          ✓ {option}
                        </motion.button>
                      ))}
                  </div>
                  
                  {/* Add custom option */}
                  {currentFlow.allowCustom && (
                    <div className="flex gap-2 justify-center">
                      <input
                        type="text"
                        value={customOption}
                        onChange={(e) => setCustomOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomOption()}
                        placeholder="Add another..."
                        className="chat-input px-4 py-2.5 rounded-full text-warm-800 placeholder:text-warm-400 text-sm w-40"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddCustomOption}
                        disabled={!customOption.trim()}
                        className="px-4 py-2.5 bg-cream-200 text-warm-600 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-cream-300 transition-colors"
                      >
                        + Add
                      </motion.button>
                    </div>
                  )}

                  {/* Submit options */}
                  <div className="flex justify-center pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitOptions}
                      disabled={selectedOptions.length === 0}
                      className="px-8 py-3.5 option-btn-primary rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                      Continue ({selectedOptions.length} selected)
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
