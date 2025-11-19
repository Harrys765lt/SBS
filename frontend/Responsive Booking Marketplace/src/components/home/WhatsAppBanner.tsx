import { MessageCircle, CheckCircle, Bell, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function WhatsAppBanner() {
  const features = [
    {
      icon: CheckCircle,
      text: 'Instant booking confirmations',
    },
    {
      icon: Bell,
      text: 'Real-time reminders & updates',
    },
    {
      icon: TrendingUp,
      text: 'Easy rescheduling via chat',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
      
      {/* Subtle Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-200/30 to-blue-200/30 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-12 lg:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-white/60">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full mb-6 border border-emerald-100">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">For Business Owners</span>
              </div>

              <h2 className="mb-4">
                Grow Your Business with Fein Booking
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                Join Malaysia's fastest-growing booking platform and reach thousands of customers. Our AI-powered WhatsApp chatbot handles bookings automatically, so you can focus on what you do best.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[var(--color-text-primary)]">
                    Automated booking management via WhatsApp
                  </span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[var(--color-text-primary)]">
                    Reach new customers across Malaysia
                  </span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[var(--color-text-primary)]">
                    Dashboard analytics to analyze your business
                  </span>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8 h-12">
                <MessageCircle className="mr-2 w-5 h-5" />
                Join Us Now
              </Button>
            </div>

            {/* Right Side - Mock Chat Interface */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] p-4 mb-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white">Fein Booking Bot</div>
                      <small className="text-emerald-100">
                        Online • Managing your bookings
                      </small>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-emerald-100">
                    <p className="text-sm text-gray-800">
                      🎉 New booking received for <strong>Lumière Salon</strong>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-emerald-100">
                    <p className="text-sm text-gray-800">
                      👤 Customer: Sarah Tan<br />
                      📅 Nov 20, 2025 at 2:00 PM<br />
                      💰 Revenue: <strong>RM 180</strong>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-emerald-100">
                    <p className="text-sm text-gray-800">
                      ✅ Confirmation sent to customer<br />
                      📊 Today's bookings: <strong>12</strong> • Revenue: <strong>RM 2,160</strong>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-4">
                  Fully automated - no manual work required
                </p>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
