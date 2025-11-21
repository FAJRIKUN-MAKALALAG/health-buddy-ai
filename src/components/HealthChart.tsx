import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ChartData {
  date: string;
  water: number;
  sleep: number;
  steps: number;
}

const HealthChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekData = async () => {
      if (!user) return;

      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [waterData, sleepData, stepsData] = await Promise.all([
          supabase
            .from('water_intake')
            .select('amount_ml, recorded_at')
            .eq('user_id', user.id)
            .gte('recorded_at', sevenDaysAgo.toISOString())
            .order('recorded_at'),
          supabase
            .from('sleep_logs')
            .select('hours, recorded_at')
            .eq('user_id', user.id)
            .gte('recorded_at', sevenDaysAgo.toISOString())
            .order('recorded_at'),
          supabase
            .from('step_logs')
            .select('steps, recorded_at')
            .eq('user_id', user.id)
            .gte('recorded_at', sevenDaysAgo.toISOString())
            .order('recorded_at'),
        ]);

        // Group data by date
        const groupedData: { [key: string]: ChartData } = {};

        waterData.data?.forEach((item) => {
          const date = new Date(item.recorded_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          if (!groupedData[date]) {
            groupedData[date] = { date, water: 0, sleep: 0, steps: 0 };
          }
          groupedData[date].water += item.amount_ml;
        });

        sleepData.data?.forEach((item) => {
          const date = new Date(item.recorded_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          if (!groupedData[date]) {
            groupedData[date] = { date, water: 0, sleep: 0, steps: 0 };
          }
          groupedData[date].sleep = item.hours;
        });

        stepsData.data?.forEach((item) => {
          const date = new Date(item.recorded_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          if (!groupedData[date]) {
            groupedData[date] = { date, water: 0, sleep: 0, steps: 0 };
          }
          groupedData[date].steps = item.steps;
        });

        setData(Object.values(groupedData));
      } catch (error: any) {
        toast.error('Gagal memuat data grafik');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [user]);

  if (loading) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Tren Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Tren Mingguan</CardTitle>
        <CardDescription>Aktivitas kesehatan 7 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="water" 
              stroke="hsl(var(--health-water))" 
              name="Air (ml)"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="sleep" 
              stroke="hsl(var(--health-sleep))" 
              name="Tidur (jam)"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="steps" 
              stroke="hsl(var(--health-steps))" 
              name="Langkah"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HealthChart;
