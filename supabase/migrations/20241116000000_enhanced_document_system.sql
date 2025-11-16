-- Enhanced Document System for VC-Level Multi-Document Analysis
-- Migration: 20241116000000_enhanced_document_system.sql

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enhanced documents table with metadata and categorization
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN (
    'pitch-deck', 'financial-projections', 'market-research', 'business-plan',
    'term-sheet', 'cap-table', 'legal', 'product-roadmap', 'competitive-analysis',
    'customer-data', 'team-info', 'other'
  )),
  ADD COLUMN IF NOT EXISTS confidentiality_level TEXT DEFAULT 'internal' CHECK (
    confidentiality_level IN ('public', 'internal', 'confidential', 'restricted')
  ),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extracted_metrics JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS document_date DATE,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create document_chunks table for semantic search
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_embedding vector(1536), -- OpenAI ada-002 embeddings dimension
  chunk_type TEXT CHECK (chunk_type IN ('text', 'table', 'list', 'summary', 'financial')),
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON public.document_chunks
  USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own document chunks" ON public.document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Create document_relationships table for tracking connections between documents
CREATE TABLE IF NOT EXISTS public.document_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  target_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'references', 'supplements', 'contradicts', 'updates', 'supports',
    'part-of-series', 'alternative-version', 'related-company', 'related-market'
  )),
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_document_id, target_document_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS document_relationships_source_idx ON public.document_relationships(source_document_id);
CREATE INDEX IF NOT EXISTS document_relationships_target_idx ON public.document_relationships(target_document_id);

ALTER TABLE public.document_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage document relationships" ON public.document_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id IN (source_document_id, target_document_id)
      AND documents.user_id = auth.uid()
    )
  );

-- Create financial_metrics table for extracted financial data
CREATE TABLE IF NOT EXISTS public.financial_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'revenue', 'expenses', 'gross-margin', 'net-margin', 'burn-rate',
    'runway', 'arr', 'mrr', 'cac', 'ltv', 'ltv-cac-ratio', 'growth-rate',
    'valuation', 'headcount', 'customers', 'conversion-rate', 'churn-rate',
    'market-size', 'market-share', 'other'
  )),
  metric_name TEXT NOT NULL,
  value NUMERIC,
  value_string TEXT,
  unit TEXT,
  time_period TEXT,
  period_start DATE,
  period_end DATE,
  currency TEXT DEFAULT 'USD',
  confidence_score NUMERIC(3,2),
  extraction_method TEXT DEFAULT 'ai',
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS financial_metrics_document_id_idx ON public.financial_metrics(document_id);
CREATE INDEX IF NOT EXISTS financial_metrics_type_idx ON public.financial_metrics(metric_type);
CREATE INDEX IF NOT EXISTS financial_metrics_period_idx ON public.financial_metrics(period_start, period_end);

ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own financial metrics" ON public.financial_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = financial_metrics.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Create document_citations table for tracking references within documents
CREATE TABLE IF NOT EXISTS public.document_citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  cited_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  citation_text TEXT,
  source_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
  cited_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
  citation_type TEXT CHECK (citation_type IN ('direct-quote', 'paraphrase', 'data-reference', 'concept')),
  page_number INTEGER,
  relevance_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_citations_source_idx ON public.document_citations(source_document_id);
CREATE INDEX IF NOT EXISTS document_citations_cited_idx ON public.document_citations(cited_document_id);

ALTER TABLE public.document_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage citations" ON public.document_citations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id IN (source_document_id, cited_document_id)
      AND documents.user_id = auth.uid()
    )
  );

-- Create document_collections table for grouping related documents (e.g., all docs for a company)
CREATE TABLE IF NOT EXISTS public.document_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT CHECK (collection_type IN (
    'company', 'market-sector', 'investment-round', 'due-diligence', 'portfolio', 'custom'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_collections_user_id_idx ON public.document_collections(user_id);

ALTER TABLE public.document_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections" ON public.document_collections
  FOR ALL USING (auth.uid() = user_id);

-- Create junction table for documents in collections
CREATE TABLE IF NOT EXISTS public.collection_documents (
  collection_id UUID NOT NULL REFERENCES public.document_collections(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, document_id)
);

CREATE INDEX IF NOT EXISTS collection_documents_collection_idx ON public.collection_documents(collection_id);
CREATE INDEX IF NOT EXISTS collection_documents_document_idx ON public.collection_documents(document_id);

ALTER TABLE public.collection_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage collection documents" ON public.collection_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.document_collections
      WHERE document_collections.id = collection_id
      AND document_collections.user_id = auth.uid()
    )
  );

-- Create analysis_queries table to cache multi-document analysis results
CREATE TABLE IF NOT EXISTS public.analysis_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_type TEXT CHECK (query_type IN (
    'cross-document-comparison', 'trend-analysis', 'financial-analysis',
    'competitive-analysis', 'market-research', 'due-diligence', 'custom'
  )),
  document_ids UUID[] NOT NULL,
  collection_id UUID REFERENCES public.document_collections(id) ON DELETE SET NULL,
  results JSONB,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS analysis_queries_user_id_idx ON public.analysis_queries(user_id);
CREATE INDEX IF NOT EXISTS analysis_queries_type_idx ON public.analysis_queries(query_type);

ALTER TABLE public.analysis_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own queries" ON public.analysis_queries
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at on documents
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_collections_updated_at BEFORE UPDATE ON public.document_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to find similar document chunks using semantic search
CREATE OR REPLACE FUNCTION find_similar_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity float,
  chunk_type text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.content_embedding <=> query_embedding) as similarity,
    dc.chunk_type,
    dc.metadata
  FROM document_chunks dc
  INNER JOIN documents d ON d.id = dc.document_id
  WHERE
    (filter_document_ids IS NULL OR dc.document_id = ANY(filter_document_ids))
    AND d.user_id = auth.uid()
    AND 1 - (dc.content_embedding <=> query_embedding) > match_threshold
  ORDER BY dc.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get document relationships with metadata
CREATE OR REPLACE FUNCTION get_document_network(
  root_document_id uuid,
  max_depth int DEFAULT 2
)
RETURNS TABLE (
  document_id uuid,
  filename text,
  relationship_path text[],
  depth int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE doc_tree AS (
    -- Base case: the root document
    SELECT
      d.id,
      d.filename,
      ARRAY[d.filename]::text[] as path,
      0 as depth
    FROM documents d
    WHERE d.id = root_document_id AND d.user_id = auth.uid()

    UNION ALL

    -- Recursive case: related documents
    SELECT
      d.id,
      d.filename,
      dt.path || d.filename,
      dt.depth + 1
    FROM documents d
    INNER JOIN document_relationships dr ON (
      dr.target_document_id = d.id OR dr.source_document_id = d.id
    )
    INNER JOIN doc_tree dt ON (
      (dr.source_document_id = dt.document_id AND dr.target_document_id = d.id)
      OR (dr.target_document_id = dt.document_id AND dr.source_document_id = d.id)
    )
    WHERE dt.depth < max_depth
      AND d.user_id = auth.uid()
      AND d.id != dt.document_id
  )
  SELECT DISTINCT ON (dt.document_id)
    dt.document_id,
    dt.filename,
    dt.path,
    dt.depth
  FROM doc_tree dt
  ORDER BY dt.document_id, dt.depth;
END;
$$;

-- Function to aggregate financial metrics across documents
CREATE OR REPLACE FUNCTION compare_financial_metrics(
  document_ids_array uuid[],
  metric_types_filter text[] DEFAULT NULL
)
RETURNS TABLE (
  metric_type text,
  metric_name text,
  document_id uuid,
  filename text,
  value numeric,
  unit text,
  time_period text,
  period_start date,
  period_end date
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fm.metric_type,
    fm.metric_name,
    fm.document_id,
    d.filename,
    fm.value,
    fm.unit,
    fm.time_period,
    fm.period_start,
    fm.period_end
  FROM financial_metrics fm
  INNER JOIN documents d ON d.id = fm.document_id
  WHERE
    fm.document_id = ANY(document_ids_array)
    AND d.user_id = auth.uid()
    AND (metric_types_filter IS NULL OR fm.metric_type = ANY(metric_types_filter))
  ORDER BY fm.metric_type, fm.period_start NULLS LAST, d.filename;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE document_chunks IS 'Stores document chunks with vector embeddings for semantic search';
COMMENT ON TABLE document_relationships IS 'Tracks relationships and connections between documents';
COMMENT ON TABLE financial_metrics IS 'Extracted financial metrics from documents for analysis';
COMMENT ON TABLE document_citations IS 'Cross-references and citations between documents';
COMMENT ON TABLE document_collections IS 'Groups of related documents (companies, rounds, etc.)';
COMMENT ON TABLE analysis_queries IS 'Cached multi-document analysis results';

COMMENT ON FUNCTION find_similar_chunks IS 'Semantic search across document chunks using vector similarity';
COMMENT ON FUNCTION get_document_network IS 'Retrieves document relationship network with configurable depth';
COMMENT ON FUNCTION compare_financial_metrics IS 'Aggregates and compares financial metrics across multiple documents';
