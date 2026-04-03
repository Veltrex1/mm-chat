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

type Mode = 'general' | 'gift' | 'reminder' | 'trip';

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

type FAQ = { question: string; answer: string; keywords: string[] };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getFaqAnswer = (input: string): string | undefined => {
  const needle = normalize(input);
  for (const faq of FAQS) {
    const q = normalize(faq.question);
    const hits = faq.keywords.some((k) => needle.includes(k));
    const questionOverlap =
      q.split(' ').filter((w) => w.length > 2 && needle.includes(w)).length >= 2;
    if (hits || questionOverlap) return faq.answer;
  }
  return undefined;
};

type Intent = 'gift' | 'reminder' | 'trip' | null;

const detectIntent = (input: string): Intent => {
  const needle = normalize(input);
  const has = (words: string[]) => words.some((w) => needle.includes(w));
  if (has(['trip', 'travel', 'getaway', 'vacation'])) return 'trip';
  if (has(['gift', 'present', 'surprise', 'keepsake'])) return 'gift';
  if (has(['remind', 'reminder', 'notify', 'remember'])) return 'reminder';
  return null;
};

const intentReply = (intent: Intent) => {
  if (intent === 'gift') return 'Happy to help with gift ideas.';
  if (intent === 'reminder') return 'I can set reminders for you.';
  if (intent === 'trip') return 'A trip sounds lovely.';
  return '';
};

const detectEmotion = (input: string): string | null => {
  const text = normalize(input);
  if (text.match(/\bexcited|happy|thrilled|pumped\b/)) return 'I love the enthusiasm.';
  if (text.match(/\bstress|overwhelmed|worried|anxious\b/)) return 'I hear you—it can feel like a lot.';
  if (text.match(/\bsentimental|emotional|heartfelt\b/)) return 'I get it—this matters.';
  return null;
};

const buildSummary = (mode: Mode, a: Answers) => {
  if (mode === 'gift') {
    return `Gift summary: style=${a.gift_style || 'unspecified'}, budget=${a.gift_budget || 'unspecified'}, favorites=${a.spouse_favorites || 'unspecified'}.`;
  }
  if (mode === 'reminder') {
    return `Reminder summary: email=${a.email || 'unspecified'}, anniversary=${a.wedding_date || 'unspecified'}, share=${a.share_results || 'unspecified'}.`;
  }
  if (mode === 'trip') {
    return `Trip summary: vibe=${a.spouse_enjoy || 'unspecified'}, avoid=${a.spouse_avoid || 'unspecified'}, budget=${a.gift_budget || 'unspecified'}.`;
  }
  return `Summary: name=${a.first_name || 'unspecified'}, email=${a.email || 'unspecified'}, anniversary=${a.wedding_date || 'unspecified'}.`;
};

const giftFlow: Omit<Message, 'id'>[] = [
  {
    type: 'bot',
    content: 'What kind of gift feels right? (experience, jewelry, keepsake, practical)',
    inputType: 'multi-select',
    field: 'gift_style',
    options: GIFT_STYLE_OPTIONS,
    allowCustom: true,
  },
  {
    type: 'bot',
    content: 'About how much would you like to spend?',
    inputType: 'select',
    field: 'gift_budget',
    options: GIFT_BUDGET_OPTIONS,
  },
  {
    type: 'bot',
    content: "Any favorites I should know? Colors, interests, comforts?",
    inputType: 'text',
    field: 'spouse_favorites',
  },
];

const reminderFlow: Omit<Message, 'id'>[] = [
  {
    type: 'bot',
    content: 'What email should I use for reminders?',
    inputType: 'email',
    field: 'email',
  },
  {
    type: 'bot',
    content: "When’s your anniversary?",
    inputType: 'date',
    field: 'wedding_date',
  },
  {
    type: 'bot',
    content: 'Should your spouse get reminders too?',
    inputType: 'select',
    field: 'share_results',
    options: ['Yes, please send to my spouse too', 'No, just for me'],
  },
];

const tripFlow: Omit<Message, 'id'>[] = [
  {
    type: 'bot',
    content: 'What kind of trip vibe sounds good? (beach, mountains, city, cozy, adventure)',
    inputType: 'multi-select',
    field: 'spouse_enjoy',
    options: ['Beach', 'Mountains', 'City', 'Adventure park', 'Road trip', 'Cozy stay', 'Cruise', 'International travel', 'Domestic travel'],
    allowCustom: true,
  },
  {
    type: 'bot',
    content: 'Any constraints or avoid list? (allergies, dislikes, limits)',
    inputType: 'text',
    field: 'spouse_avoid',
  },
  {
    type: 'bot',
    content: 'Rough budget for the trip?',
    inputType: 'select',
    field: 'gift_budget',
    options: GIFT_BUDGET_OPTIONS,
  },
];
const FAQS: FAQ[] = [
  {
    question: 'What is MarriedMore?',
    answer:
      'MarriedMore is a simple way to celebrate lasting love—helping couples recognize milestones, build small traditions, and intentionally invest over time.',
    keywords: ['what is marriedmore', 'marriedmore', 'about'],
  },
  {
    question: 'What is a MarriedMore date?',
    answer:
      "Your MarriedMore date is the day you've been married longer than not—a unique milestone that reflects the depth and longevity of your commitment.",
    keywords: ['marriedmore date', 'what is', 'date meaning'],
  },
  {
    question: 'How do I find my MarriedMore date?',
    answer:
      'Use the MarriedMore Calculator—enter your wedding date to instantly see when you reach your MarriedMore milestone.',
    keywords: ['find', 'calculator', 'how do i', 'marriedmore date'],
  },
  {
    question: 'Do both spouses have a MarriedMore date?',
    answer:
      'Yes—each spouse has their own MarriedMore date based on their life timeline, often very close together.',
    keywords: ['both spouses', 'each spouse', 'own date'],
  },
  {
    question: 'Why is the MarriedMore date meaningful?',
    answer:
      'It marks when marriage becomes the majority of your shared life—honoring endurance, growth, and love over time.',
    keywords: ['meaningful', 'why', 'important'],
  },
  {
    question: 'Do we need to celebrate in a big way?',
    answer:
      'Not at all—simple, intentional moments (quiet dinner, handwritten note, time together) are encouraged.',
    keywords: ['celebrate', 'big way', 'how celebrate'],
  },
  {
    question: 'Can you remind us when our MarriedMore date is coming up?',
    answer:
      'Yes—sign up for gentle email reminders as your MarriedMore date approaches so you don’t forget to celebrate.',
    keywords: ['remind', 'reminders', 'coming up'],
  },
  {
    question: 'How often will we get emails?',
    answer:
      'Only around your MarriedMore date—typically ~30 days, 7 days, and 1 day before. Nothing excessive.',
    keywords: ['how often', 'emails', 'frequency'],
  },
  {
    question: 'Do you sell products?',
    answer:
      'Yes—we curate thoughtful, symbolic gifts and meaningful items that align with intentional celebration.',
    keywords: ['sell products', 'products', 'merch', 'gifts'],
  },
  {
    question: 'Do you hold inventory or ship products yourselves?',
    answer:
      'We partner with trusted suppliers/makers to deliver directly, focusing on quality and curation.',
    keywords: ['inventory', 'ship', 'suppliers'],
  },
  {
    question: 'Is MarriedMore faith-based?',
    answer:
      'MarriedMore values commitment, intention, and lasting love. It’s welcoming to all couples.',
    keywords: ['faith', 'religious', 'faith-based'],
  },
  {
    question: 'Is this only for long-married couples?',
    answer:
      'No—couples at any stage can benefit, whether newly married or decades in.',
    keywords: ['only for long', 'newly married', 'stage'],
  },
  {
    question: 'What if we’re in a hard season of marriage?',
    answer:
      'We support couples in all seasons—sometimes celebration looks like reassurance, guidance, or a reminder that your marriage is worth investing in.',
    keywords: ['hard season', 'struggling', 'difficult'],
  },
  {
    question: 'Can MarriedMore help us reconnect?',
    answer:
      'We don’t replace counseling, but offer reminders, ideas, and resources that encourage intentional connection.',
    keywords: ['reconnect', 'help us reconnect', 'counseling'],
  },
  {
    question: 'Is our information private?',
    answer:
      'Yes—your information is private and not sold; it’s only used to support your MarriedMore experience.',
    keywords: ['private', 'privacy', 'sell data', 'information'],
  },
  {
    question: 'How can we get started?',
    answer:
      'Start by finding your MarriedMore date with the calculator; then explore ideas, sign up for reminders, or browse curated resources.',
    keywords: ['get started', 'start', 'begin'],
  },
  {
    question: 'Are you a real person?',
    answer:
      'I’m a virtual assistant created to help with MarriedMore; not human, but built with real care and intention.',
    keywords: ['real person', 'are you real', 'human'],
  },
  {
    question: 'Who created MarriedMore?',
    answer:
      'MarriedMore was created by Karen and Tom Peck to celebrate lasting love, inspired by a milestone in their own story.',
    keywords: ['who created', 'karen', 'tom peck', 'founder'],
  },
  {
    question: 'Why did you create MarriedMore?',
    answer:
      'To honor marriage beyond the wedding day—through years of simple traditions, reflection, and intentional care.',
    keywords: ['why create', 'why did you create', 'purpose'],
  },
  {
    question: 'Is this just another anniversary?',
    answer:
      'No. A MarriedMore date is a once-in-a-lifetime milestone based on how long you’ve been married relative to your life, not a calendar anniversary.',
    keywords: ['another anniversary', 'just anniversary', 'same as anniversary'],
  },
  {
    question: 'What if my spouse isn’t into celebrating?',
    answer:
      'That’s okay. MarriedMore is flexible—celebration can be simple or quiet; even a private acknowledgment counts.',
    keywords: ['spouse not into', 'not celebrate', 'doesnt like celebrating'],
  },
  {
    question: 'Do I have to buy something to use MarriedMore?',
    answer:
      'No. MarriedMore is about awareness and intention first; products and ideas are optional.',
    keywords: ['buy', 'purchase', 'have to buy'],
  },
  {
    question: 'Is MarriedMore only for couples who are doing well?',
    answer:
      'Not at all—MarriedMore is for every season, including couples feeling disconnected or navigating challenges.',
    keywords: ['only for couples doing well', 'struggling', 'not doing well'],
  },
  {
    question: 'Can I use MarriedMore for a gift idea?',
    answer:
      'Yes—many people use their MarriedMore date as inspiration for meaningful gifts that honor commitment and longevity.',
    keywords: ['gift idea', 'use for gift', 'gift inspiration'],
  },
  {
    question: 'What if I don’t know our exact wedding date?',
    answer:
      'Estimate it and the calculator will give a close approximation. You can update it later if you find the exact date.',
    keywords: ['dont know wedding date', 'unknown wedding date', 'exact date'],
  },
  {
    question: 'Will you remind both of us?',
    answer:
      'You can sign up individually or together; each person can choose to receive reminders at their own email.',
    keywords: ['remind both', 'both of us', 'reminders both'],
  },
  {
    question: 'How often will you email me?',
    answer:
      'Only around your MarriedMore date, plus occasional thoughtful updates—we avoid inbox clutter.',
    keywords: ['how often email', 'email frequency', 'emails often'],
  },
  {
    question: 'Can I unsubscribe anytime?',
    answer:
      'Yes—every email includes an unsubscribe link; opt out anytime.',
    keywords: ['unsubscribe', 'opt out', 'stop emails'],
  },
  {
    question: 'Does MarriedMore offer advice or counseling?',
    answer:
      'We are not counseling, but we share thoughtful guidance, resources, and ideas to encourage healthy connection.',
    keywords: ['counseling', 'advice', 'therapy'],
  },
  {
    question: 'Is this meant to replace counseling or coaching?',
    answer:
      'No—MarriedMore complements professional support; it doesn’t replace counseling or coaching.',
    keywords: ['replace counseling', 'replace therapy', 'replace coaching'],
  },
  {
    question: 'What makes MarriedMore different?',
    answer:
      'We focus on one meaningful milestone and build simple, intentional practices around it—without pressure or perfection.',
    keywords: ['different', 'unique', 'why different'],
  },
  {
    question: 'Is MarriedMore free to use?',
    answer:
      'Yes—finding your MarriedMore date and many resources are free; optional products or services may cost extra.',
    keywords: ['free', 'cost', 'price'],
  },
  {
    question: 'Can I share this with friends or family?',
    answer:
      'Absolutely—MarriedMore is often shared as a thoughtful idea for couples, anniversaries, or long-term celebrations.',
    keywords: ['share', 'friends', 'family'],
  },
];

// Warm acknowledgment messages to use after user responses
const getAcknowledgment = (field: string, value: string, answers: Answers): string => {
  switch (field) {
    case 'consent':
      return "Thanks for letting me keep this.";
    case 'first_name':
      return `Nice to meet you, ${value}.`;
    case 'email':
      return "Okay, noted.";
    case 'wedding_date':
      return "Thanks, got the date.";
    case 'spouse_birth':
      return "Noted.";
    case 'spouse_first_name':
      return `${value}—got it.`;
    case 'self_birth':
      return "Thanks, I've got that.";
    case 'spouse_love_language':
      return "Noted for your spouse.";
    case 'self_love_language':
      return "Noted for you.";
    case 'spouse_favorites':
      return "Thanks for sharing favorites.";
    case 'self_favorites':
      return "Got it.";
    case 'spouse_traits':
      return "Noted.";
    case 'self_traits':
      return "Thanks, noted.";
    case 'spouse_interests':
      return "Interests saved.";
    case 'self_interests':
      return "Saved.";
    case 'spouse_animal_lover':
      return "Noted.";
    case 'spouse_sports':
      return "Added.";
    case 'spouse_fears':
      return "We’ll avoid that.";
    case 'spouse_comforts':
      return "Comforts saved.";
    case 'spouse_enjoy':
      return "Saved.";
    case 'spouse_avoid':
      return "We’ll avoid that.";
    case 'gift_budget':
      return "Okay, budget noted.";
    case 'gift_style':
      return "Got the vibe.";
    case 'married_place':
      return "Saved.";
    case 'honeymoon_place':
      return "Saved.";
    case 'meet_story':
      return "Story saved.";
    case 'share_results':
      return value.toLowerCase().includes('yes')
        ? "Okay, I’ll include your spouse."
        : "Got it—just you.";
    default:
      return "Noted.";
  }
};

const chatFlow: Omit<Message, 'id'>[] = [
  {
    type: 'bot',
    content: "Hi, I’m Marry—here to help you celebrate your marriage.",
  },
  {
    type: 'bot',
    content: "If you don’t know an answer, type “skip” and I’ll move on.",
  },
  {
    type: 'bot',
    content: "What’s your first name?",
    inputType: 'text',
    field: 'first_name',
  },
  {
    type: 'bot',
    content: "I’ll only use this to help—never sold. May I keep these details for you?",
    inputType: 'consent',
    field: 'consent',
    options: ['Yes, please', 'No thanks'],
  },
  {
    type: 'bot',
    content: "What’s the best email to reach you?",
    inputType: 'email',
    field: 'email',
  },
  {
    type: 'bot',
    content: "What’s your anniversary date?",
    inputType: 'date',
    field: 'wedding_date',
  },
  {
    type: 'bot',
    content: "Where did you get married?",
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
    content: "How did you two meet?",
    inputType: 'text',
    field: 'meet_story',
  },
  {
    type: 'bot',
    content: "What’s your spouse’s birth month? (Date if you’d like.)",
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
    content: "What’s your birth month? (Date if you’d like.)",
    inputType: 'text',
    field: 'self_birth',
  },
  {
    type: 'bot',
    content: "What matters most to your spouse? (time, words, touch, service, gifts)",
    inputType: 'multi-select',
    field: 'spouse_love_language',
    options: LOVE_LANGUAGES,
    allowCustom: false,
  },
  {
    type: 'bot',
    content: "And for you—what fits best?",
    inputType: 'multi-select',
    field: 'self_love_language',
    options: LOVE_LANGUAGES,
    allowCustom: false,
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

const getFlow = (mode: Mode) => {
  switch (mode) {
    case 'gift':
      return giftFlow;
    case 'reminder':
      return reminderFlow;
    case 'trip':
      return tripFlow;
    default:
      return chatFlow;
  }
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState('');

  const [mode, setMode] = useState<Mode>('general');
  const [lastUserIntent, setLastUserIntent] = useState<Intent | null>(null);
  const [facts, setFacts] = useState<{
    email?: string;
    anniversary?: string;
    budget?: string;
    location?: string;
  }>({});
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const autoScrollThreshold = 300; // px from bottom to auto-scroll (more forgiving)
  const activeFlow = getFlow(mode);
  const [userScrolling, setUserScrolling] = useState(false);
  const scrollPauseRef = useRef<NodeJS.Timeout | null>(null);

  const isUserQuestion = (input: string) => {
    const lower = input.trim().toLowerCase();
    if (!lower) return false;
    if (lower.includes('?')) return true;
    const startsWith = ['what', 'why', 'how', 'when', 'where', 'who', 'do you', 'can you', 'should'];
    return startsWith.some((w) => lower.startsWith(w));
  };

  const isNearBottom = () => {
    if (typeof document === 'undefined') return false;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    return scrollHeight - (scrollTop + clientHeight) < autoScrollThreshold;
  };

  const formatFacts = () => {
    const parts = [];
    if (facts.email) parts.push(`email: ${facts.email}`);
    if (facts.anniversary) parts.push(`anniversary: ${facts.anniversary}`);
    if (facts.budget) parts.push(`budget: ${facts.budget}`);
    if (facts.location) parts.push(`location: ${facts.location}`);
    return parts.length ? parts.join(', ') : 'no saved details yet';
  };

  const scrollToBottom = () => {
    if (typeof document === 'undefined') return;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  useEffect(() => {
    if (!userScrolling && isNearBottom()) {
      scrollToBottom();
    }
  }, [messages, userScrolling]);

  useEffect(() => {
    if (currentStep === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      addBotMessage(0);
    }
  }, [mode]);

  const processContent = (content: string) => {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return answers[key as keyof Answers] || '';
    });
  };

  const enqueueResumeQuestion = (flowIndex: number) => {
    const flow = getFlow(mode);
    const step = flow[flowIndex];
    if (!step) return;
    const resumeMessage: Message = {
      id: `resume-${Date.now()}`,
      type: 'bot',
      content: processContent(step.content),
      inputType: step.inputType,
      options: step.options,
      field: step.field,
      allowCustom: step.allowCustom,
    };
    setMessages((prev) => [...prev, resumeMessage]);
  };

  const goBack = () => {
    const flow = getFlow(mode);
    if (currentStep <= 0) return;
    const prevStep = currentStep - 1;
    setIsComplete(false);
    setDeclined(false);
    setCurrentStep(prevStep);
    setInputValue('');
    setSelectedOptions([]);
    setCustomOption('');
    const prev = flow[prevStep];
    if (prev) {
      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          id: `back-${Date.now()}`,
          type: 'bot',
          content: `Let's revisit: ${processContent(prev.content)}`,
          inputType: prev.inputType,
          options: prev.options,
          field: prev.field,
          allowCustom: prev.allowCustom,
        },
      ]);
      scrollToBottom();
    }
  };

  const addBotMessage = async (stepIndex: number) => {
    const flow = getFlow(mode);
    if (stepIndex >= flow.length) return;

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
    setIsTyping(false);

    const step = flow[stepIndex];
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      ...step,
      content: processContent(step.content),
    };

    setMessages((prev) => [...prev, newMessage]);
    // Auto-scroll for bot messages only if user was near bottom
    if (isNearBottom()) {
      scrollToBottom();
    }

    // If this step doesn't require input, move to next
    if (!step.inputType && !step.options) {
      if (stepIndex === flow.length - 1) {
        // Final message - save and finish
        setIsComplete(true);
        await saveAndFinish();
      } else {
        setTimeout(() => {
          setCurrentStep(stepIndex + 1);
          addBotMessage(stepIndex + 1);
        }, 1200);
      }
    }
  };

  useEffect(() => {
    setFacts({
      email: answers.email || undefined,
      anniversary: answers.wedding_date || undefined,
      budget: answers.gift_budget || undefined,
      location: answers.married_place || answers.honeymoon_place || undefined,
    });
  }, [answers]);

  useEffect(() => {
    const handleUserScroll = () => {
      setUserScrolling(true);
      if (scrollPauseRef.current) clearTimeout(scrollPauseRef.current);
      scrollPauseRef.current = setTimeout(() => setUserScrolling(false), 1200);
    };
    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
      if (scrollPauseRef.current) clearTimeout(scrollPauseRef.current);
    };
  }, []);

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

  const saveAndFinish = async () => {
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
    setIsSaving(false);
  };

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    const isSkip = trimmed.toLowerCase() === 'skip';
    const isBack = trimmed.toLowerCase() === 'back';
    if (isBack) {
      goBack();
      return;
    }
    if (!trimmed && !isSkip) return;

    // Intent detection: acknowledge topic change but keep flow, then resume
    const detected = detectIntent(trimmed);
    if (!isSkip && detected && detected !== mode) {
      setLastUserIntent(detected);
      const intentMsg = intentReply(detected);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: 'user',
          content: value,
        },
        {
          id: `ack-${Date.now()}`,
          type: 'bot',
          content: intentMsg || 'Got it.',
        },
        {
          id: `resume-${Date.now()}`,
          type: 'bot',
          content: 'We can pick up where we left off.',
        },
      ]);
      setInputValue('');
      enqueueResumeQuestion(currentStep);
      scrollToBottom();
      return;
    }

    const currentFlow = activeFlow[currentStep];
    if (!currentFlow.field) return;

    // If the user asks a free-form question, answer briefly and steer back
    if (!isSkip && isUserQuestion(trimmed)) {
      const intent = detectIntent(trimmed);
      setLastUserIntent(intent);
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: value,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      const emotion = detectEmotion(trimmed);

      let quickAnswer =
        getFaqAnswer(trimmed) ||
        'I hear you—MarriedMore is about thoughtful reminders, ideas, and gifts for your marriage.';

      if (intent) {
        const intentMsg = intentReply(intent);
        if (intentMsg) quickAnswer = intentMsg;
      }

      if (!intent && !getFaqAnswer(trimmed)) {
        quickAnswer = `So far I have ${formatFacts()}. To help, I need: ${currentFlow.content}`;
      }

      const messagesToAdd: Message[] = [
        {
          id: `steer-${Date.now()}`,
          type: 'bot',
          content: emotion ? `${emotion} Quick answer: ${quickAnswer}` : `Quick answer: ${quickAnswer}`,
        },
        {
          id: `resume-${Date.now()}`,
          type: 'bot',
          content: 'We can pick up where we left off.',
        },
      ];

      setMessages((prev) => [...prev, ...messagesToAdd]);
      enqueueResumeQuestion(currentStep);
      scrollToBottom();
      return;
    }

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
          content: "No problem at all — we totally understand! Thanks for stopping by.",
        };
        setMessages((prev) => [...prev, declineMessage]);
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
    scrollToBottom(); // always keep user in view after their action

    // Update answers
    const storedValue = isSkip ? 'Skipped' : value;
    const newAnswers = { ...answers, [currentFlow.field]: storedValue };
    setAnswers(newAnswers);

    // Clear input and move to next step
    setInputValue('');
    setSelectedOptions([]);
    setCustomOption('');
    const nextStep = currentStep + 1;

    const flowLength = activeFlow.length;
    if (nextStep >= flowLength) {
      setCurrentStep(flowLength);
      setIsComplete(true);
      const summary = buildSummary(mode, newAnswers);
      setMessages((prev) => [
        ...prev,
        {
          id: `summary-${Date.now()}`,
          type: 'bot',
          content: summary,
        },
      ]);
      saveAndFinish();
      return;
    }

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
    if (selectedOptions.length === 0) return;
    handleSubmit(selectedOptions.join(', '));
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

  const currentFlow = activeFlow[currentStep];
  const showInput = currentFlow?.inputType && !isComplete && !declined;
  const showOptions = currentFlow?.options && (currentFlow?.inputType === 'select' || currentFlow?.inputType === 'consent') && !isComplete && !declined;
  const showMultiSelect = currentFlow?.inputType === 'multi-select' && !isComplete && !declined;
  const showDateInput = currentFlow?.inputType === 'date' && !isComplete && !declined;
  const baseOptions = currentFlow?.options || [];
  const needsInputBar = (showInput || showOptions || showMultiSelect || showDateInput) && !isTyping;

  useEffect(() => {
    if (!userScrolling && (isNearBottom() || needsInputBar)) {
      scrollToBottom();
    }
  }, [messages, needsInputBar, userScrolling]);

  return (
    <div className="min-h-screen flex flex-col overflow-visible chat-shell">
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
          <p className="text-warm-500 mt-2 text-sm tracking-wide">Loving Lasting Marriage</p>
        </motion.div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-56 min-h-screen overflow-visible">
        <div
          ref={messagesContainerRef}
          className="space-y-4 pr-1 overflow-visible"
        >
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
                      ? 'chat-bubble-user text-warm-900 rounded-br-sm'
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
                  <p className="text-warm-600">Saving your answers...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
          {/* Spacer so buttons/inputs don’t overlap latest message */}
          <div className={needsInputBar ? 'h-72' : 'h-16'} />
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
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goBack}
                    disabled={currentStep === 0}
                    className="px-5 py-3 rounded-full text-sm font-medium option-btn"
                  >
                    Back
                  </motion.button>
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
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmit('skip')}
                    className="px-6 py-3.5 rounded-full text-sm font-medium option-btn"
                  >
                    Skip
                  </motion.button>
                </div>
              )}

              {/* Multi-Select for list questions */}
              {showMultiSelect && (
                <div className="space-y-4 mt-4">
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goBack}
                      disabled={currentStep === 0}
                      className="px-5 py-3 rounded-full text-sm font-medium option-btn"
                    >
                      Back
                    </motion.button>
                  </div>
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
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmit('skip')}
                      className="ml-3 px-6 py-3.5 rounded-full text-sm font-medium option-btn"
                    >
                      Skip
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Date Input */}
              {showDateInput && (
                <div className="flex gap-3 justify-center mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goBack}
                    disabled={currentStep === 0}
                    className="px-5 py-3 rounded-full text-sm font-medium option-btn"
                  >
                    Back
                  </motion.button>
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
                <div className="flex gap-3 items-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goBack}
                    disabled={currentStep === 0}
                    className="px-5 py-3 rounded-full text-sm font-medium option-btn"
                  >
                    Back
                  </motion.button>
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
