'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  ThumbsUp, 
  User,
  Clock,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  { id: 'all', name: 'All Topics' },
  { id: 'first', name: 'First Trimester' },
  { id: 'second', name: 'Second Trimester' },
  { id: 'third', name: 'Third Trimester' },
  { id: 'postpartum', name: 'Postpartum' },
  { id: 'financial', name: 'Financial Planning' },
  { id: 'insurance', name: 'Insurance' },
];

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  trimester?: string;
  upvotes: number;
  answerCount: number;
  createdAt: string;
  isAnonymous: boolean;
  answers: Answer[];
}

interface Answer {
  id: string;
  content: string;
  author: string;
  isExpert: boolean;
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    title: 'When should I add baby to insurance?',
    content: 'I\'m due in 6 weeks. When exactly do I need to contact my insurance to add the baby? I\'ve heard there\'s a deadline.',
    author: 'ExpectingMom2026',
    category: 'insurance',
    upvotes: 45,
    answerCount: 8,
    createdAt: '2026-05-08T10:00:00',
    isAnonymous: false,
    answers: [
      {
        id: 'a1',
        content: 'You have 60 days from birth to add baby. I recommend doing it within the first week. You\'ll need the birth certificate and SSN.',
        author: 'InsurancePro',
        isExpert: true,
        upvotes: 32,
        isAccepted: true,
        createdAt: '2026-05-08T11:30:00',
      },
    ],
  },
  {
    id: '2',
    title: 'Best 529 plan if my state has no tax benefit?',
    content: 'I live in Texas (no state income tax). Should I use Texas\'s plan or go with a national option like Utah or Nevada?',
    author: 'PlannerDad',
    category: 'financial',
    upvotes: 28,
    answerCount: 5,
    createdAt: '2026-05-09T14:20:00',
    isAnonymous: false,
    answers: [],
  },
  {
    id: '3',
    title: 'How much did you spend on nursery furniture?',
    content: 'Trying to budget for the nursery. Curious what others spent on crib, changing table, dresser, etc. Looking for mid-range quality.',
    author: 'BudgetConscious',
    category: 'financial',
    trimester: 'second',
    upvotes: 67,
    answerCount: 23,
    createdAt: '2026-05-07T09:15:00',
    isAnonymous: true,
    answers: [],
  },
  {
    id: '4',
    title: 'FMLA vs paid leave in California',
    content: 'I\'m confused about how FMLA works with California\'s PFL. Can I take both? How does the timing work?',
    author: 'CA_Mom_To_Be',
    category: 'financial',
    upvotes: 34,
    answerCount: 4,
    createdAt: '2026-05-10T16:45:00',
    isAnonymous: false,
    answers: [],
  },
];

export function CommunityQandA() {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');

  const filteredQuestions = questions.filter(q => {
    const matchesCategory = activeCategory === 'all' || q.category === activeCategory;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const upvoteQuestion = (id: string) => {
    setQuestions(qs => qs.map(q => 
      q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q
    ));
  };

  const submitAnswer = (questionId: string) => {
    if (!newAnswer.trim()) return;
    
    setQuestions(qs => qs.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        answers: [...q.answers, {
          id: Date.now().toString(),
          content: newAnswer,
          author: 'You',
          isExpert: false,
          upvotes: 0,
          isAccepted: false,
          createdAt: new Date().toISOString(),
        }],
        answerCount: q.answerCount + 1,
      };
    }));
    setNewAnswer('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Community Q&A</h2>
          <p className="text-warm-600">Ask questions, share experiences, get advice from other parents.</p>
        </div>
        
        <Button>
          <MessageCircle className="w-4 h-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {filteredQuestions.map(question => (
          <Card key={question.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex gap-4">
                {/* Voting */}
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={() => upvoteQuestion(question.id)}
                    className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5 text-warm-400" />
                  </button>
                  <span className="font-semibold text-warm-900">{question.upvotes}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-warm-900 text-lg hover:text-primary-600 cursor-pointer">
                      {question.title}
                    </h3>
                    
                    {question.isAnonymous && (
                      <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                    )}
                  </div>
                  
                  <p className="text-warm-600 mb-3">{question.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-warm-500 mb-4">
                    <Badge variant="outline">{categories.find(c => c.id === question.category)?.name || question.category}</Badge>
                    <span>{formatDistanceToNow(new Date(question.createdAt))} ago</span>
                    <span>{question.answerCount} answers</span>
                  </div>
                  
                  {/* Answers preview */}
                  {question.answers.length > 0 && (
                    <div className="bg-warm-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {question.answers[0].author.charAt(0)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-warm-900">{question.answers[0].author}</span>
                            {question.answers[0].isExpert && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Expert</Badge>
                            )}
                            {question.answers[0].isAccepted && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          
                          <p className="text-sm text-warm-600">{question.answers[0].content}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-warm-300 mx-auto mb-4" />
          <p className="text-warm-500">No questions found. Be the first to ask!</p>
        </div>
      )}
    </div>
  );
}
