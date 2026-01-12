# MM Chat - Conversational Lead Capture

A beautiful, conversational chat app that captures user information and saves it to Supabase before redirecting to the MarriedMore Calculator.

## Features

- 💬 Conversational UI with smooth animations
- 🎁 Permission-based data collection for reminders & gift ideas
- 📅 Date pickers for birthdays and anniversaries
- 🏷️ Multi-select with custom options for hobbies
- 💕 Love language selection
- 💾 Saves responses to Supabase
- 🔗 Redirects to calculator after completion
- 📱 Fully responsive

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Create the `chat_responses` table in Supabase SQL Editor:

```sql
CREATE TABLE chat_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consent TEXT,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  wedding_date TEXT,
  date_of_birth TEXT,
  partner_first_name TEXT,
  partner_date_of_birth TEXT,
  partner_fav_color TEXT,
  partner_hobbies TEXT,
  partner_love_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE chat_responses ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow inserts
CREATE POLICY "Allow anonymous inserts" ON chat_responses
  FOR INSERT WITH CHECK (true);
```

3. Get your API credentials from Project Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the chat!

## Chat Flow

1. **Permission Request** - Asks consent to store data for reminders
2. **First Name** - User's name
3. **Email** - For sending reminders
4. **Wedding Date** - Anniversary date
5. **Date of Birth** - User's birthday
6. **Partner's Name** - Spouse/partner's first name
7. **Partner's Birthday** - Partner's date of birth
8. **Favorite Color** - Partner's favorite color
9. **Hobbies** - Multi-select with custom options
10. **Love Language** - Partner's primary love language

## Project Structure

```
├── app/
│   ├── api/chat/route.ts  # API endpoint to save to Supabase
│   ├── globals.css        # Global styles & animations
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── Chat.tsx           # Main chat component
├── lib/
│   └── supabase.ts        # Supabase client
└── README.md
```

## Customization

### Change Chat Questions

Edit the `chatFlow` array in `components/Chat.tsx` to customize the questions.

### Change Calculator URL

Update the `CALCULATOR_URL` constant in `components/Chat.tsx`:

```typescript
const CALCULATOR_URL = 'your-calculator-url';
```

### Modify Hobby Options

Update the `HOBBY_OPTIONS` array in `components/Chat.tsx`.

### Modify Love Languages

Update the `LOVE_LANGUAGES` array in `components/Chat.tsx`.

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Supabase](https://supabase.com/) - Database

## License

MIT
