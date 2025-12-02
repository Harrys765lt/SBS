import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  Settings,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface YearData {
  todaysBookings: number;
  weekOccupancy: number;
  weeklyRevenue: number;
  noShowRate: number;
  staffUtilization: number;
  satisfaction: number;
  peakHour: string;
  totalBookings: number;
  bookingByTime: number[];
  bookingByDay: number[];
  weeklyBookings: number[];
  satisfactionTrend: number[];
  monthlyBookings2024: number[];
  monthlyBookings2023: number[];
}

const yearlyData: Record<string, YearData> = {
  '2025': {
    todaysBookings: 24,
    weekOccupancy: 78,
    weeklyRevenue: 8450,
    noShowRate: 3.2,
    staffUtilization: 85,
    satisfaction: 4.6,
    peakHour: '2-5 PM',
    totalBookings: 142,
    bookingByTime: [3, 5, 7, 4, 6, 8, 9, 12],
    bookingByDay: [20, 30, 25, 15, 10],
    weeklyBookings: [15, 20, 25, 18, 30],
    satisfactionTrend: [4, 5, 4, 3, 4, 5],
    monthlyBookings2024: [142, 165, 189, 178, 205, 218, 235, 248, 229, 267, 285, 312],
    monthlyBookings2023: [118, 135, 152, 148, 175, 188, 198, 215, 201, 225, 242, 268]
  },
  '2024': {
    todaysBookings: 22,
    weekOccupancy: 72,
    weeklyRevenue: 7850,
    noShowRate: 4.1,
    staffUtilization: 80,
    satisfaction: 4.4,
    peakHour: '3-6 PM',
    totalBookings: 128,
    bookingByTime: [2, 4, 6, 5, 7, 9, 11, 14],
    bookingByDay: [18, 28, 22, 17, 15],
    weeklyBookings: [12, 18, 22, 16, 28],
    satisfactionTrend: [3, 4, 4, 4, 5, 4],
    monthlyBookings2024: [118, 135, 152, 148, 175, 188, 198, 215, 201, 225, 242, 268],
    monthlyBookings2023: [95, 112, 128, 125, 145, 158, 168, 185, 172, 195, 212, 238]
  },
  '2023': {
    todaysBookings: 18,
    weekOccupancy: 65,
    weeklyRevenue: 6950,
    noShowRate: 5.3,
    staffUtilization: 75,
    satisfaction: 4.2,
    peakHour: '2-5 PM',
    totalBookings: 115,
    bookingByTime: [2, 3, 5, 4, 6, 7, 8, 10],
    bookingByDay: [15, 25, 20, 14, 12],
    weeklyBookings: [10, 15, 20, 14, 25],
    satisfactionTrend: [3, 4, 3, 4, 4, 4],
    monthlyBookings2024: [95, 112, 128, 125, 145, 158, 168, 185, 172, 195, 212, 238],
    monthlyBookings2023: [78, 92, 105, 102, 120, 132, 142, 158, 145, 168, 185, 208]
  }
};

const channelData = [
  { name: 'WhatsApp', value: 68, color: '#25D366' },
  { name: 'Web Portal', value: 32, color: '#3B82F6' }
];

const topServices = [
  { name: 'Haircut & Style', bookings: 45, revenue: 2250 },
  { name: 'Hair Coloring', bookings: 28, revenue: 2240 },
  { name: 'Beard Trim', bookings: 32, revenue: 960 },
  { name: 'Deep Conditioning', bookings: 18, revenue: 900 }
];

const ratingData = [
  { name: '1 Star', value: 5 },
  { name: '2 Stars', value: 10 },
  { name: '3 Stars', value: 15 },
  { name: '4 Stars', value: 20 },
  { name: '5 Stars', value: 50 }
];

const completionRateData = [
  { day: 'Mon', rate: 92 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 95 },
  { day: 'Thu', rate: 90 },
  { day: 'Fri', rate: 97 },
  { day: 'Sat', rate: 85 },
  { day: 'Sun', rate: 93 }
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const currentData = yearlyData[selectedYear];

  // Animation variants for scroll-triggered animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  };

  // Container for staggered children
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Generate dynamic chart data based on selected year
  const bookingByTimeData = [
    { hour: '10 AM', bookings: currentData.bookingByTime[0] },
    { hour: '11 AM', bookings: currentData.bookingByTime[1] },
    { hour: '12 PM', bookings: currentData.bookingByTime[2] },
    { hour: '1 PM', bookings: currentData.bookingByTime[3] },
    { hour: '2 PM', bookings: currentData.bookingByTime[4] },
    { hour: '3 PM', bookings: currentData.bookingByTime[5] },
    { hour: '4 PM', bookings: currentData.bookingByTime[6] },
    { hour: '5 PM', bookings: currentData.bookingByTime[7] }
  ];

  const weeklyBookingsData = [
    { day: 'Mon', bookings: currentData.weeklyBookings[0] },
    { day: 'Tue', bookings: currentData.weeklyBookings[1] },
    { day: 'Wed', bookings: currentData.weeklyBookings[2] },
    { day: 'Thu', bookings: currentData.weeklyBookings[3] },
    { day: 'Fri', bookings: currentData.weeklyBookings[4] }
  ];

  const satisfactionTrendData = [
    { hour: '8 AM', score: currentData.satisfactionTrend[0] },
    { hour: '9 AM', score: currentData.satisfactionTrend[1] },
    { hour: '10 AM', score: currentData.satisfactionTrend[2] },
    { hour: '11 AM', score: currentData.satisfactionTrend[3] },
    { hour: '12 PM', score: currentData.satisfactionTrend[4] },
    { hour: '1 PM', score: currentData.satisfactionTrend[5] }
  ];

  const monthlyComparisonData = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ].map((month, index) => ({
    month,
    [selectedYear]: currentData.monthlyBookings2024[index],
    [String(Number(selectedYear) - 1)]: currentData.monthlyBookings2023[index]
  }));

  const satisfactionByDayData = [
    { day: 'Monday', score: currentData.bookingByDay[0] },
    { day: 'Tuesday', score: currentData.bookingByDay[1] },
    { day: 'Wednesday', score: currentData.bookingByDay[2] },
    { day: 'Thursday', score: currentData.bookingByDay[3] },
    { day: 'Friday', score: currentData.bookingByDay[4] }
  ];
  return (
    <div className="space-y-6 min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #FFE8F0 0%, #F0E6FF 50%, #E0EEFF 100%)' }}>
      {/* Year Filter */}
      <motion.div 
        className="flex justify-between items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        variants={fadeInUp}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your business performance</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* WhatsApp Automation Status */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        variants={fadeInUp}
      >
        <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>WhatsApp automation enabled:</strong> Incoming messages are parsed, slots auto-held, and bookings auto-confirmed without staff manual reading.
        </AlertDescription>
      </Alert>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.todaysBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.weekOccupancy}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last week
            </p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-show Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.noShowRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+0.5%</span> from last week
            </p>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.weeklyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18%</span> from last week
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      {/* Additional Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.staffUtilization}%</div>
            <p className="text-xs text-muted-foreground">Optimal efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.satisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">Customer feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.peakHour}</div>
            <p className="text-xs text-muted-foreground">Busiest time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalBookings}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Time */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Time</CardTitle>
            <CardDescription>Distribution throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingByTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#0d6efd" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Day</CardTitle>
            <CardDescription>Weekly booking trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyBookingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#0d6efd" 
                  strokeWidth={3}
                  dot={{ fill: '#0d6efd', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Score by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction by Day</CardTitle>
            <CardDescription>Customer ratings distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={satisfactionByDayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="score"
                  label
                >
                  <Cell fill="#0d6efd" />
                  <Cell fill="#198754" />
                  <Cell fill="#ffc107" />
                  <Cell fill="#dc3545" />
                  <Cell fill="#6f42c1" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Satisfaction Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction</CardTitle>
            <CardDescription>Satisfaction scores throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#dc3545" 
                  strokeWidth={3}
                  dot={{ fill: '#dc3545', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Trends - Year Comparison</CardTitle>
          <CardDescription>Monthly booking amounts for {selectedYear} vs {Number(selectedYear) - 1}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedYear} 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 5 }}
                name={`${selectedYear} Bookings`}
              />
              <Line 
                type="monotone" 
                dataKey={String(Number(selectedYear) - 1)} 
                stroke="#764ba2" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#764ba2', strokeWidth: 2, r: 4 }}
                name={`${Number(selectedYear) - 1} Bookings`}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Completion Rate and Customer Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Service Completion Rate</CardTitle>
            <CardDescription>Completion percentage by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={completionRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#a8edea" 
                  fill="#a8edea" 
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Ratings</CardTitle>
            <CardDescription>Rating distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#dc3545" />
                  <Cell fill="#ffc107" />
                  <Cell fill="#0dcaf0" />
                  <Cell fill="#198754" />
                  <Cell fill="#6f42c1" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Split & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Split */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Channels</CardTitle>
            <CardDescription>WhatsApp vs Web Portal bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {channelData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                    <Badge variant="secondary">{item.value}%</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">
                  WhatsApp automation is driving 68% of your bookings!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>Most popular services this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${service.revenue}</p>
                    <p className="text-sm text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigate('calendar')}
            >
              <Calendar className="h-6 w-6" />
              <span>Manage Slots</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigate('calendar')}
            >
              <Clock className="h-6 w-6" />
              <span>View Calendar</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigate('automations')}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Message Templates</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            WhatsApp Automation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Auto-hold Slots</p>
                <p className="text-xs text-muted-foreground">10 min hold time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Auto-confirm</p>
                <p className="text-xs text-muted-foreground">When details complete</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Smart Responses</p>
                <p className="text-xs text-muted-foreground">AI-powered replies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Reminders</p>
                <p className="text-xs text-muted-foreground">24h & 3h before</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}