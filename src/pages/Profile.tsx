import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Mail, Calendar } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Gagal memuat profil');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('✅ Profil berhasil diperbarui!');
      fetchProfile();
    } catch (error: any) {
      toast.error('❌ Gagal memperbarui profil: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!profile) {
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

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Profil Saya</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Kelola informasi profil Anda
            </p>
          </div>

          <Card className="shadow-medium animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-primary text-white text-xl sm:text-2xl">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl sm:text-2xl">{profile.full_name || 'Nama Belum Diisi'}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-sm sm:text-base truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Bergabung Sejak</p>
                    <p className="font-medium text-sm sm:text-base">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edit Profil
                </h3>
                <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm sm:text-base">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="transition-all focus:scale-[1.01] text-sm sm:text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] text-sm sm:text-base py-2 sm:py-3"
                    disabled={loading || fullName === profile.full_name}
                  >
                    {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                  </Button>
                </form>
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Statistik Akun</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-card p-3 sm:p-4 rounded-lg shadow-soft">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Hari</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                  <div className="bg-gradient-card p-3 sm:p-4 rounded-lg shadow-soft">
                    <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-500">Aktif</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
