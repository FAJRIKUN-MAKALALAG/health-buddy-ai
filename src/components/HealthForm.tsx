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
  const [isTakingMedicine, setIsTakingMedicine] = useState(true);

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
      if (isTakingMedicine) {
        const { error } = await supabase.from('medicine_logs').insert({
          user_id: user.id,
          medicine_name: medicineName,
          dosage: dosage,
        });

        if (error) throw error;
        toast.success('Data obat berhasil disimpan');
      } else {
        toast.success('Dicatat: Tidak minum obat hari ini');
      }

      setMedicineName('');
      setDosage('');
      setIsTakingMedicine(true);
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
            <TabsTrigger value="water" className="transition-all">Air</TabsTrigger>
            <TabsTrigger value="sleep" className="transition-all">Tidur</TabsTrigger>
            <TabsTrigger value="steps" className="transition-all">Langkah</TabsTrigger>
            <TabsTrigger value="mood" className="transition-all">Mood</TabsTrigger>
            <TabsTrigger value="medicine" className="transition-all">Obat</TabsTrigger>
          </TabsList>

          <TabsContent value="water" className="animate-fade-in">
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
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Data Air'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sleep" className="animate-fade-in">
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
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Kualitas Tidur</Label>
                <Select value={sleepQuality} onValueChange={setSleepQuality} required>
                  <SelectTrigger className="transition-all focus:scale-[1.02]">
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
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Data Tidur'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="steps" className="animate-fade-in">
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
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Data Langkah'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="mood" className="animate-fade-in">
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Mood Hari Ini</Label>
                <Select value={mood} onValueChange={setMood} required>
                  <SelectTrigger className="transition-all focus:scale-[1.02]">
                    <SelectValue placeholder="Pilih mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terrible">😞 Sangat Buruk</SelectItem>
                    <SelectItem value="bad">😕 Buruk</SelectItem>
                    <SelectItem value="okay">😐 Biasa Saja</SelectItem>
                    <SelectItem value="good">😊 Baik</SelectItem>
                    <SelectItem value="great">😄 Sangat Baik</SelectItem>
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
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Data Mood'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="medicine">
            <form onSubmit={handleMedicineSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Apakah Anda minum obat hari ini?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={isTakingMedicine ? "default" : "outline"}
                    onClick={() => setIsTakingMedicine(true)}
                    className="flex-1"
                  >
                    Ya, Minum Obat
                  </Button>
                  <Button
                    type="button"
                    variant={!isTakingMedicine ? "default" : "outline"}
                    onClick={() => setIsTakingMedicine(false)}
                    className="flex-1"
                  >
                    Tidak Minum Obat
                  </Button>
                </div>
              </div>

              {isTakingMedicine && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="medicine">Nama Obat</Label>
                    <Input
                      id="medicine"
                      type="text"
                      placeholder="Paracetamol"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      required={isTakingMedicine}
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
                </div>
              )}

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
