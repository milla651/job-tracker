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
  Clock,
  Star,
  ChevronRight,
  Play,
  HelpCircle,
  ChevronDown
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
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is JobTracker free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, JobTracker is completely free for individual job seekers. You can track unlimited applications, manage interviews, and use our AI features without any cost."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI job tracking work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI helps you organize your search by automatically categorizing applications, suggesting follow-up times, and providing intelligent nudges based on your pipeline status."
        }
      },
      {
        "@type": "Question",
        "name": "Can I import jobs from LinkedIn or Indeed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can easily log jobs from any platform using our Quick Add feature. We are also working on a browser extension to one-click save jobs from major boards."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Your data is encrypted and stored securely. We do not sell your personal information to recruiters or third parties."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <JsonLd data={faqData} />
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-28">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
        <div className="absolute inset-0 bg-aurora" />

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-foreground/80">
                Trusted by <span className="text-primary font-bold">5,000+</span> job seekers worldwide
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 fade-in-up fade-in-up-delay-1">
              <span className="block text-foreground">Land Your</span>
              <span className="text-gradient">Dream Job</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed fade-in-up fade-in-up-delay-2">
              The modern way to track applications, ace interviews, and get hired faster.
              <span className="block text-foreground/70 mt-2">No spreadsheets. No chaos. Just results.</span>
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in-up fade-in-up-delay-3">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "xl" }),
                  "group bg-gradient-brand-animated text-white shadow-xl hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 rounded-2xl px-8"
                )}
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start Free — No Credit Card
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xl" }),
                  "group glass-card border-2 border-border/50 text-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary rounded-2xl px-8 transition-colors"
                )}
              >
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto fade-in-up fade-in-up-delay-4">
              {[
                { value: "10K+", label: "Jobs Tracked", icon: Briefcase },
                { value: "89%", label: "Success Rate", icon: TrendingUp },
                { value: "2.5x", label: "Faster Hiring", icon: Zap },
                { value: "4.9★", label: "User Rating", icon: Star },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group glass-card-hover p-5 rounded-2xl text-center cursor-default"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <div className="text-2xl sm:text-3xl font-bold text-gradient-static">{stat.value}</div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES BENTO GRID
          ============================================ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
              Everything you need,
              <span className="block text-gradient">nothing you don't</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by job seekers who got tired of messy spreadsheets and missed opportunities.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Large Feature Card */}
            <div className="md:col-span-2 group glass-card-hover p-8 md:p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
                  <LineChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Visual Progress Dashboard
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg">
                  See your entire job search at a glance. Track applications,
                  interviews, and offers with beautiful visualizations that actually make sense.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Analytics", "Pipeline View", "Statistics"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tall Feature Card */}
            <div className="md:row-span-2 group glass-card-hover p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-500" />
              <div className="relative h-full flex flex-col">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-accent to-primary mb-6 w-fit">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Smart Scheduling
                </h3>
                <p className="text-muted-foreground mb-6">
                  Never miss an interview again. Sync with your calendar and get intelligent reminders.
                </p>
                <div className="mt-auto pt-8">
                  <div className="space-y-3">
                    {["Calendar sync", "Smart reminders", "Time zone support"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Small Feature Cards */}
            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Quick Logging</h3>
                <p className="text-muted-foreground text-sm">
                  Add new applications in seconds with smart auto-complete and templates.
                </p>
              </div>
            </div>

            <div className="group glass-card-hover p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Auto Reminders</h3>
                <p className="text-muted-foreground text-sm">
                  Get notified when it's time to follow up. Never let an opportunity slip away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section id="how-it-works" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">How It Works</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
              Three simple steps to
              <span className="block text-gradient">career success</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                emoji: "📝",
                title: "Track Everything",
                description: "Add your job applications with company details, deadlines, and notes. We keep it all organized.",
                gradient: "from-primary to-primary/50"
              },
              {
                step: "02",
                emoji: "📊",
                title: "Stay Updated",
                description: "Update application statuses as you progress. Visual pipeline shows where each opportunity stands.",
                gradient: "from-accent to-accent/50"
              },
              {
                step: "03",
                emoji: "🎯",
                title: "Land the Job",
                description: "Focus on interviews, not organization. Get reminders and insights to close the deal.",
                gradient: "from-emerald-500 to-emerald-500/50"
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[calc(100%+12px)] w-[calc(100%-24px)] h-0.5">
                    <div className="h-full bg-gradient-to-r from-border via-primary/30 to-border" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/50" />
                  </div>
                )}

                <div className="glass-card-hover p-8 rounded-3xl h-full">
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} mb-6`}>
                    <span className="text-4xl">{item.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="text-sm font-mono text-primary font-bold mb-2">{item.step}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section id="testimonials" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background" />

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Success Stories</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Loved by job seekers
              <span className="block text-gradient">around the world</span>
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                quote: "Finally, a job tracker that doesn't feel like doing extra homework. I landed my dream role at a FAANG company in 3 months!",
                author: "Sarah Chen",
                role: "Software Engineer",
                company: "Meta",
                avatar: "SC",
                stars: 5
              },
              {
                quote: "The visual pipeline is a game-changer. I could see exactly where I stood with 50+ applications. Highly recommend!",
                author: "Marcus Johnson",
                role: "Product Manager",
                company: "Stripe",
                avatar: "MJ",
                stars: 5
              },
              {
                quote: "Smart reminders saved me twice from missing follow-ups. This tool pays for itself... and it's free!",
                author: "Emily Rodriguez",
                role: "UX Designer",
                company: "Airbnb",
                avatar: "ER",
                stars: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group glass-card-hover p-8 rounded-3xl"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/90 text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} @ {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION (PAA OPTIMIZED)
          ============================================ */}
      <section className="relative py-24 md:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Common Questions</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about tracking your career progress.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="glass-card px-6 rounded-2xl border-none">
              <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors py-6">
                Is JobTracker free to use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Yes, JobTracker is completely free for individual job seekers. You can track unlimited applications, manage interviews, and use our AI features without any cost.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="glass-card px-6 rounded-2xl border-none">
              <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors py-6">
                How does the AI job tracking work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Our AI helps you organize your search by automatically categorizing applications, suggesting follow-up times, and providing intelligent nudges based on your pipeline status.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="glass-card px-6 rounded-2xl border-none">
              <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors py-6">
                Can I import jobs from LinkedIn or Indeed?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Yes! You can easily log jobs from any platform using our Quick Add feature. We are also working on a browser extension to one-click save jobs from major boards.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="glass-card px-6 rounded-2xl border-none">
              <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors py-6">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Absolutely. Your data is encrypted and stored securely. We do not sell your personal information to recruiters or third parties.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#020617] p-10 md:p-16">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-30" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(white 1px, transparent 1px),
                                  linear-gradient(90deg, white 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            <div className="relative text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur mb-8">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white">
                  Ready to accelerate your career?
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Your dream job is
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200 mt-2">waiting for you</span>
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium">
                Join thousands of successful job seekers who transformed their search
                from chaotic to confident.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "xl" }),
                    "group bg-white text-gray-900 hover:bg-gray-100 shadow-2xl rounded-2xl px-10"
                  )}
                >
                  <Sparkles className="mr-2 w-5 h-5 text-primary" />
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xl" }),
                    "bg-transparent border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-2xl px-10"
                  )}
                >
                  Sign In
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300 font-medium">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Free forever
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Setup in 2 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="relative py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg">JobTracker</span>
                <p className="text-xs text-muted-foreground">Your career companion</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} JobTracker. Made with ❤️
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}