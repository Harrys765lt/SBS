import { Scissors, UtensilsCrossed, Trophy, ArrowRight } from 'lucide-react';

interface CategoryTilesProps {
  onCategoryClick: (category: string) => void;
}

export function CategoryTiles({ onCategoryClick }: CategoryTilesProps) {
  const categories = [
    {
      id: 'salon',
      name: 'Salons & Spas',
      description: 'Premium styling and wellness',
      icon: Scissors,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      businesses: '120+ venues',
      iconColor: 'text-blue-600',
    },
    {
      id: 'restaurant',
      name: 'Restaurants',
      description: 'Distinguished dining experiences',
      icon: UtensilsCrossed,
      gradient: 'from-orange-500 to-pink-600',
      bgGradient: 'from-orange-50 to-pink-50',
      businesses: '250+ venues',
      iconColor: 'text-orange-600',
    },
    {
      id: 'sports',
      name: 'Sports & Fitness',
      description: 'Elite training facilities',
      icon: Trophy,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      businesses: '80+ venues',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm tracking-wider text-[var(--color-text-secondary)] uppercase px-4 py-2 bg-gray-100 rounded-full font-bold">
              Categories
            </span>
          </div>
          <h2 className="mb-4">Explore Our Services</h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            Discover and book premium venues across Kuala Lumpur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group relative bg-white rounded-3xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] cursor-pointer border border-gray-100 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                onClick={() => onCategoryClick(category.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h4 className="mb-2 group-hover:text-gray-900 transition-colors">{category.name}</h4>
                  <p className="text-[var(--color-text-secondary)] mb-6 text-sm">
                    {category.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                    <span className="text-xs text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                      {category.businesses}
                    </span>
                    <div className={`flex items-center gap-1 ${category.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}>
                      <span className="text-sm">Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
