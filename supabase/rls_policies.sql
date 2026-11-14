-- Row Level Security (RLS) Policies for Digital Time Capsule
-- Enforces strict server-side authorization and privacy boundaries

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. CAPSULES POLICIES
-- Owners can always view, contributors can view shared, and everyone can view unlocked public capsules
CREATE POLICY "Capsule view policy" 
  ON public.capsules FOR SELECT USING (
    owner_id = auth.uid()
    OR (visibility = 'public' AND status = 'unlocked')
    OR EXISTS (
      SELECT 1 FROM public.capsule_members 
      WHERE capsule_id = public.capsules.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert capsules" 
  ON public.capsules FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their draft capsules" 
  ON public.capsules FOR UPDATE USING (
    owner_id = auth.uid() AND (status = 'draft' OR status = 'sealed')
  );

CREATE POLICY "Owners can delete their capsules" 
  ON public.capsules FOR DELETE USING (owner_id = auth.uid());

-- 3. MEMORIES POLICIES
-- Only owners, active contributors, or public unlocked viewers can see memories
CREATE POLICY "Memory read authorization" 
  ON public.memories FOR SELECT USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.capsules c
      WHERE c.id = public.memories.capsule_id
      AND (
        c.owner_id = auth.uid()
        OR (c.visibility = 'public' AND c.status = 'unlocked')
        OR (c.status = 'unlocked' AND EXISTS (
          SELECT 1 FROM public.capsule_members m 
          WHERE m.capsule_id = c.id AND m.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Contributors and owners can insert memories" 
  ON public.memories FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.capsules c
      WHERE c.id = capsule_id
      AND (
        c.owner_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.capsule_members m 
          WHERE m.capsule_id = c.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'contributor')
        )
      )
      AND c.status != 'sealed'
    )
  );

-- 4. LETTERS POLICIES
CREATE POLICY "Letter view access" 
  ON public.letters FOR SELECT USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.capsules c 
      WHERE c.id = public.letters.capsule_id 
      AND (
        (c.status = 'unlocked' AND (c.visibility = 'public' OR c.owner_id = auth.uid()))
        OR (c.status = 'unlocked' AND EXISTS (
          SELECT 1 FROM public.capsule_members m WHERE m.capsule_id = c.id AND m.user_id = auth.uid()
        ))
      )
    )
  );

-- 5. NOTIFICATIONS POLICIES
CREATE POLICY "Users can only view their own notifications" 
  ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" 
  ON public.notifications FOR UPDATE USING (user_id = auth.uid());
