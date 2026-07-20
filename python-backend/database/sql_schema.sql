-- =====================================================
-- Enable UUID generation
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Conversations Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL DEFAULT 'New Chat',

    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Conversation Messages Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL
        REFERENCES public.conversations(id)
        ON DELETE CASCADE,

    question TEXT NOT NULL,

    answer TEXT,

    data JSONB,

    visualization JSONB,

    execution_time NUMERIC,

    row_count INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_user
ON public.conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_updated
ON public.conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_status
ON public.conversations(status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON public.conversation_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_created
ON public.conversation_messages(created_at);

-- =====================================================
-- Automatically Update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversations_updated_at
ON public.conversations;

CREATE TRIGGER trigger_update_conversations_updated_at
BEFORE UPDATE
ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Enable Row Level Security
-- =====================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Conversations Policies
-- =====================================================

CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can create own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update own conversations"
ON public.conversations
FOR UPDATE
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);

-- NOTE:
-- No DELETE policy.
-- Conversations are soft deleted by updating:
-- status = 'inactive'

-- =====================================================
-- Conversation Messages Policies
-- =====================================================

CREATE POLICY "Users can view own messages"
ON public.conversation_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.conversations c
        WHERE c.id = conversation_messages.conversation_id
          AND c.user_id = auth.uid()
          AND c.status = 'active'
    )
);

CREATE POLICY "Users can insert own messages"
ON public.conversation_messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.conversations c
        WHERE c.id = conversation_messages.conversation_id
          AND c.user_id = auth.uid()
          AND c.status = 'active'
    )
);

CREATE POLICY "Users can update own messages"
ON public.conversation_messages
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.conversations c
        WHERE c.id = conversation_messages.conversation_id
          AND c.user_id = auth.uid()
          AND c.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.conversations c
        WHERE c.id = conversation_messages.conversation_id
          AND c.user_id = auth.uid()
          AND c.status = 'active'
    )
);