import { Search, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Search & Browse',
      description: 'Find salons, restaurants, or sports venues by location and category',
      gradient: 'from-blue-500 to-purple-600',
      color: 'text-blue-600',
    },
    {
      icon: Calendar,
      title: 'Pick Your Slot',
      description: 'Choose your preferred date and time with real-time availability',
      gradient: 'from-purple-500 to-pink-600',
      color: 'text-purple-600',
    },
    {
      icon: CheckCircle,
      title: 'Confirm Instantly',
      description: 'Get instant confirmation via WhatsApp with all booking details',
      gradient: 'from-pink-500 to-orange-500',
      color: 'text-pink-600',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-pink-100/30 via-purple-100/30 to-transparent rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm tracking-wider text-[var(--color-text-secondary)] uppercase px-4 py-2 bg-gray-100 rounded-full font-bold">
              How it Works
            </span>
          </div>
          <h2 className="mb-4">Book in Three Simple Steps</h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            Quick and seamless booking experience designed for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connecting Line - Desktop Only */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-[60%] w-[80%] h-0.5">
                    <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-transparent" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                )}

                <div className="text-center relative">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center text-sm shadow-lg`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Icon Container */}
                  <div className="relative mb-8 inline-block pt-4">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]`}>
                      <Icon className="w-11 h-11 text-white" />
                    </div>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  </div>

                  {/* Content */}
                  <h4 className="mb-3">{step.title}</h4>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
