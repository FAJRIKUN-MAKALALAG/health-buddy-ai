import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Parse commands
    const commandResult = await parseCommand(message, user.id, supabase);
    if (commandResult) {
      return new Response(
        JSON.stringify({ 
          response: commandResult.response,
          action: commandResult.action 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's health summary for context
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [waterData, sleepData, stepsData, moodData] = await Promise.all([
      supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString()),
      supabase
        .from('sleep_logs')
        .select('hours, quality')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1),
      supabase
        .from('step_logs')
        .select('steps')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1),
      supabase
        .from('health_logs')
        .select('mood, notes')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1),
    ]);

    const totalWater = waterData.data?.reduce((sum, item) => sum + item.amount_ml, 0) || 0;
    const latestSleep = sleepData.data?.[0] || null;
    const latestSteps = stepsData.data?.[0]?.steps || 0;
    const latestMood = moodData.data?.[0] || null;

    const healthContext = `
Data kesehatan hari ini:
- Air minum: ${totalWater} ml
- Tidur: ${latestSleep ? `${latestSleep.hours} jam (${latestSleep.quality})` : 'belum dicatat'}
- Langkah: ${latestSteps} langkah
- Mood: ${latestMood ? `${latestMood.mood} ${latestMood.notes ? `(${latestMood.notes})` : ''}` : 'belum dicatat'}
`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Anda adalah asisten kesehatan yang ramah dan membantu. Berikan saran kesehatan berdasarkan data pengguna. Gunakan bahasa Indonesia yang natural dan mudah dipahami. Jangan memberikan saran medis yang serius - hanya tips kesehatan umum.

${healthContext}

Anda bisa memberikan saran tentang:
- Konsumsi air yang cukup (2-3 liter/hari)
- Tidur yang cukup (7-9 jam/hari)
- Aktivitas fisik (minimal 5000-10000 langkah/hari)
- Mood dan kesehatan mental

Jika pengguna bertanya tentang data mereka, gunakan informasi di atas.`
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiData = await aiResponse.json();
    const assistantResponse = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in health-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function parseCommand(message: string, userId: string, supabase: any) {
  const lowerMsg = message.toLowerCase();

  // Command: tambah air
  const waterMatch = lowerMsg.match(/tambah(?:kan)?\s+(\d+)\s*(?:ml)?\s+air/);
  if (waterMatch) {
    const amount = parseInt(waterMatch[1]);
    const { error } = await supabase.from('water_intake').insert({
      user_id: userId,
      amount_ml: amount,
    });

    if (error) throw error;

    return {
      response: `Oke! Saya sudah mencatat ${amount}ml air minum untuk Anda. Jangan lupa terus minum air ya! 💧`,
      action: `${amount}ml air berhasil ditambahkan`
    };
  }

  // Command: tambah langkah
  const stepsMatch = lowerMsg.match(/tambah(?:kan)?\s+(\d+)\s+langkah/);
  if (stepsMatch) {
    const steps = parseInt(stepsMatch[1]);
    const { error } = await supabase.from('step_logs').insert({
      user_id: userId,
      steps: steps,
    });

    if (error) throw error;

    return {
      response: `Mantap! ${steps} langkah sudah tercatat. Terus semangat bergerak! 🚶‍♂️`,
      action: `${steps} langkah berhasil ditambahkan`
    };
  }

  // Command: catat tidur
  const sleepMatch = lowerMsg.match(/(?:catat|tambah).*tidur\s+(\d+(?:\.\d+)?)\s+jam/);
  if (sleepMatch) {
    const hours = parseFloat(sleepMatch[1]);
    const quality = hours >= 7 ? 'good' : hours >= 5 ? 'fair' : 'poor';
    
    const { error } = await supabase.from('sleep_logs').insert({
      user_id: userId,
      hours: hours,
      quality: quality,
    });

    if (error) throw error;

    return {
      response: `Tidur ${hours} jam sudah dicatat. ${hours >= 7 ? 'Istirahat yang cukup! 😴' : 'Coba tidur lebih awal besok ya! 😊'}`,
      action: `Data tidur berhasil ditambahkan`
    };
  }

  return null;
}
