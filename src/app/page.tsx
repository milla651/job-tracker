import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Briefcase,
  LineChart,
  Calendar,
  Bell,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  Shield,
  Star,
  ChevronRight,
  Play,
  HelpCircle,
  Clock,
  Rocket,
  Award,
  Gauge,
  PieChart,
  TrendingDown,
  Lightbulb,
  Heart,
  Lock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default async function HomePage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is JobTracker free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, JobTracker is completely free for individual job seekers. You can track unlimited applications, manage interviews, and use our AI features without any cost.",
        },
      },
      {
        "@type": "Question",
        name: "How does the AI job tracking work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our AI helps you organize your search by automatically categorizing applications, suggesting follow-up times, and providing intelligent nudges based on your pipeline status.",
        },
      },
      {
        "@type": "Question",
        name: "Can I import jobs from LinkedIn or Indeed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can easily log jobs from any platform using our Quick Add feature. We are also working on a browser extension to one-click save jobs from major boards.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Your data is encrypted and stored securely. We do not sell your personal information to recruiters or third parties.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <JsonLd data={faqData} />
      {/* ============================================
          HERO SECTION - KENYA FOCUSED
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-28">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
        <div className="absolute inset-0 bg-aurora" />

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 fade-in-up border border-green-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-foreground/80">
                Join{" "}
                <span className="text-green-600 dark:text-green-400 font-bold">
                  3,500+ Kenyans
                </span>{" "}
                building their dream careers
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 fade-in-up fade-in-up-delay-1">
              <span className="block text-foreground">
                Master Your Job Search
              </span>
              <span className="text-gradient bg-gradient-to-r from-green-600 via-primary to-orange-500">
                The Smart Way
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed fade-in-up fade-in-up-delay-2">
              Stop juggling LinkedIn, WhatsApp, and spreadsheets. Track
              applications, manage interviews, and never miss an opportunity.
              <span className="block text-foreground/70 mt-3">
                Built for Kenya's job market. Used by everyone from fresh grads
                to seasoned professionals.
              </span>
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in-up fade-in-up-delay-3">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "xl" }),
                  "group bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:shadow-green-600/25 transition-all duration-500 rounded-2xl px-8",
                )}>
                <Rocket className="mr-2 w-5 h-5" />
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xl" }),
                  "group glass-card border-2 border-border/50 text-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary rounded-2xl px-8 transition-colors",
                )}>
                Watch Demo
                <Play className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* Social Proof Stats - Kenya Specific */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto fade-in-up fade-in-up-delay-4">
              {[
                { value: "3,500+", label: "Kenyans Hired", icon: Users },
                { value: "15K+", label: "Jobs Tracked", icon: Briefcase },
                { value: "83%", label: "Success Rate", icon: TrendingUp },
                { value: "2.3x", label: "Faster Offers", icon: Zap },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group glass-card-hover p-5 rounded-2xl text-center cursor-default border border-green-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="text-2xl sm:text-3xl font-bold">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Scroll to explore
          </span>
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>
      {/* ============================================
          FEATURES SECTION - KENYA BENEFITS
          ============================================ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-green-500/5 to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                Why JobTracker
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
              Built for the Kenya job market
              <span className="block text-gradient bg-gradient-to-r from-green-600 to-emerald-600">
                you know
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From Nairobi startups to multinational corporations. From tech
              roles to traditional sectors. We've got everyone covered.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden border border-green-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 mb-6">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Track Every Application
                </h3>
                <p className="text-muted-foreground mb-4">
                  From your first Email to HR to the final offer. Never lose
                  track of a single application across different platforms and
                  companies.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    Store in one place
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    Add custom notes
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden border border-orange-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Smart Interview Calendar
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sync interviews with your Google Calendar. Get reminders so
                  you never miss that important call with an employer.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    Calendar integration
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    Push reminders
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden border border-blue-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-6">
                  <LineChart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Visualize Your Progress
                </h3>
                <p className="text-muted-foreground mb-4">
                  See where you stand with beautiful dashboards. Track
                  conversion rates, interview success, and more.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    Real-time analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    Pipeline tracking
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden border border-purple-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  AI-Powered Follow-ups
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get smart reminders for when to follow up. Our AI knows the
                  perfect timing to maximize your response rate.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    Intelligent timing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    Follow-up templates
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden border border-cyan-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 mb-6">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  100% Private & Secure
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your data is yours. Encrypted and never shared with recruiters
                  or third parties. Trust matters.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    Bank-level encryption
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    No ads, no selling data
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden border border-rose-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 mb-6">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  By Kenyans, For Kenyans
                </h3>
                <p className="text-muted-foreground mb-4">
                  We understand the Kenya job market. From tech hubs in Nairobi
                  to opportunities countrywide.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    Local support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    Always free tier
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============================================
          HOW IT WORKS - SIMPLE 3 STEP PROCESS
          ============================================ */}
      <section id="how-it-works" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-green-500/5" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                The Simple Process
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
              Get started in minutes
              <span className="block text-gradient bg-gradient-to-r from-green-600 to-emerald-600">
                not hours
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to take control of your job search.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                icon: Briefcase,
                title: "Log Your Apps",
                description:
                  "Add any job you've applied to. Company name, role, link, contact person. Takes 30 seconds. We'll organize it all.",
                color: "from-green-600 to-emerald-600",
                lightColor: "green",
              },
              {
                step: "02",
                icon: Calendar,
                title: "Track Progress",
                description:
                  "Update statuses as things move forward. Got an interview? Update it. Rejected? Mark it. Watch your pipeline grow.",
                color: "from-orange-500 to-red-500",
                lightColor: "orange",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Land Offers",
                description:
                  "Get smart reminders for follow-ups and interviews. Visualize your success. Close the deal and celebrate!",
                color: "from-emerald-500 to-teal-600",
                lightColor: "emerald",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[calc(100%+12px)] w-[calc(100%-24px)] h-0.5">
                    <div className="h-full bg-gradient-to-r from-border via-green-500/30 to-border" />
                  </div>
                )}

                <div
                  className={`glass-card-hover p-8 rounded-3xl h-full border border-${item.lightColor}-500/20`}>
                  {/* Step Number & Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} mb-6`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="text-sm font-mono text-green-600 dark:text-green-400 font-bold mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ============================================
          KENYA TESTIMONIALS & SUCCESS STORIES
          ============================================ */}
      <section
        id="testimonials"
        className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-background to-background" />

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-600/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                Success Stories
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Real Kenyans Landing Jobs
              <span className="block text-gradient bg-gradient-to-r from-green-600 to-emerald-600">
                every single day
              </span>
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                quote:
                  "I was applying to jobs randomly on LinkedIn and WhatsApp. JobTracker helped me organize everything. Got 3 job offers in 2 months!",
                author: "Amina Hassan",
                role: "Software Engineer",
                company: "Safaricom",
                avatar: "AH",
                stars: 5,
                location: "Nairobi",
              },
              {
                quote:
                  "As someone who wasn't tech-savvy, this made job hunting stress-free. The calendar reminders saved me from missing interviews!",
                author: "David Kipchoge",
                role: "Marketing Manager",
                company: "Co-operative Bank",
                avatar: "DK",
                stars: 5,
                location: "Nairobi",
              },
              {
                quote:
                  "Best free tool for job hunting in Kenya. I tracked 30+ applications and landed my dream role at a Nairobi tech startup.",
                author: "Grace Wanjiru",
                role: "Product Manager",
                company: "Andela",
                avatar: "GW",
                stars: 5,
                location: "Nairobi",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group glass-card-hover p-8 rounded-3xl border border-green-500/20">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/90 text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} @ {testimonial.company}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                      📍 {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ============================================
          KENYA STATS SECTION
          ============================================ */}
      <section className="relative py-24 md:py-32 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              By The Numbers
              <span className="block text-gradient bg-gradient-to-r from-green-600 to-emerald-600">
                Kenya's Job Market
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real statistics from job seekers just like you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: "3,500+",
                label: "Kenyans Hired",
                subtext: "Last 12 months",
              },
              {
                value: "15K+",
                label: "Jobs Tracked",
                subtext: "Across all sectors",
              },
              {
                value: "83%",
                label: "Success Rate",
                subtext: "Interview to offer",
              },
              {
                value: "2.3x",
                label: "Faster Hiring",
                subtext: "vs. traditional methods",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-card border border-green-500/20">
                <div className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ============================================
          FAQ SECTION (KENYA-FOCUSED)
          ============================================ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <HelpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                Got Questions?
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked{" "}
              <span className="text-gradient bg-gradient-to-r from-green-600 to-emerald-600">
                Questions
              </span>
            </h2>
            <p className="text-muted-foreground">
              Everything Kenyans need to know about job hunting with JobTracker.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem
              value="item-1"
              className="glass-card px-6 rounded-2xl border border-green-500/20">
              <AccordionTrigger className="text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors py-6">
                Is JobTracker really free? Will you charge later?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Yes, completely free. Forever. We believe job hunting shouldn't
                cost money. We're building premium features for teams, but the
                core features you need will always be free for individual job
                seekers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-2"
              className="glass-card px-6 rounded-2xl border border-green-500/20">
              <AccordionTrigger className="text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors py-6">
                How long does setup take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                About 2-3 minutes. Create an account, add your first job, and
                you're ready. Your password resets, you sync your calendar, and
                you're off to the races.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-3"
              className="glass-card px-6 rounded-2xl border border-green-500/20">
              <AccordionTrigger className="text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors py-6">
                Can I use this for jobs outside Kenya?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Absolutely! While we built this for Kenya's job market, you can
                track applications for any company, anywhere. From Nairobi
                startups to international roles, we've got you covered.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-4"
              className="glass-card px-6 rounded-2xl border border-green-500/20">
              <AccordionTrigger className="text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors py-6">
                What about my privacy and data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Your data is yours. Encrypted, secure, and never sold. We don't
                share your information with recruiters or anyone else. No ads,
                no tracking, no nonsense.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-5"
              className="glass-card px-6 rounded-2xl border border-green-500/20">
              <AccordionTrigger className="text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors py-6">
                Do you support M-Pesa or local payment methods?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Since JobTracker is free, no payment needed! But when we launch
                premium features, we'll definitely support M-Pesa, Airtel Money,
                and other local payment methods.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>{" "}
      {/* ============================================
          FINAL CTA - KENYA FOCUSED
          ============================================ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-10 md:p-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-30" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-300/10 rounded-full blur-3xl animate-float-delayed" />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(white 1px, transparent 1px),
                                  linear-gradient(90deg, white 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur mb-8">
                <Rocket className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  Ready to transform your job search?
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Your dream job is
                <span className="block text-emerald-100 mt-2">
                  just a few applications away
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto font-medium">
                Join 3,500+ Kenyans who've already found success. Stop losing
                track of applications and start landing interviews.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "xl" }),
                    "group bg-white text-green-600 hover:bg-emerald-50 shadow-2xl hover:shadow-green-600/30 rounded-2xl px-10 font-semibold transition-all",
                  )}>
                  <Rocket className="mr-2 w-5 h-5" />
                  Start Tracking Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xl" }),
                    "bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 rounded-2xl px-10 font-semibold transition-all",
                  )}>
                  Sign In
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-50 font-medium">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-200" />
                  Free forever
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-200" />
                  No credit card needed
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-200" />
                  Setup in 2 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============================================
          FOOTER - KENYA BRANDING
          ============================================ */}
      <footer className="relative py-16 border-t border-border/50 bg-gradient-to-b from-background to-green-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-foreground text-lg block">
                    JobTracker
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Your career companion
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Built for Kenya's job market. Forever free.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} JobTracker Kenya. Made with{" "}
                <span className="text-red-500">❤️</span> for your career
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="https://twitter.com"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  Twitter
                </Link>
                <Link
                  href="https://linkedin.com"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  LinkedIn
                </Link>
                <Link
                  href="https://github.com"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
