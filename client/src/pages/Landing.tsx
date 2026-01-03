import { Button } from "@/components/ui/button";
import { Hexagon, CheckCircle2, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Hexagon className="w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-display font-bold">PayGate</span>
          </div>
          <div className="flex items-center gap-4">
             <a href="/api/login">
               <Button variant="ghost">Sign In</Button>
             </a>
             <a href="/api/login">
               <Button className="shadow-lg shadow-primary/25">Get Started</Button>
             </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
         {/* Background gradients */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-primary bg-primary/10 mb-8 border border-primary/20">
              <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The new standard in payments
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
              Payments infrastructure <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                for the internet
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
              Millions of companies of all sizes—from startups to Fortune 500s—use PayGate's software and APIs to accept payments, send payouts, and manage their businesses online.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <a href="/api/login">
                 <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                   Start now <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
               </a>
               <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                 Contact Sales
               </Button>
            </div>
         </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold">Everything you need</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We've baked in all the features you need to accept payments and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Global Payments", desc: "Accept payments from anywhere in the world in 135+ currencies." },
              { title: "Developer First", desc: "Powerful APIs and easy-to-use SDKs for any stack." },
              { title: "Fraud Protection", desc: "Machine learning models trained on billions of data points." }
            ].map((f, i) => (
               <div key={i} className="p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
               </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
         <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2024 PayGate Inc. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
