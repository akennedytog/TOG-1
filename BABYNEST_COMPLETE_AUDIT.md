# BabyNest Audit Plan

**Date:** 2026-05-19  
**Project:** BabyNest - AI-powered pregnancy/financial planning app  
**Framework:** Next.js 14 + React + Supabase + TypeScript

---

## Executive Summary

BabyNest is a Next.js 14 application with **~317 TypeScript/React files** (~4,185 lines in top 4 files alone). It's a feature-rich pregnancy companion with dashboard widgets, task management, budget tracking, and AI integrations. Several structural issues and code quality concerns have been identified during this planning phase.

---

## File Inventory

### 1. Pages (Next.js App Router)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page with marketing sections |
| `/dashboard` | `app/dashboard/page.tsx` | **1,154 lines** - Main user dashboard |
| `/onboarding` | `app/onboarding/page.tsx` | **600+ lines** - Multi-step onboarding flow |
| `/auth/*` | `app/auth/signin/signup/reset-password/callback/page.tsx` | Authentication flows |
| `/baby-name` | `app/baby-name/page.tsx` | Baby name suggestions |
| `/baby-names` | `app/baby-names/page.tsx` | Name list management |
| `/blog/*` | `app/blog/page.tsx`, `[slug]/page.tsx` | Blog content |
| `/community` | `app/community/page.tsx` | Community Q&A |
| `/due-date-calculator` | `app/due-date-calculator/page.tsx` | Due date tool |
| `/family/join` | `app/family/join/page.tsx` | Family sharing |
| `/financial-timeline` | `app/financial-timeline/page.tsx` | Financial planning |
| `/hospital-costs` | `app/hospital-costs/page.tsx` | Cost estimator |
| `/is-it-safe` | `app/is-it-safe/page.tsx` | Pregnancy safety DB |
| `/leave-calculator` | `app/leave-calculator/page.tsx` | Maternity leave calc |
| `/milestones` | `app/milestones/page.tsx` | Development tracking |
| `/pricing` | `app/pricing/page.tsx` | Stripe pricing page |
| `/providers` | `app/providers/page.tsx` | Healthcare provider directory |
| `/readiness` | `app/readiness/page.tsx` | Birth readiness check |
| `/registry` | `app/registry/page.tsx` | Baby registry |
| `/settings/*` | `app/settings/page.tsx`, `family/page.tsx` | User settings |
| `/week-by-week/*` | `app/week-by-week/page.tsx`, `[week]/page.tsx` | Pregnancy guide |

### 2. API Routes

| Route | File | Purpose |
|-------|------|---------|
| `/api/analyze-insurance-doc` | `route.ts` | AI insurance doc analysis |
| `/api/analyze-insurance-text` | `route.ts` | Text analysis |
| `/api/chat` | `route.ts` | AI chat endpoint |
| `/api/generate-tasks` | `route.ts` | Task generation |
| `/api/newsletter` | `route.ts` | Email subscriptions |
| `/api/ocr` | `route.ts` | Document OCR |
| `/api/push/subscribe/unsubscribe` | `route.ts` | Push notifications |
| `/api/registry/import/scrape` | `route.ts` | Registry integration |
| `/api/stripe/create-checkout` | `route.ts` | Payment processing |
| `/api/tasks` | `route.ts` | Task CRUD |

### 3. Major Components (>500 lines)

| Component | Lines | Purpose | Concern |
|-----------|-------|---------|---------|
| `SmartTaskManager.tsx` | 1,497 | Task management | **Massive component** |
| `BudgetTracker.tsx` | 965 | Budget/expense tracking | Too large |
| `TaskManager.tsx` | ~600 | Legacy task manager | **Duplicated logic** |
| `SavingsGoals.tsx` | 569 | Savings goal tracking | Large |
| `InsuranceDocumentAnalyzer.tsx` | ~600 | Doc analysis | Complex |
| `VaccinationTracker.tsx` | ~500 | Vaccination schedule | Complex |
| `RegistryTracker.tsx` | ~500 | Registry management | Large |
| `HospitalBagPlanner.tsx` | ~450 | Hospital checklist | Medium |
| `PregnancyTracker.tsx` | ~400 | Pregnancy tracking | Medium |
| `BirthPlanBuilder.tsx` | ~400 | Birth plan creator | Medium |
| `DocumentVault.tsx` | ~400 | Document storage | Medium |
| `SharedHeader.tsx` | ~400 | Navigation header | Large |

### 4. UI Components (`components/ui/`)

Standard shadcn/ui components:
- GlassCard, alert, avatar, badge, button, card, checkbox, collapsible, dialog, dropdown-menu, input, label, progress, radio-group, scroll-area, select, separator, skeleton, switch, tabs, textarea

### 5. Library Files (`lib/`)

| File | Lines | Purpose |
|------|-------|---------|
| `supabase.ts` | ~400 | Supabase client & helpers |
| `taskDetails.ts` | ~700 | Task content/guidance |
| `pregnancy-weeks.ts` | ~800 | Week-by-week content |
| `safety-data.ts` | ~400 | Safety database |
| `community-data.ts` | ~300 | Q&A content |
| `baby-names-data.ts` | ~800 | Name database |
| `ai-task-categorizer.ts` | ~200 | AI task logic |
| `openai.ts` | ~400 | OpenAI integration |
| `onboarding.ts` | ~300 | Onboarding logic |
| `ai-analysis.ts` | ~200 | Document analysis |

### 6. Database Schema (`types/database.ts`)

Tables: profiles, tasks, newsletter_subscribers, waitlist, hospital_bag_items, birth_plans, benefit_documents, action_items, registry_items, savings_goals, budget_settings, expenses, notification_preferences, push_subscriptions

---

## Critical User Flows to Audit

### Priority 1: Core User Journey
1. **Landing → Signup → Onboarding → Dashboard**
   - Entry points: Landing page CTAs
   - Auth flow validation
   - Onboarding completion tracking
   - Dashboard redirect logic

2. **Task Management Flow**
   - Task generation (AI API)
   - Task display/filtering
   - Task completion/status updates
   - Priority calculation

3. **Dashboard Tab Navigation**
   - 11+ tabs with heavy components
   - Dynamic imports (not consistently applied)
   - Tab state persistence

### Priority 2: Financial Features
4. **Budget Tracker**
   - Expense CRUD operations
   - Budget calculations
   - Category management

5. **Savings Goals**
   - Goal creation
   - Progress tracking
   - Amount calculations

6. **Insurance Document Analysis**
   - File upload → OCR → AI analysis
   - Multi-step async flow

### Priority 3: Pregnancy Features
7. **Pregnancy Tracker**
   - Week calculation from due date
   - Milestone tracking
   - Vaccination scheduling

8. **Hospital Bag Planner**
   - Checklist persistence
   - Category filtering

9. **Birth Plan Builder**
   - Form state management
   - Preference storage

### Priority 4: Secondary Features
10. **Baby Names/Registry/Community**
11. **Settings & Family Sharing**
12. **Push Notifications**

---

## Structural Issues Identified

### 1. Component Size Violations

| Component | Lines | Severity | Issue |
|-----------|-------|----------|-------|
| `app/dashboard/page.tsx` | 1,154 | 🔴 Critical | Should be split into sub-components |
| `SmartTaskManager.tsx` | 1,497 | 🔴 Critical | Contains UI + logic + data + animations |
| `BudgetTracker.tsx` | 965 | 🟡 High | Multiple concerns mixed |
| `app/onboarding/page.tsx` | ~600 | 🟡 High | 6-step wizard in one file |

**Impact:** Poor testability, difficult maintenance, slow HMR

### 2. Duplicated Components

- **`SmartTaskManager.tsx` vs `TaskManager.tsx`** - Both exist, different implementations
  - SmartTaskManager: AI-powered, 1,497 lines
  - TaskManager: Legacy, ~600 lines, simpler
  - **Risk:** Inconsistent UI, maintenance burden

### 3. Inconsistent Dynamic Imports

```typescript
// Dashboard uses dynamic imports for some heavy components:
const InsuranceDocumentAnalyzer = dynamic(...)
const DocumentVault = dynamic(...)

// But NOT for other large components:
import { SmartTaskManager } from '@/components/SmartTaskManager' // 1,497 lines, loaded immediately
import { BudgetTracker } from '@/components/BudgetTracker' // 965 lines, loaded immediately
```

**Impact:** Initial bundle size unnecessarily large

### 4. Type Safety Issues

- `types/database.ts` uses `Record<string, any>` for flexibility
- Several components use `any` types
- Mixed type definitions between interface and type

### 5. State Management Concerns

- Heavy reliance on Supabase real-time queries
- Multiple `useEffect` chains in dashboard
- LocalStorage used for vaccine tracking (not synced)
- No global state manager (Zustand/Redux)

### 6. API Route Organization

- Some API routes handle multiple concerns
- Inconsistent error handling patterns
- Missing input validation (Zod schemas partially used)

---

## Recommended Audit Order

### Phase 1: Foundation (Days 1-2)
1. ✅ **Build & Type Check** - `npm run build`, check TypeScript errors
2. ✅ **Dependency Audit** - Check outdated packages, security vulnerabilities
3. ✅ **Environment Variables** - Verify all required env vars documented
4. ✅ **Database Schema** - Validate migrations, RLS policies

### Phase 2: Core Flows (Days 3-4)
5. **Auth Flow** - Signup, signin, password reset, session handling
6. **Onboarding Flow** - Step navigation, form validation, completion tracking
7. **Dashboard Performance** - Initial load, tab switching, re-renders

### Phase 3: Feature Deep Dives (Days 5-7)
8. **Task Management** - CRUD operations, AI generation, priority logic
9. **Financial Features** - Budget, savings, calculations
10. **Insurance Document Flow** - Upload, OCR, AI analysis pipeline
11. **Pregnancy Tracking** - Week calculations, milestone logic

### Phase 4: Polish (Days 8-9)
12. **Mobile Responsiveness** - All breakpoints
13. **Accessibility Audit** - ARIA labels, keyboard navigation, contrast
14. **Error Handling** - 404s, 500s, offline states
15. **Security Review** - API routes, auth checks, data validation

### Phase 5: Performance (Day 10)
16. **Bundle Analysis** - `next-bundle-analyzer`
17. **Image Optimization** - Next/Image usage
18. **API Response Times** - Slow queries
19. **Memory Leaks** - Component unmounting

---

## Quick Wins Identified

### Immediate Fixes (No Risk)
1. **Remove duplicate `TaskManager.tsx`** - Use only `SmartTaskManager`
2. **Add dynamic imports** for all heavy dashboard components
3. **Split dashboard page** into smaller components
4. **Add loading boundaries** with React Suspense

### Short-term Improvements
5. **Consolidate type definitions** - Move to shared types
6. **Add Zod validation** to all API routes
7. **Implement error boundaries** around heavy components
8. **Optimize images** - Check for unoptimized uploads

### Architectural Improvements
9. **Extract custom hooks** from large components
10. **Implement feature-based folder structure**
11. **Add proper logging** for debugging
12. **Consider state management** (Zustand/Jotai)

---

## Risk Areas

| Area | Risk Level | Mitigation |
|------|------------|------------|
| Dashboard bundle size | 🔴 High | Dynamic imports, code splitting |
| Task AI generation | 🟡 Medium | Rate limiting, error handling |
| Document analysis | 🟡 Medium | File size limits, virus scanning |
| Supabase RLS | 🟡 Medium | Verify all tables protected |
| Payment flow (Stripe) | 🟢 Low | Well-tested, webhook validation |

---

## Audit Checklist Template

```markdown
## Component: [Name]
- [ ] Renders without errors
- [ ] No console warnings
- [ ] Mobile responsive
- [ ] Loading states present
- [ ] Error handling
- [ ] Accessibility (axe check)
- [ ] TypeScript strict mode passes
- [ ] Unit tests (if applicable)
- [ ] No memory leaks
- [ ] Performance acceptable
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total TS/TSX files | ~317 |
| App routes | 26 pages |
| API routes | 13 endpoints |
| Major components (>400 lines) | 12 |
| UI components | 23 |
| Database tables | 16 |
| Lines in top 4 files | 4,185 |

**Recommendation:** Focus on the **dashboard page** and **SmartTaskManager** first - these are the highest-impact files for user experience and maintainability.
# BabyNest Code Review Report

**Date:** 2026-05-19  
**Components Reviewed:**
- SmartTaskManager.tsx (1,497 lines)
- BudgetTracker.tsx (965 lines)
- Dashboard page.tsx (1,154 lines)
- API Routes (tasks, chat, generate-tasks, analyze-insurance-doc, stripe/create-checkout)
- Supporting libraries (supabase.ts, ai-task-categorizer.ts, supabase-server.ts)

---

## 1. SmartTaskManager.tsx

### Overview
A 1,497-line component handling task management with AI categorization, Supabase integration, modals, and complex UI. **Significantly violates single responsibility principle.**

### Critical Issues Found

#### 1.1 Code Duplication (Lines 400-700+)
**Issue:** `getTaskGuidance()` function contains massive switch/case with duplicated structure for each task category.

```typescript
// Lines ~400-700: Each category has identical boilerplate:
if (category === 'insurance' || title.includes('insurance')) {
  if (title.includes('health') || title.includes('baby')) {
    return { title: '...', steps: [...], resources: [...] };
  }
  if (title.includes('life')) {
    return { title: '...', steps: [...], resources: [...] };
  }
  // ... 300+ more lines of nearly identical structures
}
```

**Recommendation:** Extract guidance data to a configuration object:
```typescript
// lib/task-guidance.ts
export const TASK_GUIDANCE: Record<string, TaskGuidance> = {
  'health-insurance': {
    keywords: ['health', 'insurance', 'baby'],
    title: 'Add Baby to Health Insurance',
    steps: [...],
    resources: [...]
  },
  // ...
};
```

**Risk:** Low - Pure refactoring, no logic changes

#### 1.2 Missing Custom Hooks (Lines 50-150)
**Issue:** Data fetching, state management, and Supabase operations are all inline.

**Specific Lines:**
- Lines 86-150: Task fetching with default task bootstrapping
- Lines 152-180: Sorting logic that should be memoized
- Lines 220-260: Toggle task handler with optimistic updates

**Recommendation:** Extract to custom hooks:
```typescript
// hooks/useTasks.ts
export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // ... all fetching logic
}

// hooks/useTaskActions.ts
export function useTaskActions(userId: string | null) {
  const toggleTask = useCallback(async (taskId: string) => { ... }, []);
  const addTask = useCallback(async (task: NewTask) => { ... }, []);
  const deleteTask = useCallback(async (taskId: string) => { ... }, []);
  return { toggleTask, addTask, deleteTask };
}
```

**Risk:** Low-Medium - Requires testing optimistic update behavior

#### 1.3 Performance Issues

**Issue A: Re-render on every keystroke in Add Task modal (Lines 312-370)**
```typescript
// Lines 312-370: newTask state updates cause full re-render
setNewTask({ ...newTask, title: e.target.value }); // Triggers re-render of entire 1,497-line component
```

**Fix:** Memoize form component or use `useForm` hook with controlled inputs that don't bubble up.

**Issue B: `groupedTasks` recalculation (Lines 184-186)**
```typescript
const groupedTasks = useMemo(() => {
  return groupTasksByCategory(tasks); // Called on every render when tasks change
}, [tasks]);
```

This is fine but `groupTasksByCategory` is O(n*m) where m = keyword checks. With many tasks, this is expensive.

**Issue C: Inline function definitions in render (Lines 550-600)**
```typescript
// Lines 550-600: New function created on every render
const renderTask = (task: Task) => { ... };
const renderCategory = (categoryKey: string) => { ... };
```

These should be extracted as standalone components.

**Risk:** Medium - Performance impact on low-end devices

#### 1.4 API Integration Patterns

**Issue:** No request deduplication or caching (Lines 86-150)
```typescript
// Every mount = new fetch, even if data exists
const { data, error } = await supabase
  .from('tasks')
  .select('*, completion_date')
  .eq('user_id', userId);
```

**Recommendation:** Consider React Query/SWR for:
- Stale-while-revalidate caching
- Automatic retries
- Request deduplication

**Risk:** Low - Addition, not modification

#### 1.5 Props Drilling for Scroll/Highlight (Lines 30-35, 290-330)
```typescript
interface SmartTaskManagerProps {
  selectedTaskId?: string | null;
  onTaskSelected?: () => void;
}
```

**Issue:** Complex scroll-to-task logic (Lines 290-330) manipulates refs and manages highlight state that could be handled by the parent or a dedicated hook.

**Recommendation:** Extract to `useTaskHighlighter(selectedTaskId, tasks)` hook.

**Risk:** Low

---

## 2. BudgetTracker.tsx

### Overview
965-line component for budget tracking with expense management, projections, and smart tips.

### Issues Found

#### 2.1 State Management Complexity (Lines 75-120)
**Issue:** Mixed local state and Supabase state with no clear ownership:
```typescript
const [expenses, setExpenses] = useState<Expense[]>([]);
const [hasCustomized, setHasCustomized] = useState(false);
```

Templates are loaded as initial state but user customizations don't sync back properly.

**Lines 82-89:** Templates are set on every incomeBracket/dueDate change, overwriting user data:
```typescript
useEffect(() => {
  const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
  setExpenses(templates); // Overwrites user's custom expenses!
  setLoading(false);
}, [userId, dueDate, incomeBracket]);
```

**Risk:** High - **BUG:** User's custom expenses are overwritten on prop changes

#### 2.2 Calculation Accuracy (Lines 180-210)
**Issue:** Budget calculations assume all expenses are in the same currency without conversion:
```typescript
const totalMonthly = categoryTotals.reduce((sum, cat) => sum + cat.recurring, 0);
const totalOneTime = categoryTotals.reduce((sum, cat) => sum + cat.oneTime, 0);
```

No validation that amounts are positive numbers.

**Lines 192-195:** Division by zero risk (mitigated but fragile):
```typescript
const monthlyToSave = Math.ceil((totalOneTime + (totalMonthly * 3)) / monthsUntilDue);
// If monthsUntilDue is 0, this is Infinity
```

**Risk:** Medium - Financial calculations need stricter validation

#### 2.3 Form Validation Patterns (Lines 280-320)
**Issue:** Minimal validation on addExpense:
```typescript
const addExpense = async () => {
  if (!newExpense.category || !newExpense.amount) return; // Only check existence
  // No validation for negative amounts, extremely large values, etc.
  const expenseData = {
    amount: parseFloat(newExpense.amount), // Could be NaN
    // ...
  };
};
```

**Recommendation:** Add Zod schema validation:
```typescript
const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive().max(1000000),
  description: z.string().max(500).optional(),
  is_recurring: z.boolean()
});
```

**Risk:** Low - Defensive improvement

#### 2.4 Supabase Integration Issues

**Issue:** Error handling only logs to console, no user feedback (Lines 305-340):
```typescript
try {
  const { data, error } = await supabase.from('expenses').insert({...});
  if (error) {
    console.error('Error adding expense:', error);
    // Falls through to fallback, user never sees error
  }
} catch (error) {
  console.error('Error:', error);
  // Silent failure with local fallback
}
```

**Risk:** Medium - Users lose data without knowing why

#### 2.5 Missing useMemo on Expensive Calculations (Lines 160-180)
```typescript
// Lines 160-180: Recalculated on every render
const categoryTotals = SMART_CATEGORIES.map(cat => {
  const catExpenses = expenses.filter(e => e.category === cat.id);
  // ... filtering entire array for each category
  return { ...cat, total, recurring, oneTime, percentOfEstimate, items: catExpenses };
});
```

This is O(categories × expenses) on every render. Should be memoized.

**Risk:** Medium - Performance with many expenses

---

## 3. Dashboard Page (app/dashboard/page.tsx)

### Overview
1,154-line page component acting as the main dashboard with tab navigation, multiple data sources, and many child components.

### Issues Found

#### 3.1 Component Composition Issues

**Issue A: Props Drilling Through Multiple Layers (Lines 700-800)**
```typescript
// SmartTaskManager receives selectedTaskId, user, profile
<SmartTaskManager 
  userId={user?.id} 
  state={profile?.state}
  selectedTaskId={selectedTaskId}
  onTaskSelected={() => setSelectedTaskId(null)}
/>
```

Profile data is passed through multiple levels. Consider React Context for user profile.

**Issue B: No Error Boundaries (Lines 600-750)**
Each TabsContent renders a heavy component without error boundaries. One component crash = entire dashboard crash.

**Recommendation:** Add ErrorBoundary wrapper:
```typescript
<TabsContent value="tasks">
  <ErrorBoundary fallback={<TaskError />}>
    <SmartTaskManager ... />
  </ErrorBoundary>
</TabsContent>
```

**Risk:** Medium - Improves resilience

#### 3.2 Tab Switching Performance (Lines 600-750)
**Issue:** All tab content mounts immediately, not lazily:
```typescript
<TabsContent value="tasks">...
<TabsContent value="savings">...
// All rendered, just hidden via CSS
```

**Recommendation:** Use `React.lazy()` or conditional rendering:
```typescript
const SmartTaskManager = lazy(() => import('@/components/SmartTaskManager'));
// Or
{activeTab === 'tasks' && <SmartTaskManager ... />}
```

**Risk:** Low-Medium - Initial load impact

#### 3.3 Multiple useEffect Data Fetching (Lines 150-300)
**Issue:** Multiple independent useEffect calls for related data:
```typescript
// Lines 150-180: User auth check
useEffect(() => { checkUser() }, []);

// Lines 200-240: Vaccines from localStorage
useEffect(() => { /* hydrate vaccines */ }, []);

// Lines 250-300: Urgent tasks from Supabase
useEffect(() => { /* fetch urgent tasks */ }, [user?.id]);

// Lines 310-370: Stats from Supabase
useEffect(() => { /* fetch savings + budget stats */ }, [user?.id]);
```

**Risk:** Race conditions, multiple re-renders. Should use a data fetching library or combine into single hook.

**Risk:** Medium - Harder to maintain, potential race conditions

#### 3.4 Props Drilling Issues (Lines 30-50, 700-750)

**Issue:** `completedVaccines` state and handler passed through multiple components:
```typescript
// Dashboard
const [completedVaccines, setCompletedVaccines] = useState<string[]>([]);

// Passed to:
<VaccinationTracker completedVaccineIds={...} onCompletedChange={...} />
<BirthPlanBuilder completedVaccineIds={...} onCompletedVaccinesChange={...} />
```

**Recommendation:** Use Context or state management for shared state.

**Risk:** Low - Technical debt

#### 3.5 Dynamic Import Opportunities

**Current State (Lines 20-35):**
```typescript
// Only 2 components dynamically imported
const InsuranceDocumentAnalyzer = dynamic(...);
const DocumentVault = dynamic(...);

// But these heavy components are statically imported:
import { SmartTaskManager } from '@/components/SmartTaskManager'; // 1,497 lines
import { BudgetTracker } from '@/components/BudgetTracker'; // 965 lines
import { SavingsGoals } from '@/components/SavingsGoals'; // 569 lines
```

**Recommendation:** Dynamic import all heavy components:
```typescript
const SmartTaskManager = dynamic(() => import('@/components/SmartTaskManager'));
const BudgetTracker = dynamic(() => import('@/components/BudgetTracker'));
const SavingsGoals = dynamic(() => import('@/components/SavingsGoals'));
```

**Risk:** Low - Improves initial bundle size significantly

---

## 4. API Routes Review

### 4.1 tasks/route.ts

**Status:** ✅ Well-structured

**Strengths:**
- Proper auth validation
- Status enum validation (Lines 7-8)
- Proper error handling

**Minor Issue:** No input validation for GET request query params (if any added later).

### 4.2 chat/route.ts

**Status:** ⚠️ Needs Improvement

**Issues:**

**Line 7:** In-memory rate limiter - **DOES NOT WORK IN SERVERLESS**
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```

**Risk:** HIGH - Rate limiting is per-instance in serverless. A user can bypass by hitting different Lambda instances.

**Fix:** Use Redis or external rate limiting service.

**Lines 45-52:** No content-type validation on request.

**Risk:** Low - Defensive improvement

### 4.3 analyze-insurance-doc/route.ts

**Status:** ⚠️ Needs Improvement

**Issues:**

**Line 27-30:** Dynamic import in try-catch that may not catch all failures:
```typescript
try {
  const { PDFParse } = await import('pdf-parse');
  // If this throws after partial load, memory leak possible
} catch (parseError) {
  console.error('PDF text extraction failed:', parseError);
}
```

**Line 14-26:** FALLBACK_RESPONSE returned with 200 status on error:
```typescript
return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
```

Client can't distinguish between actual analysis and error. Should return 500 with error structure.

**Risk:** Medium - Silent failures

**Line 55:** No file size limit check before processing. Large PDFs could timeout (maxDuration: 120s).

**Risk:** Medium - Denial of service vector

### 4.4 stripe/create-checkout/route.ts

**Status:** ⚠️ Security Concern

**Issue (Lines 13-18):** No validation that userId matches authenticated user:
```typescript
export async function POST(request: NextRequest) {
  const { priceId, userId, email } = await request.json();
  // userId from JSON is trusted - could be any user's ID
  
  const session = await stripe.checkout.sessions.create({
    metadata: { userId }, // Attributed to arbitrary user
  });
}
```

**Risk:** HIGH - User A could create checkout for User B's account

**Fix:** Get user from auth context:
```typescript
const user = await getAuthUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Use user.id from auth, not request body
```

---

## 5. Supporting Libraries

### 5.1 lib/supabase.ts

**Status:** ⚠️ Architectural Concern

**Issue (Lines 10-25):** Singleton pattern with Proxy:
```typescript
let supabaseInstance: SupabaseClient<Database> | null = null;

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    const client = getSupabase();
    return (client as any)[prop];
  },
}) as SupabaseClient<Database>;
```

**Risk:** MEDIUM - Proxy overhead on every Supabase call. Also, in SSR environments, this could leak between requests.

**Issue (Lines 35+):** Type assertion abuse:
```typescript
return { profile, error }; // profile is any due to 'as any' casts
```

**Risk:** Low - Type safety reduced

### 5.2 lib/ai-task-categorizer.ts

**Status:** ✅ Well-structured

**Strengths:**
- Pure functions
- Clear categorization logic
- Good separation of concerns

**Minor Issue:** `KEYWORDS` object at top level mutates on every call if modified (not currently happening, but fragile).

### 5.3 lib/supabase-server.ts

**Status:** ✅ Well-structured

**Strengths:**
- Proper separation of admin vs user clients
- Good documentation comments
- Proper error handling

---

## Summary & Prioritized Action Items

### 🔴 Critical (Fix Immediately)

| Issue | Location | Risk |
|-------|----------|------|
| Stripe userId injection vulnerability | `api/stripe/create-checkout/route.ts:13-18` | **Security** |
| BudgetTracker overwrites user data on prop changes | `BudgetTracker.tsx:82-89` | **Data Loss** |
| Chat rate limiter doesn't work in serverless | `api/chat/route.ts:7` | **DoS Risk** |

### 🟡 High Priority (Fix This Week)

| Issue | Location | Impact |
|-------|----------|--------|
| Add Zod validation to all API routes | All routes | Data Integrity |
| Extract SmartTaskManager into hooks/components | `SmartTaskManager.tsx` | Maintainability |
| Dynamic import heavy dashboard components | `dashboard/page.tsx` | Performance |
| Add error boundaries to tab content | `dashboard/page.tsx` | Reliability |

### 🟢 Medium Priority (Fix When Convenient)

| Issue | Location | Impact |
|-------|----------|--------|
| Memoize expensive calculations | `BudgetTracker.tsx:160-180` | Performance |
| Extract task guidance to config | `SmartTaskManager.tsx:400-700` | Maintainability |
| Add React Query for data fetching | `SmartTaskManager.tsx`, `BudgetTracker.tsx` | Performance |
| Refactor Proxy-based Supabase client | `lib/supabase.ts:10-25` | Performance |

### 📊 Estimated Effort

| Task | Estimated Time |
|------|----------------|
| Critical security fixes | 2-4 hours |
| SmartTaskManager extraction | 6-8 hours |
| Dashboard optimization | 4-6 hours |
| API route validation | 4-6 hours |
| Testing all changes | 4-6 hours |
| **Total** | **20-30 hours** |

### 🎯 Recommended Order

1. **Day 1:** Fix security issues (Stripe, rate limiting)
2. **Day 2:** Fix BudgetTracker data loss bug
3. **Day 3-4:** Extract SmartTaskManager hooks
4. **Day 5:** Add Zod validation to APIs
5. **Day 6:** Dynamic imports + error boundaries
6. **Day 7:** Testing and regression checks

---

## Appendix: Refactoring Examples

### Before: SmartTaskManager Inline Fetch
```typescript
// Lines 86-150
useEffect(() => {
  async function fetchTasks() {
    if (!userId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('tasks')...;
      // ... 60 lines of inline logic
    } catch (err) { ... }
  }
  fetchTasks();
}, [userId]);
```

### After: Custom Hook
```typescript
// hooks/useTasks.ts
export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    fetchTasks(userId).then(({ data, error }) => {
      if (error) setError(error.message);
      else setTasks(data);
      setLoading(false);
    });
  }, [userId]);
  
  return { tasks, loading, error, refetch };
}
```

### Before: BudgetTracker Template Overwrite
```typescript
useEffect(() => {
  const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
  setExpenses(templates); // Always overwrites!
}, [userId, dueDate, incomeBracket]);
```

### After: Conditional Template Loading
```typescript
useEffect(() => {
  if (!userId) {
    // Only set templates for non-logged-in users
    const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
    setExpenses(templates);
    setLoading(false);
    return;
  }
  
  // For logged-in users, fetch from Supabase
  fetchUserExpenses(userId).then(expenses => {
    if (expenses.length > 0) {
      setExpenses(expenses);
      setHasCustomized(true);
    } else {
      // Only fall back to templates if user has no expenses
      const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
      setExpenses(templates);
    }
    setLoading(false);
  });
}, [userId, dueDate, incomeBracket]);
```

---

*End of Code Review Report*
# BabyNest Architecture Analysis

## Executive Summary

BabyNest has strong feature breadth, but the current architecture concentrates too much state, data fetching, persistence, and UI logic inside a few client components—especially `app/dashboard/page.tsx` and `components/SmartTaskManager.tsx`. The result is avoidable re-renders, duplicated fetch paths, weak caching, and uneven security boundaries.

### Priority Ranking

#### P0
1. Move data fetching/mutations to a unified server/client data layer with React Query.
2. Remove service-role usage from user-triggered task generation path or hard-gate it behind authenticated server logic.
3. Split `SmartTaskManager` into feature components/hooks.
4. Replace dashboard `useEffect` fetch waterfall with server-first loading + query hooks.

#### P1
1. Introduce lightweight global UI/app state with Zustand.
2. Replace `localStorage`-only vaccine persistence with Supabase-backed sync.
3. Code-split all heavy dashboard tabs consistently.
4. Add input validation/authz consistency across API routes.

#### P2
1. Tighten TypeScript database types.
2. Add memoization boundaries selectively.
3. Normalize feature folder structure.
4. Add real-time cache invalidation instead of local refetch logic.

---

## 1. State Management Architecture

### Current Findings

#### Dashboard `useEffect` chains
`app/dashboard/page.tsx` currently has multiple independent effects:
- auth + onboarding redirect boot (`line 274`)
- vaccine hydration from `localStorage` (`line 305`)
- vaccine persistence back to `localStorage` (`line 321`)
- urgent task fetch (`line 331`)
- stats fetch (`line 385`)

This creates a client-side waterfall:
1. render loading shell
2. fetch auth
3. fetch profile
4. fetch urgent tasks
5. fetch savings/budget stats
6. separately hydrate local state from browser storage

This is workable but architecturally brittle:
- each effect owns its own lifecycle/cancellation
- no shared cache between dashboard widgets and feature tabs
- auth/profile gating is mixed with presentation
- browser-only persistence diverges from Supabase-backed data

#### `localStorage` vs Supabase sync
Vaccination state is persisted only in `localStorage`:
- `app/dashboard/page.tsx:308`
- `app/dashboard/page.tsx:324`

That means:
- no multi-device sync
- no backup/recovery
- no family sharing consistency
- data can diverge from birth plan / other pregnancy modules

#### Global state situation
There is currently no dedicated global state layer. The app uses:
- local component state for UI state
- direct Supabase access from components
- ad hoc prop drilling (`selectedTaskId`, `completedVaccines`)

This is acceptable for simple screens, but BabyNest has crossed the threshold where “local state everywhere” is now increasing complexity.

### Recommendation: Zustand + React Query

Use:
- **React Query** for server state
- **Zustand** for client/UI state
- avoid Context for frequently changing dashboard state

Why Zustand over Jotai/Context here:
- BabyNest has many independent UI atoms, but they’re feature-oriented rather than graph-like.
- Zustand is simpler for cross-tab UI state, selection state, drawer/modal state, temporary filters.
- Context would cause broader re-renders unless aggressively split.
- Jotai is good, but Zustand is a better fit for app-level feature stores and migration from current object state.

### Recommended store boundaries

#### Zustand: UI/app state only
- active dashboard tab
- selected task id
- chat panel open/closed
- collapsed category state
- transient onboarding wizard UI state

#### React Query: server state
- profile
- tasks
- urgent tasks
- savings goals
- budget settings
- expenses
- vaccination records
- birth plan
- registry data

### Before
```tsx
const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([])
const [tasksLoading, setTasksLoading] = useState(true)

useEffect(() => {
  if (!user?.id) return;
  let cancelled = false;
  (async () => {
    setTasksLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, status')
      .eq('user_id', user.id)
      .in('priority', ['urgent', 'high'])
      .neq('status', 'completed');

    if (!cancelled) setUrgentTasks(mapped);
    if (!cancelled) setTasksLoading(false);
  })();
  return () => { cancelled = true; };
}, [user?.id]);
```

### After
```tsx
const { user } = useAuthSession();
const { data: urgentTasks = [], isLoading: tasksLoading } = useUrgentTasksQuery(user?.id);
```

```ts
export function useUrgentTasksQuery(userId?: string) {
  return useQuery({
    queryKey: ['tasks', 'urgent', userId],
    enabled: !!userId,
    queryFn: () => taskService.getUrgentTasks(userId!),
    staleTime: 60_000,
  });
}
```

### Migration strategy
1. Introduce React Query provider.
2. Migrate dashboard stats + urgent tasks first.
3. Add `useDashboardUIStore` for active tab/chat open/selected task.
4. Replace `localStorage` vaccines with `vaccination_records` table or JSON column on profile/birth plan.
5. Remove fetch effects after hooks are stable.

---

## 2. Component Architecture

### SmartTaskManager analysis
`components/SmartTaskManager.tsx` is ~1,500 lines and currently owns:
- data fetching
- bootstrap task creation
- sorting/grouping logic
- optimistic mutation logic
- category expansion state
- selection/highlight behavior
- add task modal
- task detail modal
- task guidance content generation
- rendering for active/completed groups
- animation configuration

This is too many responsibilities for one component. It is effectively a mini-app.

### Architectural risks
- hard to test in isolation
- business rules mixed with rendering
- duplicated query logic with dashboard/API routes
- expensive rerenders because most handlers and derived values live in one tree
- future changes become regression-prone

### Extraction strategy

#### Proposed feature structure
```text
features/tasks/
  components/
    SmartTaskManager.tsx
    TaskList.tsx
    TaskCategorySection.tsx
    TaskItem.tsx
    CompletedTasksSection.tsx
    AddTaskDialog.tsx
    TaskDetailDialog.tsx
    TaskProgressCard.tsx
    SmartRecommendationCard.tsx
  hooks/
    useTasksQuery.ts
    useTaskMutations.ts
    useTaskSelection.ts
    useTaskGrouping.ts
    useTaskGuidance.ts
  services/
    taskService.ts
  utils/
    taskSorting.ts
    taskStats.ts
    taskDefaults.ts
  types.ts
```

#### Target component responsibilities
- `SmartTaskManager`: orchestration only
- `TaskProgressCard`: completion + savings summary
- `TaskCategorySection`: render one category
- `TaskItem`: single task row, memoized
- `AddTaskDialog`: form only
- `TaskDetailDialog`: detail + actions only
- `CompletedTasksSection`: completed list only

### Recommended custom hooks

#### `useTasksQuery(userId)`
Single source of truth for task loading.

#### `useTaskMutations(userId)`
Encapsulates:
- toggle complete
- add task
- delete task
- bootstrap defaults

#### `useTaskGrouping(tasks)`
Wrap current `groupTasksByCategory` + active/completed split.

#### `useTaskGuidance(task)`
Move the long guidance switch/if tree out of render path.

#### `useTaskSelection(selectedTaskId)`
Own scroll/highlight behavior.

### Before
```tsx
export function SmartTaskManager(...) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  ...
  useEffect(() => { /* fetch + bootstrap */ }, [userId]);
  useEffect(() => { /* selection + scroll */ }, [selectedTaskId, loading, tasks, groupedTasks]);
  ...
  const handleAddTask = async () => { ... }
  const handleDeleteTask = async () => { ... }
  const getTaskGuidance = (task) => { ...huge... }
  const renderTask = (...) => ...
  const renderCategory = (...) => ...
}
```

### After
```tsx
export function SmartTaskManager({ userId, selectedTaskId, onTaskSelected }: Props) {
  const { data: tasks = [], isLoading, error } = useTasksQuery(userId);
  const { addTask, toggleTask, deleteTask } = useTaskMutations(userId);
  const grouped = useTaskGrouping(tasks);
  const selection = useTaskSelection({ selectedTaskId, grouped, onTaskSelected });

  return (
    <>
      <TaskProgressCard tasks={tasks} grouped={grouped} />
      <TaskList grouped={grouped} onToggleTask={toggleTask} onOpenTask={selection.openTask} />
      <AddTaskDialog onSubmit={addTask} />
      <TaskDetailDialog task={selection.task} onToggle={toggleTask} onDelete={deleteTask} />
    </>
  );
}
```

---

## 3. Performance Architecture

### Current findings

#### Unnecessary re-renders
Major triggers:
1. `dashboard/page.tsx` owns many unrelated states in one component.
2. Tab container imports many heavy components at top-level, including large non-dynamic ones:
   - `SmartTaskManager`
   - `BudgetTracker`
   - `SavingsGoals`
   - `RegistryTracker`
3. `SmartTaskManager` rerenders whole lists on:
   - selection change
   - modal state change
   - add task form changes
   - category expansion
   - highlighted task state
4. guidance logic is recreated in render scope.
5. active/completed/category rendering is tightly coupled.

### React.memo / useMemo strategy

#### Use `React.memo` for
- `TaskItem`
- `TaskCategorySection`
- `TaskProgressCard`
- sidebar nav sections
- discover cards / recommendation chips if kept client-side

#### Use `useMemo` for
- grouped tasks
- task stats
- expensive sort/transforms
- recommendation derivation

#### Avoid overusing `useMemo`
Do not memoize trivial JSX or tiny primitives. Use it where there’s real list/transform cost.

### Before
```tsx
{completedTasks.map((task) => (
  <motion.div ...>
    ...
  </motion.div>
))}
```

### After
```tsx
const TaskItem = React.memo(function TaskItem(props: TaskItemProps) {
  ...
});

{completedTasks.map((task) => (
  <TaskItem key={task.id} task={task} onToggle={onToggle} />
))}
```

### Code splitting approach

#### Current problem
Only some heavy dashboard components are dynamically imported. Others are eagerly bundled even though tabs are mutually exclusive.

#### Recommendation
Code-split **all** heavy tab panels.

### Recommended pattern
```tsx
const SmartTaskManager = dynamic(() => import('@/features/tasks/components/SmartTaskManager'));
const BudgetTracker = dynamic(() => import('@/features/budget/components/BudgetTracker'));
const SavingsGoals = dynamic(() => import('@/features/savings/components/SavingsGoals'));
const RegistryTracker = dynamic(() => import('@/features/registry/components/RegistryTracker'));
const PregnancyTracker = dynamic(() => import('@/features/pregnancy/components/PregnancyTracker'));
```

Then render only active tab content, not all `TabsContent` trees simultaneously if the tabs library keeps them mounted. Prefer lazy mounting for hidden panels.

### Additional performance recommendations
- Server-render dashboard shell/profile, then hydrate widgets.
- Virtualization is not yet necessary for current task volumes.
- Move long static guidance maps outside component bodies.
- Consider route-level segmenting if dashboard keeps growing (e.g. `/dashboard/tasks`, `/dashboard/finance`).

---

## 4. Data Flow Architecture

### Current findings

#### Supabase real-time integration
I did not find evidence of active Supabase realtime subscription usage in the inspected files. The app is primarily using direct fetch/update calls from client components.

That means BabyNest is paying the complexity cost of distributed writes without getting the benefit of shared live cache invalidation.

#### Data fetching patterns
Current patterns are mixed:
- direct client Supabase queries in components (`dashboard`, `SmartTaskManager`)
- API route fetches (`/api/tasks`)
- server-side auth helpers in API routes
- some features likely read DB directly while others go through API routes

This is architecturally inconsistent.

#### Problems created
- same domain can have multiple access paths
- no canonical caching policy
- hard to reason about auth boundary
- component code knows too much about database shape

### Recommendation: React Query + service layer

#### Canonical architecture
- **Client components** call typed hooks
- **Hooks** call service methods
- **Service layer** talks to either:
  - server API routes for privileged/auth-sensitive operations
  - Supabase client directly for safe user-scoped reads if desired

Recommendation: standardize on **API routes for mutations and sensitive reads**, and optionally direct Supabase for low-risk user-scoped reads only if consistent.

### Caching strategy
Use React Query with query keys like:
- `['profile', userId]`
- `['tasks', userId]`
- `['tasks', 'urgent', userId]`
- `['savings-goals', userId]`
- `['budget', userId]`
- `['expenses', userId, month]`
- `['vaccinations', userId]`

#### Stale times
- profile: 5 min
- tasks: 1 min
- urgent tasks: 30 sec–1 min
- budget/expenses: 1 min
- static reference data: 1 hour+

#### Mutation flow
```ts
const mutation = useMutation({
  mutationFn: taskService.updateTask,
  onMutate: optimisticUpdate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    queryClient.invalidateQueries({ queryKey: ['tasks', 'urgent', userId] });
  },
});
```

### Real-time design recommendation
If realtime is desired, subscribe once per domain and update query cache rather than local component state.

```ts
supabase
  .channel(`tasks:${userId}`)
  .on('postgres_changes', {...}, payload => {
    queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
  })
  .subscribe();
```

Do **not** wire realtime directly into leaf components.

### Before
```tsx
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId);
setTasks(sortTasksByPriority(data));
```

### After
```ts
export const taskService = {
  async list(userId: string) {
    const res = await fetch(`/api/tasks?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },
};
```

```ts
export function useTasksQuery(userId?: string) {
  return useQuery({
    queryKey: ['tasks', userId],
    enabled: !!userId,
    queryFn: () => taskService.list(userId!),
  });
}
```

---

## 5. Security Architecture

### Current findings

#### API route protection
Good:
- `/api/tasks` uses `getAuthUser()` and scopes updates by `user_id`.

Weak/inconsistent:
- `/api/stripe/create-checkout` accepts `priceId`, `userId`, `email` from request body with no auth check.
- `/api/chat` is rate-limited by IP only, no auth or user-aware abuse control.
- `/api/generate-tasks` uses service role credentials and only checks that `userId` exists in body.
- `/api/analyze-insurance-doc` has no auth check in inspected code.

### P0 security concerns

#### 1. Unauthenticated Stripe checkout session creation
`app/api/stripe/create-checkout/route.ts`

Risk:
- caller can spoof `userId` and `email`
- no price allowlist verification
- server trusts client-submitted purchase metadata

Fix:
- require authenticated user
- derive `userId` and `email` from session, not request body
- validate `priceId` against allowlist

#### 2. Service-role use in `/api/generate-tasks`
`app/api/generate-tasks/route.ts`

Risk:
- service role bypasses RLS
- body-provided `userId` means a malicious caller could target another user if endpoint is exposed

Fix:
- require auth
- derive user from auth session
- use normal server client where possible
- if service role is required, verify user first and never trust body identity

#### 3. Missing auth on sensitive AI/document endpoints
Insurance document analysis likely handles personal/medical data. It should require auth and enforce upload limits.

### RLS policy coverage
I only saw one migration file and not a full policy set, so **RLS coverage is currently unverified**. Given the architecture, this should be treated as a gap until proven otherwise.

Minimum tables that must have RLS with `auth.uid() = user_id` or equivalent:
- profiles
- tasks
- hospital_bag_items
- birth_plans
- benefit_documents
- action_items
- registry_items
- savings_goals
- budget_settings
- expenses
- notification_preferences
- push_subscriptions

Also verify:
- waitlist/newsletter tables use restricted insert-only/public patterns if intended
- service-role operations are isolated to true admin flows

### Exposed secrets in client code
From inspected source:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used client-side, which is expected.
- `STRIPE_SECRET_KEY` is server-only in API route, good.
- `SUPABASE_SERVICE_ROLE_KEY` appears only in server files/routes inspected, good.

I did **not** see raw secrets committed in these source files.

### Security hardening recommendations

#### Before
```ts
const { priceId, userId, email } = await request.json();
```

#### After
```ts
const user = await requireAuth();
const profile = await profileService.get(user.id);
const { priceId } = CheckoutSchema.parse(await request.json());

if (!ALLOWED_PRICE_IDS.includes(priceId)) {
  return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
}
```

#### Add validation everywhere
Use Zod on all API routes:
- request body
- query params
- uploaded file metadata

#### Add per-user rate limiting
For authenticated routes, prefer `user.id` over IP.

#### Add upload constraints
For insurance docs:
- MIME allowlist
- size limit
- scan/validation pipeline
- object storage path scoped by user

---

## Recommended Migration Plan

### Phase 1 — Stabilize data/security (P0)
1. Add auth + Zod validation to all sensitive API routes.
2. Fix `/api/stripe/create-checkout` to derive user from session.
3. Fix `/api/generate-tasks` to require auth and remove body-trusted `userId`.
4. Introduce React Query provider.
5. Migrate dashboard urgent tasks/stats to query hooks.

### Phase 2 — Refactor tasks architecture (P0/P1)
1. Create `features/tasks` module.
2. Extract hooks/services/utils.
3. Split `SmartTaskManager` into subcomponents.
4. Replace direct Supabase mutations in component with mutation hooks.

### Phase 3 — Global/UI state cleanup (P1)
1. Add Zustand `useDashboardUIStore`.
2. Move active tab/chat/selection state into store.
3. Remove prop-drilled UI state where possible.
4. Move vaccine persistence into Supabase.

### Phase 4 — Performance optimization (P1/P2)
1. Dynamically import all heavy tab modules.
2. Memoize list items and category sections.
3. Move static guidance/config out of render bodies.
4. Consider route segmentation if dashboard continues growing.

### Phase 5 — Data model hardening (P2)
1. Tighten generated DB types.
2. Audit and document all RLS policies.
3. Add realtime query invalidation only where it materially helps.

---

## Concrete Target Architecture

```text
app/
  dashboard/
    page.tsx              # server shell + layout
features/
  dashboard/
    hooks/
      useDashboardSummary.ts
    store/
      dashboard-ui-store.ts
  tasks/
    components/
    hooks/
    services/
    utils/
  budget/
  savings/
  insurance/
lib/
  api/
    client.ts
  auth/
  query/
    keys.ts
    provider.tsx
```

### Final recommendation
If only one architectural move is made now, make it this:

**Adopt React Query for server state and split SmartTaskManager into a feature module.**

That single change will reduce coupling across state management, performance, data flow, and security work, and it creates a clean base for the rest of the audit fixes.