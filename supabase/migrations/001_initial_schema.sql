-- Digital Time Capsule: Complete PostgreSQL Database Schema
-- Compatible with Supabase PostgreSQL and standard relational Postgres

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  timezone TEXT DEFAULT 'UTC',
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAPSULES TABLE
CREATE TABLE IF NOT EXISTS public.capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Personal', 'Friendship', 'Family', 'Love', 'Travel', 
    'Education', 'Graduation', 'Birthday', 'Special Moments', 'Other'
  )),
  cover_image TEXT,
  theme TEXT DEFAULT 'cosmic-cyan',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sealed', 'unlocked', 'archived')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  unlock_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sealed_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  is_archived BOOLEAN DEFAULT FALSE
);

-- 3. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio', 'document', 'other')),
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  caption TEXT,
  description TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LETTERS TABLE
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAPSULE MEMBERS TABLE (Collaboration)
CREATE TABLE IF NOT EXISTS public.capsule_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'contributor' CHECK (role IN ('owner', 'contributor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capsule_id, user_id)
);

-- 6. CAPSULE INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.capsule_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_email TEXT NOT NULL,
  role TEXT DEFAULT 'contributor' CHECK (role IN ('contributor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'capsule_created', 'capsule_sealed', 'invitation_received', 
    'contribution_received', 'capsule_unlocking_soon', 'capsule_unlocked', 'capsule_shared', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMENTS TABLE (Public capsules)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capsule_id, user_id)
);

-- 10. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capsule_id, user_id)
);

-- 11. REPORTS TABLE (Moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starlight', 'infinity')),
  storage_limit_bytes BIGINT DEFAULT 1073741824, -- 1GB free
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ACTIVITY LOGS TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  username TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_capsules_owner ON public.capsules(owner_id);
CREATE INDEX IF NOT EXISTS idx_capsules_status ON public.capsules(status);
CREATE INDEX IF NOT EXISTS idx_capsules_unlock ON public.capsules(unlock_at);
CREATE INDEX IF NOT EXISTS idx_capsules_visibility ON public.capsules(visibility);
CREATE INDEX IF NOT EXISTS idx_memories_capsule ON public.memories(capsule_id);
CREATE INDEX IF NOT EXISTS idx_members_capsule ON public.capsule_members(capsule_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
