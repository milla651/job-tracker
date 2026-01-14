import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Briefcase, 
  LineChart, 
  Calendar, 
  CheckCircle, 
  Target, 
  Bell, 
  Users,
  Rocket,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-blue-50/30" />
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-bl from-blue-200/20 to-cyan-200/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-gradient-to-tr from-emerald-200/10 to-green-200/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 mb-8 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                5,000+ Job Seekers Trust Us
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="block text-gray-900">Organize Your</span>
              <span className="text-gradient block">Job Search Journey</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop the spreadsheet chaos. Track applications, interviews, and follow-ups 
              in one beautiful, organized space built for real job seekers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register">
                <Button size="xl" className="group shadow-lg hover:shadow-xl">
                  <Rocket className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Free Forever
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl">
                  Sign In to Continue
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { value: "3.2x", label: "More Organized", icon: CheckCircle },
                { value: "89%", label: "Faster Follow-ups", icon: Zap },
                { value: "50+", label: "Apps Managed", icon: Target },
                { value: "100%", label: "Your Data", icon: Shield },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                      <stat.icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need, <span className="text-gradient">Nothing You Don't</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple yet powerful tool designed specifically for modern job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Briefcase,
                title: "Smart Tracking",
                description: "Log jobs in seconds with auto-suggest",
                color: "from-blue-500 to-cyan-400",
              },
              {
                icon: LineChart,
                title: "Progress Dashboard",
                description: "Visual insights into your search journey",
                color: "from-emerald-500 to-green-400",
              },
              {
                icon: Calendar,
                title: "Interview Calendar",
                description: "Never miss an interview again",
                color: "from-violet-500 to-purple-400",
              },
              {
                icon: Bell,
                title: "Smart Reminders",
                description: "Automated follow-up notifications",
                color: "from-rose-500 to-pink-400",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Powerful, <span className="text-primary">Effective</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in minutes, stay organized for months
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "01", title: "Add Jobs", description: "Quickly add job applications with details", icon: "📝" },
              { number: "02", title: "Track Status", description: "Update progress through each stage", icon: "📈" },
              { number: "03", title: "Get Reminders", description: "Automated notifications for follow-ups", icon: "🔔" },
              { number: "04", title: "Land Jobs", description: "Focus on interviews, not organization", icon: "🎯" },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200/50">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-sm font-mono text-primary font-bold mb-2">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12">
            {/* Animated background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-accent/10 rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-6">
                <Users className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-amber-100">
                  Join Successful Job Seekers
                </span>
              </div>
              
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
                Ready to <span className="text-gradient">Transform</span> Your Job Search?
              </h2>
              
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Stop wasting time on spreadsheets. Start tracking your journey to success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-brand text-white shadow-lg hover:shadow-xl">
                    <Sparkles className="mr-2 w-4 h-4" />
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-2 border-gray-600 text-gray-200 hover:border-primary hover:text-primary">
                    Sign In Now
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-400 mt-6">
                No credit card required • 100% free • Your data is yours forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">JobTracker</span>
                <p className="text-xs text-gray-500">Built by job seekers, for job seekers</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Privacy First</span>
              <span>•</span>
              <span>No Tracking</span>
              <span>•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}