-- ============================================================================
-- SQL Script to Update Storage URLs from GCS to Supabase
-- Generated: 2025-11-01 20:17:43
-- ============================================================================
-- IMPORTANT: Review this script before running in Supabase SQL Editor
-- ============================================================================

BEGIN;

-- ============================================================================
-- UPDATE IMAGE URLS (enkellaering_images -> enkellaering-images)
-- ============================================================================

-- Original: logo enkel mini (for rundt logo).png
-- Sanitized: logo_enkel_mini_(for_rundt_logo).png
-- Old: https://storage.googleapis.com/enkellaering_images/logo enkel mini (for rundt logo).png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/logo_enkel_mini_(for_rundt_logo).png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/logo_enkel_mini_(for_rundt_logo).png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/logo enkel mini (for rundt logo).png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/logo_enkel_mini_(for_rundt_logo).png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/logo enkel mini (for rundt logo).png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/logo_enkel_mini_(for_rundt_logo).png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/logo enkel mini (for rundt logo).png';

-- Original: quiz_covers/Matte_10_klasse_og_lavere.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_10_klasse_og_lavere.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_10_klasse_og_lavere.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_10_klasse_og_lavere.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_10_klasse_og_lavere.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_10_klasse_og_lavere.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_10_klasse_og_lavere.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_10_klasse_og_lavere.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_10_klasse_og_lavere.jpg';

-- Original: quiz_covers/Matte_1p.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1p.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1p.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1p.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1p.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1p.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1p.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1p.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1p.jpg';

-- Original: quiz_covers/Matte_1t.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1t.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1t.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1t.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1t.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1t.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1t.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_1t.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_1t.jpg';

-- Original: quiz_covers/Matte_2p.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_2p.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_2p.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_2p.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_2p.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_2p.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_2p.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_2p.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_2p.jpg';

-- Original: quiz_covers/Matte_R1_og_S1.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_R1_og_S1.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_R1_og_S1.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_R1_og_S1.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_R1_og_S1.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_R1_og_S1.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_R1_og_S1.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Matte_R1_og_S1.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Matte_R1_og_S1.jpg';

-- Original: quiz_covers/TEST.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/TEST.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/TEST.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/TEST.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/TEST.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/TEST.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/TEST.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/TEST.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/TEST.jpg';

-- Original: quiz_covers/Test_3.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_covers/Test_3.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Test_3.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Test_3.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Test_3.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Test_3.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Test_3.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_covers/Test_3.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_covers/Test_3.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/0ddc4e9a-0c3f-41c7-9c13-a5eeb5fbd5ff.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/16ff5d2e-2e9d-43c9-b290-691781b9347f.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/268c327e-3b9f-4801-8778-bd5f10051cdb.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/34512e0c-7d67-4c91-bfb6-f7fdd2b24c68.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/3fde3eef-dc13-43b5-9565-f6f69de1889b.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54757108-7ef3-48f4-bd1e-8d44d1b873e6.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/54eb04ee-eefe-46db-b215-534bc8d920bb.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/67a97e52-7ef5-4161-9cf0-19aeba5b6dd6.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/6dda6d2f-9931-436a-9fcd-76ab989fc85f.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/77ba91fc-ca0e-4149-9447-b78862603978.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/851097d1-64fe-4d93-929c-2fa68a7077ed.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a0dd22cf-a772-4582-aeb3-a6cce5ccd715.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/a14fa793-96f9-4bb0-b495-73861979321c.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/c5dd3d1f-2f45-4023-897d-690c87e000c2.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/cee4fa21-6cc8-4285-a97f-22e66f65b2f2.png';

-- Original: quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/1fac8313-799a-4811-a2e3-cdcf8e2a113c/d8617bf9-bf24-48a2-988a-cecf4412287f.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/0e77fd02-f04c-40db-8c17-c6cf6034c5e7.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/2caf2ae9-8ede-4d49-829b-9c7a55109b40.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/47e8e289-070a-449b-85e4-5c870afb3bc5.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4a7fc377-139e-4bdb-b938-675114ebd535.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/4edfa158-856a-4fa6-95d9-eac8d41fa0c8.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/6db038be-a7b1-4c77-9673-aabcda8d2c79.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/74844e0c-f0af-4a51-b1ee-2b22d3cfc849.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/87f3ba34-a8cb-4ba8-bab9-b7330d0bb326.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/99f1843b-5ca1-41c4-8ff4-d529c138dc22.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/a760f64f-0756-4e55-9f49-a582cbb50bef.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ad27bef3-fcb8-4e42-9902-961b375a3ab3.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/beaa7f8b-b379-4add-8523-bdfe097a21df.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/d55067e0-37d8-4540-8e11-d2bec6c3bea7.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/dbd7fbdc-9bf0-4f10-83bf-20a3ffa091ae.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/ddb2d6ab-1c6e-43e4-a78d-8bb87168e96c.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/e29ff63a-2e06-4808-8d75-27e3be91fc9f.png';

-- Original: quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/539167e4-c217-4c48-9c74-843aa46b3dce/fcfcf5cf-c021-4f84-bb66-5d5dee813291.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/0a8506a5-ade9-4d27-af9e-82982a62f26f.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/1d85c145-4fef-4e00-97b6-e956ff2544dd.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/2bb3aef0-24bc-45d0-ad44-45065286ab0f.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/47aff9f6-d8c1-4579-afdd-4571f8650227.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/503b2bae-e0cc-421a-b778-1b701f4f4545.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/52caf84c-ba3f-42b5-9ca5-01f05a6e6ead.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5c744950-63e5-4453-815e-6c5c1b82dc82.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/5e5ded9b-7dfe-47f0-aa00-e88f1a90a8e6.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/6e847801-44a7-4aea-ac70-65d055ced27d.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/7a4897a4-231c-4cb6-bede-fd2b10225225.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/8e973345-c121-461f-802f-af03f6278597.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/90cf40bd-468f-458d-98dd-0ef3d120865c.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/9180e662-1bfb-413e-82ee-229ac4d5ced9.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/aa40a194-dd23-498e-9982-b8ea9b67d157.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/c64b6151-88d5-473c-a219-b766dff5770f.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e15396ad-8bc8-4f4e-8c8b-01e2913c9611.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/e32a7b02-654e-4dae-a809-b7c70aa60ac6.png';

-- Original: quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/714aa37d-a0a6-4382-af4a-5b5020a080ac/f4fe7e58-a151-48b3-a9c3-5ef42b5a8d15.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/11a53c72-43bb-4fa7-8ea9-9bc18ed7c60c.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1431861e-020a-4c12-8a92-38ace18bd321.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/1521d7b5-a7c7-4a15-9b79-ff1e50a71983.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/55bb1fe3-f854-42e1-a702-a25a2e2aa5c6.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/5f07ee6b-9ef6-41bb-87cd-d5a192c139e8.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/65666c96-477b-4c1a-9730-a5ed65faa4d7.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/686740b5-436a-4fbf-a17f-2e3eb2a2987b.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/6b27314a-a0cc-4bd9-b0c2-c6059fb1f4ba.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/78e7c977-3e34-47d9-b267-5ecb70d41c65.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/7c7cd091-9523-412d-a4f6-f0e390a6ce72.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/81ab9e06-2a29-4a4f-a709-ca533644f591.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/cb1d5e89-e444-431d-82b5-3e5d1c65954b.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/d72725bb-bf7c-4375-b74f-ea3a440c5f0a.png';

-- Original: quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/84aa6401-b893-4e84-a78f-eb9e3993c8c7/ead0480c-1d4d-495a-a02e-da4aaf47789c.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/091d6b55-163a-4bd5-9c46-cbeeac11cf8c.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/0fca54bf-9a0b-49ef-bed8-aa86c8aa063f.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/1b6ab134-eaa6-4f26-acef-39b7bf632b84.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/2326846b-892f-4edf-9339-d5b3bc7ac593.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/3a1a6fec-37f7-42e7-9ba1-cc0a2338425b.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/5d10ccff-2bb6-438c-8ed6-4706d97b6414.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/6d0978b2-8772-4491-ac01-e61784f4ec70.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/796f7058-d9c6-4157-aa77-9f0bd7148888.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/80f6ba31-ef81-4131-ae9a-29956c468dda.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/85c1e042-dc37-41d3-97aa-a7d9de33ffed.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/9342def9-5149-4fd3-92d3-fe4032f76afc.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/990677c4-c44e-434a-b835-b1b6e08dcd76.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b208100f-dd6e-4da4-8a2b-b2a70bf82a59.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/b8c1837a-12fc-4430-88ed-a51edfe3bfcd.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/c76656d1-5beb-4d14-bbc9-e43cb9deb05e.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f6c0d963-a32f-4b2f-8877-f63a5689961c.png';

-- Original: quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png
-- Old: https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/quiz_images/9748039d-8571-43fd-9fa5-007696ea9f7f/f868618c-4843-4890-8d6f-bc2cb4515730.png';

-- Original: teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/3X1qF0ltcoYNtHzzcylnI89hIV53/3X1qF0ltcoYNtHzzcylnI89hIV53-profile_picture.png';

-- Original: teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2/5IqGxOSoUwQHT1s5gsAP6Vyf4ir2-profile_picture.jpg';

-- Original: teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/69FmRz56VphVntUbxD6WypkME5T2/69FmRz56VphVntUbxD6WypkME5T2-profile_picture.jpg';

-- Original: teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/8e5VZAJdxtVgM9sPa3aDlcTncxR2/8e5VZAJdxtVgM9sPa3aDlcTncxR2-profile_picture.jpg';

-- Original: teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/8s8bip2QrqXh0pdskrqY7eyaaHM2/8s8bip2QrqXh0pdskrqY7eyaaHM2-profile_picture.jpg';

-- Original: teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2/Hv3hmD5p5vRSKhUJ9z8ix8WxiQl2-profile_picture.jpg';

-- Original: teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/J6LrfGOVyGYULFwVlt4Qk4VNxIf2/J6LrfGOVyGYULFwVlt4Qk4VNxIf2-profile_picture.jpg';

-- Original: teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/MLTstkCpTkSj6fnQYtcEwYxvRUp2/MLTstkCpTkSj6fnQYtcEwYxvRUp2-profile_picture.jpg';

-- Original: teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/MXD57KpqoHTY9UhteZxMTgnsiLg1/MXD57KpqoHTY9UhteZxMTgnsiLg1-profile_picture.jpg';

-- Original: teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/NyIKKBOApOXb1uBYW6nR7tUchpL2/NyIKKBOApOXb1uBYW6nR7tUchpL2-profile_picture.jpg';

-- Original: teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/Pq2SjYJkRjZP84fVWnYRkYbHv4x2/Pq2SjYJkRjZP84fVWnYRkYbHv4x2-profile_picture.jpg';

-- Original: teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2/SIhMmFOdLIU1G6Mg9Dq1QNhpGZw2-profile_picture.jpg';

-- Original: teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/VeDT7NpG6JhiPPKhKq3OhZP3H6y2/VeDT7NpG6JhiPPKhKq3OhZP3H6y2-profile_picture.jpg';

-- Original: teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/aeeAlCYoBXW04MNAXVmnswKM7d52/aeeAlCYoBXW04MNAXVmnswKM7d52-profile_picture.jpg';

-- Original: teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/d3Q8eamO6sZEOm4NFUyw69jS0jr1/d3Q8eamO6sZEOm4NFUyw69jS0jr1-profile_picture.jpg';

-- Original: teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/i3HaPdTA4LSWiiQDuU80ETehvVj1/i3HaPdTA4LSWiiQDuU80ETehvVj1-profile_picture.jpg';

-- Original: teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/ichpSn0QXiY0MWwoe4ZA19UKNqC3/ichpSn0QXiY0MWwoe4ZA19UKNqC3-profile_picture.jpg';

-- Original: teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/nCPkyhU4UIe0qO9zS744TnDaiFT2/nCPkyhU4UIe0qO9zS744TnDaiFT2-profile_picture.jpg';

-- Original: teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/qzTg6NUWdBdlwPBPjyskODOANof1/qzTg6NUWdBdlwPBPjyskODOANof1-profile_picture.jpg';

-- Original: teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/uHLykM7LGvdSD8iwlUgCdNJ5qIg2/uHLykM7LGvdSD8iwlUgCdNJ5qIg2-profile_picture.jpg';

-- Original: teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/zK2k4taNC3YBtWsTaZX8N4xIT7s2/zK2k4taNC3YBtWsTaZX8N4xIT7s2-profile_picture.jpg';

-- Original: teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg
-- Old: https://storage.googleapis.com/enkellaering_images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg

UPDATE quizzes SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg';
UPDATE questions SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg';
UPDATE about_me_texts SET image_url = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg' WHERE image_url = 'https://storage.googleapis.com/enkellaering_images/teacher_images/zaUsu2JDisavCgdsrj6N7IE3Sku2/zaUsu2JDisavCgdsrj6N7IE3Sku2-profile-picture.jpg';


-- ============================================================================
-- UPDATE RESUME URLS (enkellaering-resumes -> enkellaering-resumes)
-- ============================================================================

-- Original: resumes/Aadi_Vidyarthi/Aadi Vidyarthi - CV Norsk.pdf
-- Sanitized: resumes/Aadi_Vidyarthi/Aadi_Vidyarthi_-_CV_Norsk.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Aadi_Vidyarthi/Aadi Vidyarthi - CV Norsk.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Aadi_Vidyarthi/Aadi_Vidyarthi_-_CV_Norsk.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Aadi_Vidyarthi/Aadi_Vidyarthi_-_CV_Norsk.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Aadi_Vidyarthi/Aadi Vidyarthi - CV Norsk.pdf';

-- Original: resumes/Aarthi_Sunder/Aarthi+Sunder-2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Aarthi_Sunder/Aarthi+Sunder-2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Aarthi_Sunder/Aarthi+Sunder-2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Aarthi_Sunder/Aarthi+Sunder-2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Aarthi_Sunder/Aarthi+Sunder-2025.pdf';

-- Original: resumes/Agnes Marie_Hægeland/CV 2025 Agnes Marie Hægeland.pdf
-- Sanitized: resumes/Agnes_Marie_Haegeland/CV_2025_Agnes_Marie_Haegeland.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Agnes Marie_Hægeland/CV 2025 Agnes Marie Hægeland.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Agnes_Marie_Haegeland/CV_2025_Agnes_Marie_Haegeland.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Agnes_Marie_Haegeland/CV_2025_Agnes_Marie_Haegeland.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Agnes Marie_Hægeland/CV 2025 Agnes Marie Hægeland.pdf';

-- Original: resumes/Ahsan Habib_Sonar/CV_AhsanSonar.pdf
-- Sanitized: resumes/Ahsan_Habib_Sonar/CV_AhsanSonar.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Ahsan Habib_Sonar/CV_AhsanSonar.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ahsan_Habib_Sonar/CV_AhsanSonar.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ahsan_Habib_Sonar/CV_AhsanSonar.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Ahsan Habib_Sonar/CV_AhsanSonar.pdf';

-- Original: resumes/Alisha_Chaudhry/Alisha_Chaudhry_25ver.jpg.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Alisha_Chaudhry/Alisha_Chaudhry_25ver.jpg.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Alisha_Chaudhry/Alisha_Chaudhry_25ver.jpg.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Alisha_Chaudhry/Alisha_Chaudhry_25ver.jpg.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Alisha_Chaudhry/Alisha_Chaudhry_25ver.jpg.pdf';

-- Original: resumes/Ana_Gregori/CVEL.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Ana_Gregori/CVEL.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ana_Gregori/CVEL.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ana_Gregori/CVEL.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Ana_Gregori/CVEL.pdf';

-- Original: resumes/August_Koksvik/CV (25.07.2025).pdf
-- Sanitized: resumes/August_Koksvik/CV_(25.07.2025).pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/August_Koksvik/CV (25.07.2025).pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/August_Koksvik/CV_(25.07.2025).pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/August_Koksvik/CV_(25.07.2025).pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/August_Koksvik/CV (25.07.2025).pdf';

-- Original: resumes/Aurora_Løfblad/CV - 2025.pdf
-- Sanitized: resumes/Aurora_Lofblad/CV_-_2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Aurora_Løfblad/CV - 2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Aurora_Lofblad/CV_-_2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Aurora_Lofblad/CV_-_2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Aurora_Løfblad/CV - 2025.pdf';

-- Original: resumes/Axel_Moursund/Cv 2025 Norsk.pdf
-- Sanitized: resumes/Axel_Moursund/Cv_2025_Norsk.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Axel_Moursund/Cv 2025 Norsk.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Axel_Moursund/Cv_2025_Norsk.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Axel_Moursund/Cv_2025_Norsk.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Axel_Moursund/Cv 2025 Norsk.pdf';

-- Original: resumes/Christine_Fagermoen/20250807 - CV Enkel læring - v2.pdf
-- Sanitized: resumes/Christine_Fagermoen/20250807_-_CV_Enkel_laering_-_v2.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Christine_Fagermoen/20250807 - CV Enkel læring - v2.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Christine_Fagermoen/20250807_-_CV_Enkel_laering_-_v2.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Christine_Fagermoen/20250807_-_CV_Enkel_laering_-_v2.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Christine_Fagermoen/20250807 - CV Enkel læring - v2.pdf';

-- Original: resumes/Emma Karoline _Gurijordet/Cv- ny (emma).pdf
-- Sanitized: resumes/Emma_Karoline__Gurijordet/Cv-_ny_(emma).pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Emma Karoline _Gurijordet/Cv- ny (emma).pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Emma_Karoline__Gurijordet/Cv-_ny_(emma).pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Emma_Karoline__Gurijordet/Cv-_ny_(emma).pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Emma Karoline _Gurijordet/Cv- ny (emma).pdf';

-- Original: resumes/Erik Johan _Solbø/CV Erik Johan Solbø (3).pdf
-- Sanitized: resumes/Erik_Johan__Solbo/CV_Erik_Johan_Solbo_(3).pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Erik Johan _Solbø/CV Erik Johan Solbø (3).pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Erik_Johan__Solbo/CV_Erik_Johan_Solbo_(3).pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Erik_Johan__Solbo/CV_Erik_Johan_Solbo_(3).pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Erik Johan _Solbø/CV Erik Johan Solbø (3).pdf';

-- Original: resumes/Hansine_Gregersen/Hansine Gregersen.pdf
-- Sanitized: resumes/Hansine_Gregersen/Hansine_Gregersen.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Hansine_Gregersen/Hansine Gregersen.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Hansine_Gregersen/Hansine_Gregersen.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Hansine_Gregersen/Hansine_Gregersen.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Hansine_Gregersen/Hansine Gregersen.pdf';

-- Original: resumes/Henrik_Chan/CV_Henrik Hei-Cheung Chan_HØST 2025.pdf
-- Sanitized: resumes/Henrik_Chan/CV_Henrik_Hei-Cheung_Chan_HOST_2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Henrik_Chan/CV_Henrik Hei-Cheung Chan_HØST 2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Henrik_Chan/CV_Henrik_Hei-Cheung_Chan_HOST_2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Henrik_Chan/CV_Henrik_Hei-Cheung_Chan_HOST_2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Henrik_Chan/CV_Henrik Hei-Cheung Chan_HØST 2025.pdf';

-- Original: resumes/Ilaria_Marazzina/CV Ilaria Marazzina 2025.pdf
-- Sanitized: resumes/Ilaria_Marazzina/CV_Ilaria_Marazzina_2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Ilaria_Marazzina/CV Ilaria Marazzina 2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ilaria_Marazzina/CV_Ilaria_Marazzina_2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ilaria_Marazzina/CV_Ilaria_Marazzina_2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Ilaria_Marazzina/CV Ilaria Marazzina 2025.pdf';

-- Original: resumes/Iselin_Mordal Bakke/CV aug 2025- Iselin Mordal Bakke.pdf
-- Sanitized: resumes/Iselin_Mordal_Bakke/CV_aug_2025-_Iselin_Mordal_Bakke.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Iselin_Mordal Bakke/CV aug 2025- Iselin Mordal Bakke.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Iselin_Mordal_Bakke/CV_aug_2025-_Iselin_Mordal_Bakke.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Iselin_Mordal_Bakke/CV_aug_2025-_Iselin_Mordal_Bakke.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Iselin_Mordal Bakke/CV aug 2025- Iselin Mordal Bakke.pdf';

-- Original: resumes/Jacob Hesle_Borkenhagen/FINN_CV_Jacob_Hesle_Borkenhagen.pdf
-- Sanitized: resumes/Jacob_Hesle_Borkenhagen/FINN_CV_Jacob_Hesle_Borkenhagen.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Jacob Hesle_Borkenhagen/FINN_CV_Jacob_Hesle_Borkenhagen.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jacob_Hesle_Borkenhagen/FINN_CV_Jacob_Hesle_Borkenhagen.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jacob_Hesle_Borkenhagen/FINN_CV_Jacob_Hesle_Borkenhagen.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Jacob Hesle_Borkenhagen/FINN_CV_Jacob_Hesle_Borkenhagen.pdf';

-- Original: resumes/Jenny_Le/Jenny_CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Jenny_Le/Jenny_CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jenny_Le/Jenny_CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jenny_Le/Jenny_CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Jenny_Le/Jenny_CV.pdf';

-- Original: resumes/Jessica Marie _Sylju/CV. 2025-  Jessica Marie Sylju.pdf
-- Sanitized: resumes/Jessica_Marie__Sylju/CV._2025-__Jessica_Marie_Sylju.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Jessica Marie _Sylju/CV. 2025-  Jessica Marie Sylju.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jessica_Marie__Sylju/CV._2025-__Jessica_Marie_Sylju.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jessica_Marie__Sylju/CV._2025-__Jessica_Marie_Sylju.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Jessica Marie _Sylju/CV. 2025-  Jessica Marie Sylju.pdf';

-- Original: resumes/Jonas_Svendsen/CV  energi (CV).pdf
-- Sanitized: resumes/Jonas_Svendsen/CV__energi_(CV).pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Jonas_Svendsen/CV  energi (CV).pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jonas_Svendsen/CV__energi_(CV).pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Jonas_Svendsen/CV__energi_(CV).pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Jonas_Svendsen/CV  energi (CV).pdf';

-- Original: resumes/Julius Ferrer_Hemsen/FINN_CV_Julius_Ferrer_Hemsen.pdf
-- Sanitized: resumes/Julius_Ferrer_Hemsen/FINN_CV_Julius_Ferrer_Hemsen.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Julius Ferrer_Hemsen/FINN_CV_Julius_Ferrer_Hemsen.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Julius_Ferrer_Hemsen/FINN_CV_Julius_Ferrer_Hemsen.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Julius_Ferrer_Hemsen/FINN_CV_Julius_Ferrer_Hemsen.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Julius Ferrer_Hemsen/FINN_CV_Julius_Ferrer_Hemsen.pdf';

-- Original: resumes/Justin_Ødegård/CV2025.pdf
-- Sanitized: resumes/Justin_Odegard/CV2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Justin_Ødegård/CV2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Justin_Odegard/CV2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Justin_Odegard/CV2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Justin_Ødegård/CV2025.pdf';

-- Original: resumes/Kristine_Gjulem/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Kristine_Gjulem/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Kristine_Gjulem/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Kristine_Gjulem/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Kristine_Gjulem/CV.pdf';

-- Original: resumes/Kurt_Jansons/CV Kurt Janson k.pdf
-- Sanitized: resumes/Kurt_Jansons/CV_Kurt_Janson_k.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Kurt_Jansons/CV Kurt Janson k.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Kurt_Jansons/CV_Kurt_Janson_k.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Kurt_Jansons/CV_Kurt_Janson_k.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Kurt_Jansons/CV Kurt Janson k.pdf';

-- Original: resumes/Leah_Gulliksen/Leah Gulliksen - CV 2025.pdf
-- Sanitized: resumes/Leah_Gulliksen/Leah_Gulliksen_-_CV_2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Leah_Gulliksen/Leah Gulliksen - CV 2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Leah_Gulliksen/Leah_Gulliksen_-_CV_2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Leah_Gulliksen/Leah_Gulliksen_-_CV_2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Leah_Gulliksen/Leah Gulliksen - CV 2025.pdf';

-- Original: resumes/Magnus _Grønvold Menkerud/Magnus Menkerud - CV.pdf
-- Sanitized: resumes/Magnus__Gronvold_Menkerud/Magnus_Menkerud_-_CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Magnus _Grønvold Menkerud/Magnus Menkerud - CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Magnus__Gronvold_Menkerud/Magnus_Menkerud_-_CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Magnus__Gronvold_Menkerud/Magnus_Menkerud_-_CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Magnus _Grønvold Menkerud/Magnus Menkerud - CV.pdf';

-- Original: resumes/Marie_Sviund/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Marie_Sviund/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Marie_Sviund/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Marie_Sviund/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Marie_Sviund/CV.pdf';

-- Original: resumes/Maryam _Ahmed/Maryam Ahmed CV.pdf
-- Sanitized: resumes/Maryam__Ahmed/Maryam_Ahmed_CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Maryam _Ahmed/Maryam Ahmed CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Maryam__Ahmed/Maryam_Ahmed_CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Maryam__Ahmed/Maryam_Ahmed_CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Maryam _Ahmed/Maryam Ahmed CV.pdf';

-- Original: resumes/Mathias Hardy_Peremans/CV-Mathias Hardy Peremans (1) (1) (1).pdf
-- Sanitized: resumes/Mathias_Hardy_Peremans/CV-Mathias_Hardy_Peremans_(1)_(1)_(1).pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Mathias Hardy_Peremans/CV-Mathias Hardy Peremans (1) (1) (1).pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Mathias_Hardy_Peremans/CV-Mathias_Hardy_Peremans_(1)_(1)_(1).pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Mathias_Hardy_Peremans/CV-Mathias_Hardy_Peremans_(1)_(1)_(1).pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Mathias Hardy_Peremans/CV-Mathias Hardy Peremans (1) (1) (1).pdf';

-- Original: resumes/Milica_Gojkovic/CV Milica 2025.pdf
-- Sanitized: resumes/Milica_Gojkovic/CV_Milica_2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Milica_Gojkovic/CV Milica 2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Milica_Gojkovic/CV_Milica_2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Milica_Gojkovic/CV_Milica_2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Milica_Gojkovic/CV Milica 2025.pdf';

-- Original: resumes/Muskaan_Tasawar/CV - Muskaan Tasawar.pdf
-- Sanitized: resumes/Muskaan_Tasawar/CV_-_Muskaan_Tasawar.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Muskaan_Tasawar/CV - Muskaan Tasawar.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Muskaan_Tasawar/CV_-_Muskaan_Tasawar.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Muskaan_Tasawar/CV_-_Muskaan_Tasawar.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Muskaan_Tasawar/CV - Muskaan Tasawar.pdf';

-- Original: resumes/Nafees_Raza/nafees raza cv.pdf
-- Sanitized: resumes/Nafees_Raza/nafees_raza_cv.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Nafees_Raza/nafees raza cv.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Nafees_Raza/nafees_raza_cv.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Nafees_Raza/nafees_raza_cv.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Nafees_Raza/nafees raza cv.pdf';

-- Original: resumes/Nora_Abbass/CV Nora Abbass (English).pdf
-- Sanitized: resumes/Nora_Abbass/CV_Nora_Abbass_(English).pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Nora_Abbass/CV Nora Abbass (English).pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Nora_Abbass/CV_Nora_Abbass_(English).pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Nora_Abbass/CV_Nora_Abbass_(English).pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Nora_Abbass/CV Nora Abbass (English).pdf';

-- Original: resumes/Pete_Mongkolcharoenchok/17.Aug.2025.BI.CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Pete_Mongkolcharoenchok/17.Aug.2025.BI.CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Pete_Mongkolcharoenchok/17.Aug.2025.BI.CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Pete_Mongkolcharoenchok/17.Aug.2025.BI.CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Pete_Mongkolcharoenchok/17.Aug.2025.BI.CV.pdf';

-- Original: resumes/Ragnhild_Blindheim/Ragnhild_Blindheim_CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Ragnhild_Blindheim/Ragnhild_Blindheim_CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ragnhild_Blindheim/Ragnhild_Blindheim_CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Ragnhild_Blindheim/Ragnhild_Blindheim_CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Ragnhild_Blindheim/Ragnhild_Blindheim_CV.pdf';

-- Original: resumes/Reda_Zomlot/CV Reda Zomlot.pdf
-- Sanitized: resumes/Reda_Zomlot/CV_Reda_Zomlot.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Reda_Zomlot/CV Reda Zomlot.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Reda_Zomlot/CV_Reda_Zomlot.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Reda_Zomlot/CV_Reda_Zomlot.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Reda_Zomlot/CV Reda Zomlot.pdf';

-- Original: resumes/Saad_BIn Adnan/Saad-Adnan MAIN .pdf
-- Sanitized: resumes/Saad_BIn_Adnan/Saad-Adnan_MAIN_.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Saad_BIn Adnan/Saad-Adnan MAIN .pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Saad_BIn_Adnan/Saad-Adnan_MAIN_.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Saad_BIn_Adnan/Saad-Adnan_MAIN_.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Saad_BIn Adnan/Saad-Adnan MAIN .pdf';

-- Original: resumes/Sander_Geiser/cv 2025 juli.pdf
-- Sanitized: resumes/Sander_Geiser/cv_2025_juli.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Sander_Geiser/cv 2025 juli.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Sander_Geiser/cv_2025_juli.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Sander_Geiser/cv_2025_juli.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Sander_Geiser/cv 2025 juli.pdf';

-- Original: resumes/Sara_Lund/jul. 4, dok 1.pdf
-- Sanitized: resumes/Sara_Lund/jul._4,_dok_1.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Sara_Lund/jul. 4, dok 1.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Sara_Lund/jul._4,_dok_1.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Sara_Lund/jul._4,_dok_1.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Sara_Lund/jul. 4, dok 1.pdf';

-- Original: resumes/Sumaiya Hossain_Binti/Sumaiya_Hossain_Binti_CV.pdf
-- Sanitized: resumes/Sumaiya_Hossain_Binti/Sumaiya_Hossain_Binti_CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Sumaiya Hossain_Binti/Sumaiya_Hossain_Binti_CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Sumaiya_Hossain_Binti/Sumaiya_Hossain_Binti_CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Sumaiya_Hossain_Binti/Sumaiya_Hossain_Binti_CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Sumaiya Hossain_Binti/Sumaiya_Hossain_Binti_CV.pdf';

-- Original: resumes/Test_Testesen/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Test_Testesen/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Test_Testesen/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Test_Testesen/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Test_Testesen/CV.pdf';

-- Original: resumes/Test_Testetsen/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Test_Testetsen/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Test_Testetsen/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Test_Testetsen/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Test_Testetsen/CV.pdf';

-- Original: resumes/Thomas 2_Myrseth/CV.pdf
-- Sanitized: resumes/Thomas_2_Myrseth/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Thomas 2_Myrseth/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Thomas_2_Myrseth/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Thomas_2_Myrseth/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Thomas 2_Myrseth/CV.pdf';

-- Original: resumes/Thomas 3_Myrseth/CV.pdf
-- Sanitized: resumes/Thomas_3_Myrseth/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Thomas 3_Myrseth/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Thomas_3_Myrseth/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Thomas_3_Myrseth/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Thomas 3_Myrseth/CV.pdf';

-- Original: resumes/Thomas_Myrseth/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Thomas_Myrseth/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Thomas_Myrseth/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Thomas_Myrseth/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Thomas_Myrseth/CV.pdf';

-- Original: resumes/Tord _Kirkhus/Tord Kirkhus CV.pdf
-- Sanitized: resumes/Tord__Kirkhus/Tord_Kirkhus_CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Tord _Kirkhus/Tord Kirkhus CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Tord__Kirkhus/Tord_Kirkhus_CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Tord__Kirkhus/Tord_Kirkhus_CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Tord _Kirkhus/Tord Kirkhus CV.pdf';

-- Original: resumes/Tuva Katrine_Osmundsen/CV Tuva Høst 2025.pdf
-- Sanitized: resumes/Tuva_Katrine_Osmundsen/CV_Tuva_Host_2025.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Tuva Katrine_Osmundsen/CV Tuva Høst 2025.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Tuva_Katrine_Osmundsen/CV_Tuva_Host_2025.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Tuva_Katrine_Osmundsen/CV_Tuva_Host_2025.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Tuva Katrine_Osmundsen/CV Tuva Høst 2025.pdf';

-- Original: resumes/Zahra_Foad/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/Zahra_Foad/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Zahra_Foad/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/Zahra_Foad/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/Zahra_Foad/CV.pdf';

-- Original: resumes/halat_ahmed/Cv.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/halat_ahmed/Cv.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/halat_ahmed/Cv.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/halat_ahmed/Cv.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/halat_ahmed/Cv.pdf';

-- Original: resumes/rthj_fghj/CV.pdf
-- Old: https://storage.googleapis.com/enkellaering-resumes/resumes/rthj_fghj/CV.pdf
-- New: https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/rthj_fghj/CV.pdf

UPDATE job_applications SET resumelink = 'https://clfgrepvidmzconiqqrt.supabase.co/storage/v1/object/public/enkellaering-resumes/resumes/rthj_fghj/CV.pdf' WHERE resumelink = 'https://storage.googleapis.com/enkellaering-resumes/resumes/rthj_fghj/CV.pdf';


COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration was successful

-- Count records with new Supabase URLs:
SELECT 'quizzes' as table_name, COUNT(*) as supabase_urls FROM quizzes WHERE image_url LIKE '%supabase%';
SELECT 'questions' as table_name, COUNT(*) as supabase_urls FROM questions WHERE image_url LIKE '%supabase%';
SELECT 'about_me_texts' as table_name, COUNT(*) as supabase_urls FROM about_me_texts WHERE image_url LIKE '%supabase%';
SELECT 'job_applications' as table_name, COUNT(*) as supabase_urls FROM job_applications WHERE resumelink LIKE '%supabase%';

-- Count records still using old GCS URLs (should be 0 after migration):
SELECT 'quizzes' as table_name, COUNT(*) as old_gcs_urls FROM quizzes WHERE image_url LIKE '%storage.googleapis.com%';
SELECT 'questions' as table_name, COUNT(*) as old_gcs_urls FROM questions WHERE image_url LIKE '%storage.googleapis.com%';
SELECT 'about_me_texts' as table_name, COUNT(*) as old_gcs_urls FROM about_me_texts WHERE image_url LIKE '%storage.googleapis.com%';
SELECT 'job_applications' as table_name, COUNT(*) as old_gcs_urls FROM job_applications WHERE resumelink LIKE '%storage.googleapis.com%';