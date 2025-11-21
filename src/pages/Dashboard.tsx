import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplet, Moon, Footprints, Heart, PlusCircle, MessageSquare } from 'lucide-react';
import HealthChart from '@/components/HealthChart';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DailySummary {
  water: number;
  sleep: number;
  steps: number;
  mood: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DailySummary>({
    water: 0,
    sleep: 0,
    steps: 0,
    mood: '-',
  });
  const [loading, setLoading] = useState(true);

  const fetchTodayData = async () => {
    if (!user) return;

    try {
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
          .select('hours')
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
          .select('mood')
          .eq('user_id', user.id)
          .gte('recorded_at', today.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1),
      ]);

      const totalWater = waterData.data?.reduce((sum, item) => sum + item.amount_ml, 0) || 0;
      const latestSleep = sleepData.data?.[0]?.hours || 0;
      const latestSteps = stepsData.data?.[0]?.steps || 0;
      const latestMood = moodData.data?.[0]?.mood || '-';

      setSummary({
        water: totalWater,
        sleep: latestSleep,
        steps: latestSteps,
        mood: latestMood,
      });
    } catch (error: any) {
      toast.error('Gagal memuat data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();

    // Setup realtime subscriptions for all health tables
    const waterChannel = supabase
      .channel('water_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_intake',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchTodayData()
      )
      .subscribe();

    const sleepChannel = supabase
      .channel('sleep_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep_logs',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchTodayData()
      )
      .subscribe();

    const stepsChannel = supabase
      .channel('steps_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'step_logs',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchTodayData()
      )
      .subscribe();

    const moodChannel = supabase
      .channel('mood_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_logs',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchTodayData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(waterChannel);
      supabase.removeChannel(sleepChannel);
      supabase.removeChannel(stepsChannel);
      supabase.removeChannel(moodChannel);
    };
  }, [user]);

  const statCards = [
    {
      title: 'Air Minum',
      value: `${summary.water} ml`,
      icon: Droplet,
      color: 'text-health-water',
      bgColor: 'bg-health-water/10',
    },
    {
      title: 'Tidur',
      value: `${summary.sleep} jam`,
      icon: Moon,
      color: 'text-health-sleep',
      bgColor: 'bg-health-sleep/10',
    },
    {
      title: 'Langkah',
      value: summary.steps.toLocaleString(),
      icon: Footprints,
      color: 'text-health-steps',
      bgColor: 'bg-health-steps/10',
    },
    {
      title: 'Mood',
      value: summary.mood,
      icon: Heart,
      color: 'text-health-mood',
      bgColor: 'bg-health-mood/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard Kesehatan</h1>
          <p className="text-muted-foreground">
            Ringkasan aktivitas hari ini
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title} 
                className="shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg transition-transform hover:rotate-12`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold animate-scale-in">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HealthChart />
          
          <Card className="shadow-medium animate-fade-in">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Tambah data atau chat dengan AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/input">
                <Button className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02]">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Input Data Baru
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="w-full transition-all hover:scale-[1.02]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat dengan AI
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
