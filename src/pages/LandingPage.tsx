import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Calendar,
  Target,
  DollarSign,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "@/components/theme/mode-toggle";

const Landing = () => {
  const features = [
    {
      icon: Calendar,
      title: "Session Scheduling",
      description:
        "Schedule and manage coaching sessions with integrated calendar",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set, monitor, and achieve goals collaboratively",
    },
    {
      icon: DollarSign,
      title: "Payment Management",
      description: "Automated invoicing and payment processing",
    },
    {
      icon: Users,
      title: "Multi-Organization",
      description: "Support for multiple incubators and organizations",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Track coaching effectiveness and entrepreneur growth",
    },
  ];

  const goals = [
    "User authentication and role-based access (Manager, Coach, Entrepreneur)",
    "Session scheduling interface with calendar integration",
    "Real-time collaborative goal tracking between coaches and entrepreneurs",
    "Automated payment flow for coaching sessions",
    "Multi-organization architecture with customizable settings",
    "Admin dashboard for managing users, sessions, and organization configs",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-2xl">CM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Startup Square
              </h1>
              <p className="text-xs text-muted-foreground">
                Coaching Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link to="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold text-foreground">
            Streamline Your Coaching Operations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive coaching management system built for Startup Square,
            enabling seamless collaboration between coaches and entrepreneurs
            with powerful tracking and automation.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/auth/login">
              <Button size="lg" className="bg-primary shadow-elegant">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Core Features
            </h3>
            <p className="text-muted-foreground">
              Everything you need to manage coaching sessions effectively
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 shadow-card hover:shadow-elegant transition-all duration-300"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Project Goals
            </h3>
            <p className="text-muted-foreground">
              Building a complete ecosystem for coaching management
            </p>
          </div>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-card shadow-card"
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground">{goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-primary">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-4xl font-bold text-foreground">
            Ready to Transform Your Coaching Program?
          </h3>
          <p className="text-xl text-foreground/90">
            Join incubators like LaStartupStation in streamlining their coaching
            operations
          </p>
          <Link to="/auth/login">
            <Button size="lg" variant="secondary" className="shadow-elegant">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            © 2025 Startup Square. Built with React, TypeScript, and Tailwind
            CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
