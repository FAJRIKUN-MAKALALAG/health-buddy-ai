import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting seed process...');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Supabase admin client created');

    // Check if user exists first
    console.log('Checking for existing user...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }
    
    let userId: string;
    
    const existingUser = existingUsers?.users.find(u => u.email === 'fajrikun@gmail.com');
    
    if (existingUser) {
      userId = existingUser.id;
      console.log('User already exists, using existing user:', userId);
    } else {
      // Create dummy user
      console.log('Creating new user...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'fajrikun@gmail.com',
        password: '112233',
        email_confirm: true,
        user_metadata: {
          full_name: 'Fajri Kun'
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        throw authError;
      }
      userId = authData.user.id;
      console.log('Created new user:', userId);
    }

    // Generate data for 7 days (Nov 16-22, 2025)
    console.log('Generating data for 7 days...');
    const dates = [
      '2025-11-16', '2025-11-17', '2025-11-18', '2025-11-19', 
      '2025-11-20', '2025-11-21', '2025-11-22'
    ];

    // Water intake data (1500-2500ml per day)
    const waterData = dates.flatMap((date) => {
      const amounts = [250, 300, 350, 400, 500];
      return amounts.slice(0, Math.floor(Math.random() * 2) + 4).map((amount) => ({
        user_id: userId,
        amount_ml: amount,
        recorded_at: `${date}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`
      }));
    });

    // Sleep data (6-8 hours, good/fair quality)
    const sleepQualities = ['good', 'fair', 'good', 'excellent', 'good', 'fair', 'good'];
    const sleepData = dates.map((date, idx) => ({
      user_id: userId,
      hours: 6 + Math.random() * 2,
      quality: sleepQualities[idx],
      recorded_at: `${date}T07:00:00Z`
    }));

    // Steps data (5000-8000 steps per day)
    const stepsData = dates.map((date) => ({
      user_id: userId,
      steps: Math.floor(5000 + Math.random() * 3000),
      recorded_at: `${date}T20:00:00Z`
    }));

    // Mood/health logs
    const moods = ['good', 'okay', 'great', 'good', 'good', 'okay', 'great'];
    const moodData = dates.map((date, idx) => ({
      user_id: userId,
      mood: moods[idx],
      notes: idx % 2 === 0 ? 'Merasa cukup baik hari ini' : null,
      recorded_at: `${date}T19:00:00Z`
    }));

    // Insert all data
    console.log('Inserting water intake data...');
    const { error: waterError } = await supabaseAdmin.from('water_intake').insert(waterData);
    if (waterError) {
      console.error('Water insert error:', waterError);
      throw waterError;
    }

    console.log('Inserting sleep data...');
    const { error: sleepError } = await supabaseAdmin.from('sleep_logs').insert(sleepData);
    if (sleepError) {
      console.error('Sleep insert error:', sleepError);
      throw sleepError;
    }

    console.log('Inserting steps data...');
    const { error: stepsError } = await supabaseAdmin.from('step_logs').insert(stepsData);
    if (stepsError) {
      console.error('Steps insert error:', stepsError);
      throw stepsError;
    }

    console.log('Inserting mood data...');
    const { error: moodError } = await supabaseAdmin.from('health_logs').insert(moodData);
    if (moodError) {
      console.error('Mood insert error:', moodError);
      throw moodError;
    }

    console.log('All data inserted successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dummy user dan data berhasil dibuat',
        user_id: userId,
        email: 'fajrikun@gmail.com'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Caught error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const details = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', details);
    
    return new Response(
      JSON.stringify({ 
        error: message,
        details: details 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
