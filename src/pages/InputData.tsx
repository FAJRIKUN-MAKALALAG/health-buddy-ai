import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Droplet, Moon, Footprints, Heart, Pill } from 'lucide-react';

const InputData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
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
    if (!user || !water) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('water_intake').insert({
        user_id: user.id,
        amount_ml: parseInt(water),
      });

      if (error) throw error;

      toast.success(`✅ ${water}ml air berhasil ditambahkan!`);
      setWater('');
    } catch (error: any) {
      toast.error('❌ Gagal menyimpan data: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSleepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sleep || !sleepQuality) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('sleep_logs').insert({
        user_id: user.id,
        hours: parseFloat(sleep),
        quality: sleepQuality,
      });

      if (error) throw error;

      toast.success(`✅ Data tidur ${sleep} jam berhasil disimpan!`);
      setSleep('');
      setSleepQuality('');
    } catch (error: any) {
      toast.error('❌ Gagal menyimpan data: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !steps) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('step_logs').insert({
        user_id: user.id,
        steps: parseInt(steps),
      });

      if (error) throw error;

      toast.success(`✅ ${steps} langkah berhasil dicatat!`);
      setSteps('');
    } catch (error: any) {
      toast.error('❌ Gagal menyimpan data: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mood) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('health_logs').insert({
        user_id: user.id,
        mood: mood,
        notes: moodNotes || null,
      });

      if (error) throw error;

      toast.success('✅ Mood berhasil dicatat!');
      setMood('');
      setMoodNotes('');
    } catch (error: any) {
      toast.error('❌ Gagal menyimpan data: ' + error.message);
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
        if (!medicineName) {
          toast.error('Nama obat harus diisi');
          setLoading(false);
          return;
        }

        const { error } = await supabase.from('medicine_logs').insert({
          user_id: user.id,
          medicine_name: medicineName,
          dosage: dosage || null,
        });

        if (error) throw error;
        toast.success(`✅ ${medicineName} berhasil dicatat!`);
      } else {
        toast.success('✅ Dicatat: Tidak minum obat hari ini');
      }

      setMedicineName('');
      setDosage('');
      setIsTakingMedicine(true);
    } catch (error: any) {
      toast.error('❌ Gagal menyimpan data: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Input Data Kesehatan</h1
            <p className="text-sm sm:text-base text-muted-foreground">
              Catat aktivitas kesehatan harian Anda
            </p>
          </div>

          <Card className="shadow-medium animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Form Input Harian</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Pilih kategori dan masukkan data Anda</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="water" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                  <TabsTrigger value="water" className="transition-all text-xs sm:text-sm py-2 px-1 sm:px-3">
                    <Droplet className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Air</span>
                  </TabsTrigger>
                  <TabsTrigger value="sleep" className="transition-all text-xs sm:text-sm py-2 px-1 sm:px-3">
                    <Moon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Tidur</span>
                  </TabsTrigger>
                  <TabsTrigger value="steps" className="transition-all text-xs sm:text-sm py-2 px-1 sm:px-3">
                    <Footprints className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Langkah</span>
                  </TabsTrigger>
                  <TabsTrigger value="mood" className="transition-all text-xs sm:text-sm py-2 px-1 sm:px-3">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Mood</span>
                  </TabsTrigger>
                  <TabsTrigger value="medicine" className="transition-all text-xs sm:text-sm py-2 px-1 sm:px-3">
                    <Pill className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Obat</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="water" className="animate-fade-in space-y-3 sm:space-y-4 pt-4">
                  <form onSubmit={handleWaterSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="water" className="text-sm sm:text-base">Jumlah Air (ml)</Label>
                      <Input
                        id="water"
                        type="number"
                        placeholder="250"
                        value={water}
                        onChange={(e) => setWater(e.target.value)}
                        required
                        className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                        min={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Target harian: 2000-3000ml
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] text-sm sm:text-base py-2 sm:py-3" 
                      disabled={loading || !water}
                    >
                      {loading ? 'Menyimpan...' : '💧 Simpan Data Air'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="sleep" className="animate-fade-in space-y-3 sm:space-y-4 pt-4">
                  <form onSubmit={handleSleepSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sleep" className="text-sm sm:text-base">Durasi Tidur (jam)</Label>
                      <Input
                        id="sleep"
                        type="number"
                        step={0.5}
                        placeholder="7.5"
                        value={sleep}
                        onChange={(e) => setSleep(e.target.value)}
                        required
                        className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                        min={0}
                        max={24}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quality" className="text-sm sm:text-base">Kualitas Tidur</Label>
                      <Select value={sleepQuality} onValueChange={setSleepQuality} required>
                        <SelectTrigger className="transition-all focus:scale-[1.01] text-sm sm:text-base">
                          <SelectValue placeholder="Pilih kualitas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">😴 Buruk</SelectItem>
                          <SelectItem value="fair">😐 Cukup</SelectItem>
                          <SelectItem value="good">😊 Baik</SelectItem>
                          <SelectItem value="excellent">😄 Sangat Baik</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Target: 7-9 jam tidur berkualitas
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] text-sm sm:text-base py-2 sm:py-3" 
                      disabled={loading || !sleep || !sleepQuality}
                    >
                      {loading ? 'Menyimpan...' : '🌙 Simpan Data Tidur'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="steps" className="animate-fade-in space-y-3 sm:space-y-4 pt-4">
                  <form onSubmit={handleStepsSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="steps" className="text-sm sm:text-base">Jumlah Langkah</Label>
                      <Input
                        id="steps"
                        type="number"
                        placeholder="5000"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        required
                        className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                        min={0}
                      />
                      <p className="text-xs text-muted-foreground">
                        Target harian: 8000-10000 langkah
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] text-sm sm:text-base py-2 sm:py-3" 
                      disabled={loading || !steps}
                    >
                      {loading ? 'Menyimpan...' : '🚶 Simpan Data Langkah'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="mood" className="animate-fade-in space-y-3 sm:space-y-4 pt-4">
                  <form onSubmit={handleMoodSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mood" className="text-sm sm:text-base">Mood Hari Ini</Label>
                      <Select value={mood} onValueChange={setMood} required>
                        <SelectTrigger className="transition-all focus:scale-[1.01] text-sm sm:text-base">
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
                      <Label htmlFor="notes" className="text-sm sm:text-base">Catatan (opsional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Bagaimana perasaan Anda hari ini..."
                        value={moodNotes}
                        onChange={(e) => setMoodNotes(e.target.value)}
                        className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] text-sm sm:text-base py-2 sm:py-3" 
                      disabled={loading || !mood}
                    >
                      {loading ? 'Menyimpan...' : '❤️ Simpan Data Mood'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="medicine" className="animate-fade-in space-y-3 sm:space-y-4 pt-4">
                  <form onSubmit={handleMedicineSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Apakah Anda minum obat hari ini?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={isTakingMedicine ? "default" : "outline"}
                          onClick={() => setIsTakingMedicine(true)}
                          className={isTakingMedicine ? "bg-gradient-primary text-xs sm:text-sm py-2" : "text-xs sm:text-sm py-2"}
                        >
                          💊 Ya, Minum Obat
                        </Button>
                        <Button
                          type="button"
                          variant={!isTakingMedicine ? "default" : "outline"}
                          onClick={() => setIsTakingMedicine(false)}
                          className={!isTakingMedicine ? "bg-gradient-primary text-xs sm:text-sm py-2" : "text-xs sm:text-sm py-2"}
                        >
                          ✅ Tidak Minum Obat
                        </Button>
                      </div>
                    </div>

                    {isTakingMedicine && (
                      <div className="space-y-3 sm:space-y-4 animate-fade-in">
                        <div className="space-y-2">
                          <Label htmlFor="medicine" className="text-sm sm:text-base">Nama Obat</Label>
                          <Input
                            id="medicine"
                            type="text"
                            placeholder="Paracetamol"
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            required={isTakingMedicine}
                            className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dosage" className="text-sm sm:text-base">Dosis (opsional)</Label>
                          <Input
                            id="dosage"
                            type="text"
                            placeholder="500mg"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] text-sm sm:text-base py-2 sm:py-3" 
                      disabled={loading}
                    >
                      {loading ? 'Menyimpan...' : '💊 Simpan Data Obat'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InputData;
