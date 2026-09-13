ALTER TABLE lesson_edits ADD COLUMN IF NOT EXISTS colab_url text;
-- NULL uses the course notebook. Empty string hides the practice button.
