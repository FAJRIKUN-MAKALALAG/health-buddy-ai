import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Sparkles, MessageSquare } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Health Tracker</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              HealthyMe
            </span>
            <br />
            <span className="text-4xl md:text-5xl text-foreground">
              Pantau Kesehatan Anda
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Dashboard kesehatan pintar dengan AI assistant yang membantu Anda 
            melacak aktivitas harian, tidur, hidrasi, dan mood dengan mudah.
          </p>
          
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-glow text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Mulai Sekarang
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-medium hover:shadow-glow transition-shadow">
            <div className="bg-health-water/10 p-4 rounded-xl w-fit mb-4">
              <Activity className="w-8 h-8 text-health-water" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Tracking Lengkap</h3>
            <p className="text-muted-foreground">
              Catat air minum, tidur, langkah kaki, mood, dan obat dalam satu aplikasi terintegrasi.
            </p>
          </div>
          
          <div className="bg-gradient-card rounded-2xl p-8 shadow-medium hover:shadow-glow transition-shadow">
            <div className="bg-health-mood/10 p-4 rounded-xl w-fit mb-4">
              <MessageSquare className="w-8 h-8 text-health-mood" />
            </div>
            <h3 className="text-2xl font-bold mb-2">AI Health Assistant</h3>
            <p className="text-muted-foreground">
              Chat dengan AI untuk mendapat saran kesehatan atau gunakan perintah voice untuk input cepat.
            </p>
          </div>
          
          <div className="bg-gradient-card rounded-2xl p-8 shadow-medium hover:shadow-glow transition-shadow">
            <div className="bg-health-steps/10 p-4 rounded-xl w-fit mb-4">
              <Heart className="w-8 h-8 text-health-steps" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Analisis Real-time</h3>
            <p className="text-muted-foreground">
              Lihat grafik dan tren kesehatan Anda dengan visualisasi data yang interaktif dan mudah dipahami.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-primary rounded-3xl p-12 text-center shadow-glow">
          <h2 className="text-4xl font-bold text-white mb-4">
            Siap untuk Hidup Lebih Sehat?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pengguna yang sudah meningkatkan kualitas hidup mereka dengan HealthyMe
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={() => navigate('/auth')}
          >
            Daftar Gratis
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
