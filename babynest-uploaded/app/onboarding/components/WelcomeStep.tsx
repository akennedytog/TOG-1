'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Baby, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center text-center max-w-2xl mx-auto"
    >
      {/* Hero Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full blur-3xl opacity-50" />
        <motion.div 
          className="relative w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-glow"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Baby className="w-14 h-14 text-white" />
        </motion.div>
        <motion.div 
          className="absolute -top-2 -right-2 w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="w-5 h-5 text-white" fill="currentColor" />
        </motion.div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-4xl md:text-5xl font-bold text-warm-900 mb-4 leading-tight">
        Welcome to BabyNest{' '}
        <span className="inline-block animate-bounce-soft">💚</span>
      </h1>
      
      <p className="text-lg text-warm-600 mb-6 leading-relaxed">
        Your AI-powered financial companion for parenthood. We&apos;ll help you navigate 
        insurance, 529 plans, tax benefits, and all the important tasks that come 
        with welcoming a new baby.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
        {[
          { 
            icon: Sparkles, 
            title: 'AI Guidance', 
            desc: 'Personalized recommendations',
            color: 'from-amber-100 to-amber-50',
            iconColor: 'text-amber-600'
          },
          { 
            icon: Heart, 
            title: 'State-Specific', 
            desc: 'Tailored to your state',
            color: 'from-rose-100 to-rose-50',
            iconColor: 'text-rose-600'
          },
          { 
            icon: Baby, 
            title: 'Timeline-Based', 
            desc: 'Tasks based on due date',
            color: 'from-primary-100 to-primary-50',
            iconColor: 'text-primary-600'
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`p-5 rounded-2xl bg-gradient-to-br ${feature.color} border border-white/50`}
          >
            <feature.icon className={`w-6 h-6 ${feature.iconColor} mb-3`} />
            <h3 className="font-semibold text-warm-900 mb-1">{feature.title}</h3>
            <p className="text-sm text-warm-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={onNext}
          className="btn-primary text-lg px-8 py-4 h-auto group"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      <p className="mt-4 text-sm text-warm-500">
        Takes just 2 minutes to personalize your experience
      </p>
    </motion.div>
  );
}
