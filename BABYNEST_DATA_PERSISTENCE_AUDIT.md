# BabyNest Data Persistence Audit Report
**Date:** May 18, 2026  
**Issue:** Data not persisting when switching tabs

---

## 🔴 CRITICAL ISSUES FOUND

### 1. PregnancyTracker Component
**File:** `components/PregnancyTracker.tsx`  
**Problem:** Uses ONLY React state - no Supabase persistence OR localStorage  
**Data Lost:**
- Contraction history
- Kick counting sessions
- All timer data

**Current Code:**
```typescript
const [contractions, setContractions] = useState<Contraction[]>([]);
const [kickSessions, setKickSessions] = useState<KickSession[]>([]);
// NO localStorage or Supabase!
```

**Fix:** Add localStorage persistence for this data since it's ephemeral/temporary tracking data.

---

### 2. KickCounter Component
**File:** `components/KickCounter.tsx`  
**Problem:** Uses ONLY React state - no persistence  
**Data Lost:**
- Kick counting sessions
- Session history
- Daily averages

**Current Code:**
```typescript
const [sessions, setSessions] = useState<KickSession[]>([]);
// NO persistence!
```

**Fix:** Add localStorage persistence.

---

### 3. ContractionTimer Component
**File:** `components/ContractionTimer.tsx`  
**Problem:** Uses ONLY React state - no persistence  
**Data Lost:**
- Contraction history
- Timing data
- Average duration/interval calculations

**Fix:** Add localStorage persistence.

---

### 4. BudgetTracker Component
**File:** `components/BudgetTracker.tsx`  
**Problem:** CRITICAL - "Add Expense" only updates local state, NEVER saves to Supabase!

**Current Code:**
```typescript
const addExpense = () => {
  const expense: Expense = {
    id: `custom-${Date.now()}`,
    category: newExpense.category,
    amount: parseFloat(newExpense.amount),
    // ...
  };
  setExpenses([...expenses, expense]); // ONLY local state!
  // NO Supabase insert!
};
```

**Also:** `removeExpense` only filters local array, doesn't delete from Supabase.

**Fix:** Add Supabase insert/delete operations.

---

### 5. DocumentVault Component
**File:** `components/DocumentVault.tsx`  
**Problem:** Uses hardcoded sample data, no Supabase integration  
**Data Lost:**
- All uploaded documents (just logs to console)
- Favorites
- Tags
- Folder organization

**Current Code:**
```typescript
const [documents, setDocuments] = useState<Document[]>([
  { id: '1', name: 'BlueCross_Insurance_Card.pdf', ... }, // HARDCODED!
  // ...
]);

const onDrop = useCallback((acceptedFiles: File[]) => {
  console.log('Files:', acceptedFiles); // Just logs!
  setShowUpload(false);
}, []);
```

**Fix:** Integrate with Supabase storage and documents table.

---

## 🟡 MEDIUM ISSUES FOUND

### 6. SavingsGoals Component
**File:** `components/SavingsGoals.tsx`  
**Problem:** Likely has similar issues to BudgetTracker  
**Status:** Needs verification - component loads from Supabase but may not save updates.

---

## ✅ WORKING CORRECTLY

These components properly persist to Supabase:

1. **HospitalBagPlanner** - Uses `getHospitalBagItems()`, `upsertHospitalBagItem()`, `deleteHospitalBagItem()`
2. **SmartTaskManager** - Uses Supabase for tasks
3. **VaccinationTracker** - Uses localStorage (appropriate for client-side only data)
4. **BirthPlanBuilder** - Uses `getBirthPlan()`, `upsertBirthPlan()`
5. **SharedHeader Profile Edit** - Uses `updateProfile()` correctly ✓

---

## 🛠️ PRIORITY FIX ORDER

### Priority 1: BudgetTracker (CRITICAL)
- Add `addExpenseToSupabase()` function
- Add `deleteExpenseFromSupabase()` function
- Update existing `addExpense` and `removeExpense` functions

### Priority 2: Pregnancy Tracking Components
- Add localStorage persistence to `PregnancyTracker`
- Add localStorage persistence to `KickCounter`
- Add localStorage persistence to `ContractionTimer`

### Priority 3: DocumentVault
- Create Supabase storage bucket for documents
- Create documents table in Supabase
- Implement proper upload/download

---

## 📝 SQL NEEDED (If Not Already Run)

```sql
-- Ensure expenses table exists
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Add policy
DROP POLICY IF EXISTS "Users can only see their own expenses" ON expenses;
CREATE POLICY "Users can only see their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Documents table (for DocumentVault)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(100),
  folder VARCHAR(100) DEFAULT 'all',
  size INTEGER,
  storage_path VARCHAR(1000),
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  expiration_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only see their own documents" ON documents;
CREATE POLICY "Users can only see their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🧪 TESTING CHECKLIST

After fixes, verify:
- [ ] Add expense in BudgetTracker → Refresh page → Expense still there
- [ ] Delete expense in BudgetTracker → Refresh page → Expense gone
- [ ] Record kicks in KickCounter → Switch tabs → Return → Data persists
- [ ] Time contractions → Switch tabs → Return → History persists
- [ ] Upload document → Document appears in list after refresh
- [ ] Mark document favorite → Refresh → Still favorite
