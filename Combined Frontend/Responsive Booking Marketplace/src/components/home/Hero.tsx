import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ArrowRight, Search, Calendar as CalendarIcon, MapPin, Clock, Users, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface HeroProps {
  onSearch: (params: any) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = () => {
    onSearch({
      location,
      date,
      time,
      partySize,
      category,
    });
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50/50 via-white to-cyan-50/50">
      {/* Soft Gradient Blobs - Matching Reference */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-200/40 via-pink-200/30 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-cyan-200/40 via-blue-200/30 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-transparent rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Content - Centered, Minimal */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Small Label */}
          <div className="mb-8 animate-fade-in">
            <span className="text-sm tracking-wider text-[var(--color-text-secondary)] uppercase font-bold">
              Fein Booking Platform
            </span>
          </div>

          {/* Large Bold Heading */}
          <h1 className="mb-8 text-[5.5rem] leading-[1] tracking-[-0.04em] animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Book Your
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Perfect Spot
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover and reserve premium salons, restaurants, and sports venues
            <br />
            across Kuala Lumpur with instant confirmation
          </p>

          {/* Futuristic Search Bar */}
          <div className="max-w-5xl mx-auto mb-16 animate-fade-in relative" style={{ animationDelay: '0.3s' }}>
            {/* Animated Gradient Border Wrapper */}
            <div className="relative p-[2px] rounded-[2rem] bg-transparent shadow-[0_0_40px_rgba(147,51,234,0.15)]">
              {/* Inner Container with Glassmorphism */}
              <div className="bg-gradient-to-br from-white/90 via-white/95 to-white/90 backdrop-blur-2xl rounded-[calc(2rem-2px)] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 relative overflow-hidden">
                {/* Floating Glow Orbs Inside */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
                  {/* Location */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-2 ml-1 font-bold tracking-wide uppercase">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 pointer-events-none z-10" />
                      <Input
                        placeholder="KLCC, Bangsar, Bukit Bintang..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-12 pr-4 h-14 bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-2 ml-1 font-bold tracking-wide uppercase">
                      Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-14 px-4 bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl font-normal hover:border-purple-300 hover:bg-white/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center w-full">
                            <CalendarIcon className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                            <span className="flex-1 text-left">{date ? format(date, 'MMM d') : 'Pick date'}</span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-2 ml-1 font-bold tracking-wide uppercase">
                      Time
                    </label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="w-full !h-14 !px-4 !py-0 bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl font-normal hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center w-full">
                          <Clock className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                          <SelectValue placeholder="Any time" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-2 ml-1 font-bold tracking-wide uppercase">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full !h-14 !px-4 !py-0 bg-white/60 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl font-normal hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="flex items-center w-full">
                          <LayoutGrid className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                          <SelectValue placeholder="All" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="salon">Salons</SelectItem>
                        <SelectItem value="restaurant">Restaurants</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Futuristic Search Button */}
                <div className="mt-8 relative z-10">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-500 shadow-[0_10px_40px_rgba(147,51,234,0.4)] hover:shadow-[0_15px_50px_rgba(147,51,234,0.6)] hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <Search className="mr-3 w-6 h-6 relative z-10" />
                    <span className="text-lg relative z-10">Search Venues</span>
                    <ArrowRight className="ml-3 w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Tech Particles */}
            <div className="absolute -top-4 -right-4 w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 -right-2 w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          </div>

          {/* Feature Pills */}

        </div>

        {/* Stats - Subtle */}
        <div className="grid grid-cols-3 gap-8 mt-32 text-center max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div>
            <div className="text-5xl mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">500+</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Verified Venues</div>
          </div>
          <div>
            <div className="text-5xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">50k+</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Happy Customers</div>
          </div>
          <div>
            <div className="text-5xl mb-3 bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">24/7</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Support Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}
