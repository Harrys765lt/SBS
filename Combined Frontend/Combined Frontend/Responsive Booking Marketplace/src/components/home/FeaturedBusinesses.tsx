import { Business } from '../../types';
import { Star, MapPin, MessageCircle, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface FeaturedBusinessesProps {
  businesses: Business[];
  onBusinessClick: (businessId: string) => void;
}

export function FeaturedBusinesses({ businesses, onBusinessClick }: FeaturedBusinessesProps) {
  const getPriceRange = (level: number) => 'RM'.repeat(level);
  
  const formatHours = (hours: any) => {
    if (typeof hours === 'string') return hours;
    if (typeof hours === 'object' && hours !== null) {
      const firstKey = Object.keys(hours)[0];
      return hours[firstKey];
    }
    return 'Hours vary';
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <div>
            <div className="inline-block mb-4">
              <span className="text-sm tracking-wider text-[var(--color-text-secondary)] uppercase px-4 py-2 bg-white rounded-full shadow-soft border border-gray-100">
                Featured
              </span>
            </div>
            <h2 className="mb-3">Popular Venues</h2>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Top-rated venues with instant booking
            </p>
          </div>
          <Button
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-xl px-6 hidden md:flex items-center gap-2"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.slice(0, 6).map((business, index) => (
            <div
              key={business.id}
              onClick={() => onBusinessClick(business.id)}
              className="group bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] cursor-pointer border border-gray-100 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {business.whatsappEnabled && (
                    <Badge className="bg-emerald-500 text-white border-none shadow-lg rounded-lg backdrop-blur-sm">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Badge>
                  )}
                  {business.instantConfirm && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-lg rounded-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Instant
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="mb-1 group-hover:text-blue-600 transition-colors">{business.name}</h5>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="capitalize">{business.category}</span>
                      <span>•</span>
                      <span className="text-orange-500">{getPriceRange(business.priceRange)}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{business.rating}</span>
                  <span className="text-[var(--color-text-secondary)] text-sm">
                    ({business.reviewCount})
                  </span>
                </div>

                {/* Location & Hours */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{business.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatHours(business.hours)}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-tertiary)]">
                      {business.services?.length || 0} services
                    </span>
                    <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <span>View details</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
