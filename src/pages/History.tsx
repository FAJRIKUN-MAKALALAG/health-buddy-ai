import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Calendar, Trash2, Edit2, Droplet, Moon, Footprints, Heart, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface HealthEntry {
  id: string;
  type: 'water' | 'sleep' | 'steps' | 'mood' | 'medicine';
  date: string;
  data: any;
}

const History = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Record<string, HealthEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editEntry, setEditEntry] = useState<HealthEntry | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [waterData, sleepData, stepsData, moodData, medicineData] = await Promise.all([
        supabase.from('water_intake').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }),
        supabase.from('sleep_logs').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }),
        supabase.from('step_logs').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }),
        supabase.from('health_logs').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }),
        supabase.from('medicine_logs').select('*').eq('user_id', user.id).order('taken_at', { ascending: false })
      ]);

      const grouped: Record<string, HealthEntry[]> = {};

      // Group water entries
      waterData.data?.forEach(item => {
        const date = format(new Date(item.recorded_at), 'yyyy-MM-dd');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ id: item.id, type: 'water', date, data: item });
      });

      // Group sleep entries
      sleepData.data?.forEach(item => {
        const date = format(new Date(item.recorded_at), 'yyyy-MM-dd');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ id: item.id, type: 'sleep', date, data: item });
      });

      // Group steps entries
      stepsData.data?.forEach(item => {
        const date = format(new Date(item.recorded_at), 'yyyy-MM-dd');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ id: item.id, type: 'steps', date, data: item });
      });

      // Group mood entries
      moodData.data?.forEach(item => {
        const date = format(new Date(item.recorded_at), 'yyyy-MM-dd');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ id: item.id, type: 'mood', date, data: item });
      });

      // Group medicine entries
      medicineData.data?.forEach(item => {
        const date = format(new Date(item.taken_at), 'yyyy-MM-dd');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ id: item.id, type: 'medicine', date, data: item });
      });

      setEntries(grouped);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entry: HealthEntry) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    try {
      let error;
      
      if (entry.type === 'water') {
        ({ error } = await supabase.from('water_intake').delete().eq('id', entry.id));
      } else if (entry.type === 'sleep') {
        ({ error } = await supabase.from('sleep_logs').delete().eq('id', entry.id));
      } else if (entry.type === 'steps') {
        ({ error } = await supabase.from('step_logs').delete().eq('id', entry.id));
      } else if (entry.type === 'mood') {
        ({ error } = await supabase.from('health_logs').delete().eq('id', entry.id));
      } else if (entry.type === 'medicine') {
        ({ error } = await supabase.from('medicine_logs').delete().eq('id', entry.id));
      }

      if (error) throw error;

      toast.success('Data berhasil dihapus');
      fetchAllData();
    } catch (error: any) {
      toast.error('Gagal menghapus data: ' + error.message);
    }
  };

  const handleEdit = (entry: HealthEntry) => {
    setEditEntry(entry);
    setEditValues(entry.data);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editEntry) return;

    try {
      let error;
      
      if (editEntry.type === 'water') {
        ({ error } = await supabase.from('water_intake').update(editValues).eq('id', editEntry.id));
      } else if (editEntry.type === 'sleep') {
        ({ error } = await supabase.from('sleep_logs').update(editValues).eq('id', editEntry.id));
      } else if (editEntry.type === 'steps') {
        ({ error } = await supabase.from('step_logs').update(editValues).eq('id', editEntry.id));
      } else if (editEntry.type === 'mood') {
        ({ error } = await supabase.from('health_logs').update(editValues).eq('id', editEntry.id));
      } else if (editEntry.type === 'medicine') {
        ({ error } = await supabase.from('medicine_logs').update(editValues).eq('id', editEntry.id));
      }

      if (error) throw error;

      toast.success('Data berhasil diperbarui');
      setEditDialog(false);
      fetchAllData();
    } catch (error: any) {
      toast.error('Gagal memperbarui data: ' + error.message);
    }
  };

  const getIcon = (type: string) => {
    const icons = {
      water: <Droplet className="w-4 h-4 text-blue-500" />,
      sleep: <Moon className="w-4 h-4 text-purple-500" />,
      steps: <Footprints className="w-4 h-4 text-orange-500" />,
      mood: <Heart className="w-4 h-4 text-pink-500" />,
      medicine: <Pill className="w-4 h-4 text-green-500" />
    };
    return icons[type as keyof typeof icons];
  };

  const getLabel = (type: string) => {
    const labels = {
      water: 'Air Minum',
      sleep: 'Tidur',
      steps: 'Langkah',
      mood: 'Mood',
      medicine: 'Obat'
    };
    return labels[type as keyof typeof labels];
  };

  const formatEntryData = (entry: HealthEntry) => {
    switch (entry.type) {
      case 'water':
        return `${entry.data.amount_ml} ml`;
      case 'sleep':
        return `${entry.data.hours} jam (${entry.data.quality})`;
      case 'steps':
        return `${entry.data.steps} langkah`;
      case 'mood':
        return `${entry.data.mood}${entry.data.notes ? ` - ${entry.data.notes}` : ''}`;
      case 'medicine':
        return `${entry.data.medicine_name}${entry.data.dosage ? ` (${entry.data.dosage})` : ''}`;
      default:
        return '';
    }
  };

  const renderEditForm = () => {
    if (!editEntry) return null;

    switch (editEntry.type) {
      case 'water':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jumlah (ml)</label>
              <Input
                type="number"
                value={editValues.amount_ml || ''}
                onChange={(e) => setEditValues({ ...editValues, amount_ml: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );
      case 'sleep':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jam Tidur</label>
              <Input
                type="number"
                step="0.1"
                value={editValues.hours || ''}
                onChange={(e) => setEditValues({ ...editValues, hours: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Kualitas</label>
              <Select value={editValues.quality || ''} onValueChange={(value) => setEditValues({ ...editValues, quality: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Buruk</SelectItem>
                  <SelectItem value="fair">Cukup</SelectItem>
                  <SelectItem value="good">Baik</SelectItem>
                  <SelectItem value="excellent">Sangat Baik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'steps':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jumlah Langkah</label>
              <Input
                type="number"
                value={editValues.steps || ''}
                onChange={(e) => setEditValues({ ...editValues, steps: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );
      case 'mood':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mood</label>
              <Select value={editValues.mood || ''} onValueChange={(value) => setEditValues({ ...editValues, mood: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terrible">Sangat Buruk</SelectItem>
                  <SelectItem value="bad">Buruk</SelectItem>
                  <SelectItem value="okay">Biasa</SelectItem>
                  <SelectItem value="good">Baik</SelectItem>
                  <SelectItem value="great">Sangat Baik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Catatan (opsional)</label>
              <Textarea
                value={editValues.notes || ''}
                onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>
        );
      case 'medicine':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Obat</label>
              <Input
                value={editValues.medicine_name || ''}
                onChange={(e) => setEditValues({ ...editValues, medicine_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dosis (opsional)</label>
              <Input
                value={editValues.dosage || ''}
                onChange={(e) => setEditValues({ ...editValues, dosage: e.target.value })}
                placeholder="Contoh: 500mg"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Memuat data...</p>
        </div>
      </div>
    );
  }

  const sortedDates = Object.keys(entries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Riwayat Data Kesehatan
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Kelola dan edit data kesehatan yang sudah diinput
            </p>
          </div>

          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada data yang tercatat
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {sortedDates.map((date) => {
                const dateEntries = entries[date];
                const totalEntries = dateEntries.length;
                
                return (
                  <AccordionItem key={date} value={date} className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div className="text-left">
                            <p className="font-semibold">
                              {format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: id })}
                            </p>
                            <p className="text-sm text-muted-foreground">{totalEntries} catatan</p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {dateEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {getIcon(entry.type)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{getLabel(entry.type)}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {formatEntryData(entry)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(entry)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(entry)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editEntry && getLabel(editEntry.type)}</DialogTitle>
            <DialogDescription>
              Perbarui data yang sudah diinput
            </DialogDescription>
          </DialogHeader>
          {renderEditForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
