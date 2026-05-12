-- HiveActivityPartner — taxonomy seed (Phase 2).
-- 89 canonical activities anchored to apps/hive-activity-partner/locales/en.json
-- "activities" object. Slugs are camelCase to match the locale key 1:1, so the
-- frontend can do `t.activities[slug]` without a slug→key mapping.
--
-- Idempotent via ON CONFLICT (slug) DO NOTHING. Re-running is safe; rows the
-- operator has manually edited (e.g., recategorised) are NOT overwritten.
-- Display name carries the English label; localisation happens at the UI layer
-- via locales/<lang>.json.

INSERT INTO hap_activity_taxonomy (slug, display_name, category, is_active, is_pending_moderation) VALUES
  -- sport (25)
  ('tennis', 'Tennis', 'sport', true, false),
  ('badminton', 'Badminton', 'sport', true, false),
  ('padel', 'Padel', 'sport', true, false),
  ('tableTennis', 'Table tennis', 'sport', true, false),
  ('squash', 'Squash', 'sport', true, false),
  ('basketball', 'Basketball', 'sport', true, false),
  ('football', 'Football (soccer)', 'sport', true, false),
  ('futsal', 'Futsal', 'sport', true, false),
  ('americanFootball', 'American football', 'sport', true, false),
  ('baseball', 'Baseball', 'sport', true, false),
  ('softball', 'Softball', 'sport', true, false),
  ('cricket', 'Cricket', 'sport', true, false),
  ('rugby', 'Rugby', 'sport', true, false),
  ('fieldHockey', 'Field hockey', 'sport', true, false),
  ('iceHockey', 'Ice hockey', 'sport', true, false),
  ('lacrosse', 'Lacrosse', 'sport', true, false),
  ('volleyball', 'Volleyball', 'sport', true, false),
  ('beachVolleyball', 'Beach volleyball', 'sport', true, false),
  ('ultimateFrisbee', 'Ultimate frisbee', 'sport', true, false),
  ('golf', 'Golf', 'sport', true, false),
  ('swimming', 'Swimming', 'sport', true, false),
  ('waterPolo', 'Water polo', 'sport', true, false),
  ('surfing', 'Surfing', 'sport', true, false),
  ('sailing', 'Sailing', 'sport', true, false),
  ('rowing', 'Rowing', 'sport', true, false),

  -- fitness (14)
  ('running', 'Running', 'fitness', true, false),
  ('jogging', 'Jogging', 'fitness', true, false),
  ('gymWorkout', 'Gym workout', 'fitness', true, false),
  ('weightlifting', 'Weightlifting', 'fitness', true, false),
  ('crossfit', 'CrossFit', 'fitness', true, false),
  ('yoga', 'Yoga', 'fitness', true, false),
  ('pilates', 'Pilates', 'fitness', true, false),
  ('climbing', 'Climbing', 'fitness', true, false),
  ('bouldering', 'Bouldering', 'fitness', true, false),
  ('dancing', 'Dancing', 'fitness', true, false),
  ('martialArts', 'Martial arts', 'fitness', true, false),
  ('boxing', 'Boxing', 'fitness', true, false),
  ('mma', 'MMA', 'fitness', true, false),
  ('kickboxing', 'Kickboxing', 'fitness', true, false),

  -- outdoor (13)
  ('walking', 'Walking', 'outdoor', true, false),
  ('hiking', 'Hiking', 'outdoor', true, false),
  ('cycling', 'Cycling', 'outdoor', true, false),
  ('mountainBiking', 'Mountain biking', 'outdoor', true, false),
  ('birdWatching', 'Bird watching', 'outdoor', true, false),
  ('gardening', 'Gardening', 'outdoor', true, false),
  ('fishing', 'Fishing', 'outdoor', true, false),
  ('camping', 'Camping', 'outdoor', true, false),
  ('picnic', 'Picnic', 'outdoor', true, false),
  ('kayaking', 'Kayaking', 'outdoor', true, false),
  ('paddleboarding', 'Paddleboarding', 'outdoor', true, false),
  ('skiing', 'Skiing', 'outdoor', true, false),
  ('snowboarding', 'Snowboarding', 'outdoor', true, false),

  -- creative (18)
  ('lifeDrawing', 'Life drawing', 'creative', true, false),
  ('painting', 'Painting', 'creative', true, false),
  ('sketching', 'Sketching', 'creative', true, false),
  ('photography', 'Photography', 'creative', true, false),
  ('pottery', 'Pottery', 'creative', true, false),
  ('ceramics', 'Ceramics', 'creative', true, false),
  ('knitting', 'Knitting', 'creative', true, false),
  ('crochet', 'Crochet', 'creative', true, false),
  ('sewing', 'Sewing', 'creative', true, false),
  ('woodworking', 'Woodworking', 'creative', true, false),
  ('jewelryMaking', 'Jewelry making', 'creative', true, false),
  ('calligraphy', 'Calligraphy', 'creative', true, false),
  ('songwriting', 'Songwriting', 'creative', true, false),
  ('musicJamming', 'Music jamming', 'creative', true, false),
  ('choir', 'Choir', 'creative', true, false),
  ('bandPractice', 'Band practice', 'creative', true, false),
  ('theater', 'Theater', 'creative', true, false),
  ('improv', 'Improv', 'creative', true, false),

  -- intellectual (11)
  ('chess', 'Chess', 'intellectual', true, false),
  ('go', 'Go', 'intellectual', true, false),
  ('scrabble', 'Scrabble', 'intellectual', true, false),
  ('boardGames', 'Board games', 'intellectual', true, false),
  ('languageExchange', 'Language exchange', 'intellectual', true, false),
  ('studySession', 'Study session', 'intellectual', true, false),
  ('bookClub', 'Book club', 'intellectual', true, false),
  ('philosophyDiscussion', 'Philosophy discussion', 'intellectual', true, false),
  ('debate', 'Debate', 'intellectual', true, false),
  ('pairProgramming', 'Pair programming', 'intellectual', true, false),
  ('trivia', 'Trivia', 'intellectual', true, false),

  -- social (8)
  ('coffeeChat', 'Coffee chat', 'social', true, false),
  ('brunch', 'Brunch', 'social', true, false),
  ('dinner', 'Dinner', 'social', true, false),
  ('movieNight', 'Movie night', 'social', true, false),
  ('museumVisit', 'Museum visit', 'social', true, false),
  ('galleryVisit', 'Gallery visit', 'social', true, false),
  ('concert', 'Concert', 'social', true, false),
  ('gig', 'Gig', 'social', true, false)
ON CONFLICT (slug) DO NOTHING;
