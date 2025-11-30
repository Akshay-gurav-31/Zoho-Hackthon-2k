import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  MessageSquare,
  Calendar,
  Download,
  Activity,
  Users,
  PieChart as PieChartIcon,
  Smartphone,
  Globe,
  Clock,
  CalendarDays,
  BarChart3,
  LineChart as LineChartIcon,
  Type
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from "recharts";
import { getAllFeedback, subscribeFeedback } from "@/services/feedbackService";
import type { Feedback as FeedbackType } from "@/services/feedbackService";

interface Feedback {
  name: string;
  email: string;
  rating: number;
  comment: string;
  timestamp: string;
  page: string;
  device: string;
}

const Dashboard = () => {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial feedback data
    const fetchFeedback = async () => {
      try {
        const data = await getAllFeedback();
        setFeedbackData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setLoading(false);
      }
    };

    fetchFeedback();

    // Subscribe to updates
    const subscription = subscribeFeedback((newFeedback) => {
      setFeedbackData(prevData => [newFeedback, ...prevData]);
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Color Palette
  const COLORS = {
    bg: "#1a1f2c",
    cardBg: "#1e2532",
    text: "#ffffff",
    textMuted: "#94a3b8",
    blue: "#3b82f6",
    cyan: "#06b6d4",
    purple: "#8b5cf6",
    pink: "#ec4899",
    green: "#22c55e",
    yellow: "#eab308",
    orange: "#f97316",
    red: "#ef4444",
    darkGray: "#334155",
    indigo: "#6366f1"
  };

  const avgRating = useMemo(() => {
    if (feedbackData.length === 0) return "0.00";
    return (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(2);
  }, [feedbackData]);

  const npsScore = useMemo(() => {
    if (feedbackData.length === 0) return 0;
    let promoters = 0;
    let detractors = 0;
    feedbackData.forEach(f => {
      if (f.rating === 5) promoters++;
      else if (f.rating <= 3) detractors++;
    });
    return ((promoters - detractors) / feedbackData.length) * 100;
  }, [feedbackData]);

  const totalFeedback = feedbackData.length;

  // --- Existing Charts Data ---

  const sentimentOverTime = useMemo(() => {
    const map = new Map<string, { date: string; Positive: number; Neutral: number; Negative: number }>();
    const chronologicalData = [...feedbackData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    chronologicalData.forEach(f => {
      const date = new Date(f.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map.has(date)) map.set(date, { date, Positive: 0, Neutral: 0, Negative: 0 });
      const entry = map.get(date)!;
      if (f.rating >= 4) entry.Positive++;
      else if (f.rating === 3) entry.Neutral++;
      else entry.Negative++;
    });
    return Array.from(map.values());
  }, [feedbackData]);

  const ratingDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    feedbackData.forEach(f => {
      if (f.rating >= 1 && f.rating <= 5) counts[f.rating - 1]++;
    });
    return counts.map((count, idx) => ({ name: `${idx + 1} Star`, value: count }));
  }, [feedbackData]);

  const npsBreakdown = useMemo(() => {
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    feedbackData.forEach(f => {
      if (f.rating === 5) promoters++;
      else if (f.rating === 4) passives++;
      else detractors++;
    });
    return [
      { name: "Promoters", value: promoters, fill: COLORS.green },
      { name: "Passives", value: passives, fill: COLORS.yellow },
      { name: "Detractors", value: detractors, fill: COLORS.red },
    ];
  }, [feedbackData]);

  const npsGaugeData = useMemo(() => {
    const normalizedScore = (npsScore + 100) / 2;
    return [
      { name: "Score", value: normalizedScore, fill: npsScore > 30 ? COLORS.green : npsScore > 0 ? COLORS.yellow : COLORS.red },
      { name: "Remaining", value: 100 - normalizedScore, fill: COLORS.darkGray }
    ];
  }, [npsScore]);

  // --- NEW 10 CHARTS DATA ---

  // 1. Feedback by Page
  const feedbackByPage = useMemo(() => {
    const map = new Map<string, number>();
    feedbackData.forEach(f => {
      const path = f.page ? new URL(f.page).pathname : '/';
      map.set(path, (map.get(path) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [feedbackData]);

  // 2. Device Type Distribution
  const deviceTypeData = useMemo(() => {
    let mobile = 0;
    let desktop = 0;
    feedbackData.forEach(f => {
      if (/Mobile|Android|iPhone/i.test(f.device || '')) mobile++;
      else desktop++;
    });
    return [
      { name: "Mobile", value: mobile, fill: COLORS.purple },
      { name: "Desktop", value: desktop, fill: COLORS.blue },
    ];
  }, [feedbackData]);

  // 3. Browser Distribution
  const browserData = useMemo(() => {
    const map = new Map<string, number>();
    feedbackData.forEach(f => {
      const ua = f.device || '';
      let browser = "Other";
      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";
      map.set(browser, (map.get(browser) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [feedbackData]);

  // 4. Hourly Activity
  const hourlyActivity = useMemo(() => {
    const hours = new Array(24).fill(0);
    feedbackData.forEach(f => {
      const hour = new Date(f.timestamp).getHours();
      hours[hour]++;
    });
    return hours.map((count, hour) => ({ name: `${hour}:00`, value: count }));
  }, [feedbackData]);

  // 5. Daily Activity (Day of Week)
  const dailyActivity = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Array(7).fill(0);
    feedbackData.forEach(f => {
      const day = new Date(f.timestamp).getDay();
      counts[day]++;
    });
    return days.map((day, idx) => ({ name: day, value: counts[idx] }));
  }, [feedbackData]);

  // 6. NPS Trend (Daily)
  const npsTrend = useMemo(() => {
    const map = new Map<string, { promoters: number; detractors: number; total: number }>();
    const chronologicalData = [...feedbackData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    chronologicalData.forEach(f => {
      const date = new Date(f.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map.has(date)) map.set(date, { promoters: 0, detractors: 0, total: 0 });
      const entry = map.get(date)!;
      entry.total++;
      if (f.rating === 5) entry.promoters++;
      else if (f.rating <= 3) entry.detractors++;
    });
    return Array.from(map.entries()).map(([date, data]) => ({
      date,
      nps: ((data.promoters - data.detractors) / data.total) * 100
    }));
  }, [feedbackData]);

  // 7. Avg Rating Trend (Daily)
  const avgRatingTrend = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    const chronologicalData = [...feedbackData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    chronologicalData.forEach(f => {
      const date = new Date(f.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map.has(date)) map.set(date, { sum: 0, count: 0 });
      const entry = map.get(date)!;
      entry.sum += f.rating;
      entry.count++;
    });
    return Array.from(map.entries()).map(([date, data]) => ({
      date,
      rating: (data.sum / data.count).toFixed(1)
    }));
  }, [feedbackData]);

  // 8. Comment Length Analysis
  const commentLengthData = useMemo(() => {
    const map = new Map<number, { sum: number; count: number }>();
    feedbackData.forEach(f => {
      if (!map.has(f.rating)) map.set(f.rating, { sum: 0, count: 0 });
      const entry = map.get(f.rating)!;
      entry.sum += f.comment.length;
      entry.count++;
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([rating, data]) => ({
      name: `${rating} Star`,
      length: Math.round(data.sum / data.count)
    }));
  }, [feedbackData]);

  // 9. Monthly Activity
  const monthlyActivity = useMemo(() => {
    const map = new Map<string, number>();
    feedbackData.forEach(f => {
      const month = new Date(f.timestamp).toLocaleDateString('en-US', { month: 'short' });
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [feedbackData]);

  // 10. Cumulative Growth
  const cumulativeGrowth = useMemo(() => {
    let total = 0;
    const chronologicalData = [...feedbackData].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return chronologicalData.map(f => {
      total++;
      return {
        date: new Date(f.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total
      };
    });
  }, [feedbackData]);


  const downloadCSV = () => {
    const headers = ["Name", "Email", "Rating", "Comment", "Date", "Time"];
    const csvContent = [
      headers.join(","),
      ...feedbackData.map(f => {
        const date = new Date(f.timestamp).toLocaleDateString();
        const time = new Date(f.timestamp).toLocaleTimeString();
        const escapedComment = `"${f.comment.replace(/"/g, '')}"`;
        return [
          `"${f.name}"`,
          `"${f.email}"`,
          f.rating,
          escapedComment,
          date,
          time
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "feediq_feedback_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e2532] border border-gray-700 p-2 rounded shadow-lg text-white text-xs">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color || entry.fill }} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen w-screen bg-[#1a1f2c] text-white overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-[#1e2532] border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white uppercase">FeedIQ Analytics</h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Real-time Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button
            onClick={downloadCSV}
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">FeedIQ</h2>
            <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center border-2 border-cyan-500">
              <span className="text-cyan-300 font-bold text-lg">F</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid - Scrollable */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-12 gap-4 pb-10">

          {/* ROW 1: KPIs */}
          <div className="col-span-12 grid grid-cols-3 gap-4">
            <Card className="bg-[#1e2532] border-gray-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Average Rating</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{avgRating}</span>
                  <span className="text-sm text-gray-400">/ 5.0</span>
                </div>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
            </Card>

            <Card className="bg-[#1e2532] border-gray-800 p-2 flex flex-col items-center justify-center relative overflow-hidden h-[120px]">
              <h3 className="text-gray-400 text-sm font-medium absolute top-2 left-4">NPS Score</h3>
              <div className="w-full h-full flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="140%">
                  <PieChart>
                    <Pie
                      data={npsGaugeData}
                      cx="50%"
                      cy="70%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius="60%"
                      outerRadius="80%"
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={npsGaugeData[0].fill} />
                      <Cell fill={npsGaugeData[1].fill} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-3xl font-bold text-white">{npsScore.toFixed(0)}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1e2532] border-gray-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Responses</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{totalFeedback}</span>
                  <span className="text-sm text-gray-400">submissions</span>
                </div>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* ROW 2: Sentiment & Ratings */}
          <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">
            <Card className="col-span-8 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Sentiment Over Time
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentOverTime}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Positive" stackId="a" fill={COLORS.green} />
                    <Bar dataKey="Neutral" stackId="a" fill={COLORS.yellow} />
                    <Bar dataKey="Negative" stackId="a" fill={COLORS.red} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="col-span-4 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                Rating Distribution
              </h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[COLORS.red, COLORS.orange, COLORS.yellow, COLORS.blue, COLORS.green][index]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{totalFeedback}</span>
                  <p className="text-[10px] text-gray-400">Total</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ROW 3: Device & Browser */}
          <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">
            <Card className="col-span-6 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pink-400" />
                Device Distribution
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="col-span-6 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Browser Usage
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ROW 4: Hourly & Daily Activity */}
          <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">
            <Card className="col-span-8 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Hourly Activity (24h)
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyActivity}>
                    <defs>
                      <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={COLORS.orange} fillOpacity={1} fill="url(#colorHourly)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="col-span-4 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-green-400" />
                Weekly Pattern
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ROW 5: Trends (NPS & Avg Rating) */}
          <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">
            <Card className="col-span-6 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-blue-400" />
                NPS Trend
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={npsTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="nps" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="col-span-6 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Avg Rating Trend
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={avgRatingTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="rating" stroke={COLORS.yellow} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ROW 6: Comment Length & Growth */}
          <div className="col-span-12 grid grid-cols-12 gap-4 h-[300px]">
            <Card className="col-span-6 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-400" />
                Avg Comment Length (chars)
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={commentLengthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="length" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="col-span-6 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-400" />
                Cumulative Growth
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeGrowth}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" stroke={COLORS.red} fillOpacity={1} fill="url(#colorGrowth)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ROW 7: Page Views & Recent Feedback */}
          <div className="col-span-12 grid grid-cols-12 gap-4 h-[400px]">
            {/* Feedback by Page - REPLACED WITH NEW CHART */}
            <Card className="col-span-4 bg-[#1e2532] border-gray-800 p-4 flex flex-col">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Rating Trends
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={avgRatingTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="rating" stroke={COLORS.indigo} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent Feedback List */}
            <Card className="col-span-8 bg-[#1e2532] border-gray-800 p-4 flex flex-col overflow-hidden">
              <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                Recent Feedback
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {feedbackData.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No feedback received yet.
                  </div>
                ) : (
                  feedbackData.map((feedback, idx) => (
                    <div key={idx} className="bg-[#1a1f2c] p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                            {feedback.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{feedback.name}</p>
                            <p className="text-[10px] text-gray-400">{feedback.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= feedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-700"}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(feedback.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 pl-10 border-l-2 border-gray-700 ml-4 italic">
                        "{feedback.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;