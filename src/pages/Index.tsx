import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MessageSquare, BarChart3, CheckCircle2 } from "lucide-react";
import FeedbackBot from "@/components/FeedbackBot";

const Index = () => {
  const [showBot, setShowBot] = useState(false);

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/FeedIQ.png"
              alt="FeedIQ"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button className="gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-4 md:py-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Real-time Feedback System
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            We'd love to hear{" "}
            <span className="bg-gradient-to-r from-pink-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              your feedback
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Share your experience with us. Your insights help us improve and deliver better service every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button
              size="lg"
              onClick={() => setShowBot(true)}
              className="text-lg px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] border-0"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Give Feedback
            </Button>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            <Card className="p-6 text-center border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-600/5 opacity-50" />
              <div className="absolute inset-0 border border-white/10 rounded-xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_currentColor]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Easy to Use</h3>
                <p className="text-sm text-gray-400">
                  Simple chatbot interface guides you through the feedback process
                </p>
              </div>
            </Card>

            <Card className="p-6 text-center border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/5 opacity-50" />
              <div className="absolute inset-0 border border-white/10 rounded-xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_currentColor]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Real-time Validation</h3>
                <p className="text-sm text-gray-400">
                  Instant feedback validation ensures quality data collection
                </p>
              </div>
            </Card>

            <Card className="p-6 text-center border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/5 opacity-50" />
              <div className="absolute inset-0 border border-white/10 rounded-xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_currentColor]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Analytics Dashboard</h3>
                <p className="text-sm text-gray-400">
                  Comprehensive insights with beautiful visualizations
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Feedback Bot Modal */}
      {showBot && <FeedbackBot onClose={() => setShowBot(false)} />}
    </div>
  );
};

export default Index;