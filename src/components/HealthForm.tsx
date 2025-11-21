import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';

interface HealthFormProps {
  onSubmit?: () => void;
}

const HealthForm = ({ onSubmit }: HealthFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [water, setWater] = useState('');
  const [sleep, setSleep] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [steps, setSteps] = useState('');
  const [mood, setMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');

  const handleWaterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('water_intake').insert({
        user_id: user.id,
        amount_ml: parseInt(water),
      });

      if (error) throw error;

      toast.success('Data air minum berhasil disimpan');
      setWater('');
      onSubmit?.();
    } catch (error: any) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSleepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('sleep_logs').insert({
        user_id: user.id,
        hours: parseFloat(sleep),
        quality: sleepQuality,
      });

      if (error) throw error;

      toast.success('Data tidur berhasil disimpan');
      setSleep('');
      setSleepQuality('');
      onSubmit?.();
    } catch (error: any) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('step_logs').insert({
        user_id: user.id,
        steps: parseInt(steps),
      });

      if (error) throw error;

      toast.success('Data langkah berhasil disimpan');
      setSteps('');
      onSubmit?.();
    } catch (error: any) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('health_logs').insert({
        user_id: user.id,
        mood: mood,
        notes: moodNotes,
      });

      if (error) throw error;

      toast.success('Data mood berhasil disimpan');
      setMood('');
      setMoodNotes('');
      onSubmit?.();
    } catch (error: any) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('medicine_logs').insert({
        user_id: user.id,
        medicine_name: medicineName,
        dosage: dosage,
      });

      if (error) throw error;

      toast.success('Data obat berhasil disimpan');
      setMedicineName('');
      setDosage('');
      onSubmit?.();
    } catch (error: any) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Input Data Harian</CardTitle>
        <CardDescription>Catat aktivitas kesehatan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="water" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="water">Air</TabsTrigger>
            <TabsTrigger value="sleep">Tidur</TabsTrigger>
            <TabsTrigger value="steps">Langkah</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="medicine">Obat</TabsTrigger>
          </TabsList>

          <TabsContent value="water">
            <form onSubmit={handleWaterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="water">Jumlah Air (ml)</Label>
                <Input
                  id="water"
                  type="number"
                  placeholder="250"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Simpan
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sleep">
            <form onSubmit={handleSleepSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sleep">Durasi Tidur (jam)</Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  placeholder="7.5"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Kualitas Tidur</Label>
                <Select value={sleepQuality} onValueChange={setSleepQuality} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kualitas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Buruk</SelectItem>
                    <SelectItem value="fair">Cukup</SelectItem>
                    <SelectItem value="good">Baik</SelectItem>
                    <SelectItem value="excellent">Sangat Baik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Simpan
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="steps">
            <form onSubmit={handleStepsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="steps">Jumlah Langkah</Label>
                <Input
                  id="steps"
                  type="number"
                  placeholder="5000"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Simpan
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="mood">
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Mood Hari Ini</Label>
                <Select value={mood} onValueChange={setMood} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terrible">Sangat Buruk</SelectItem>
                    <SelectItem value="bad">Buruk</SelectItem>
                    <SelectItem value="okay">Biasa Saja</SelectItem>
                    <SelectItem value="good">Baik</SelectItem>
                    <SelectItem value="great">Sangat Baik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Bagaimana perasaan Anda hari ini..."
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Simpan
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="medicine">
            <form onSubmit={handleMedicineSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicine">Nama Obat</Label>
                <Input
                  id="medicine"
                  type="text"
                  placeholder="Paracetamol"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosis</Label>
                <Input
                  id="dosage"
                  type="text"
                  placeholder="500mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Simpan
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthForm;
