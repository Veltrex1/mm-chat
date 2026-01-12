import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      consent,
      first_name,
      email,
      wedding_date,
      date_of_birth,
      partner_first_name,
      partner_date_of_birth,
      partner_fav_color,
      partner_hobbies,
      partner_love_language,
    } = body;

    // Validate required fields
    if (!first_name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert the chat response into Supabase
    const { data, error } = await supabase
      .from('chat_responses')
      .insert([
        {
          consent,
          first_name,
          email,
          wedding_date,
          date_of_birth,
          partner_first_name,
          partner_date_of_birth,
          partner_fav_color,
          partner_hobbies,
          partner_love_language,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
