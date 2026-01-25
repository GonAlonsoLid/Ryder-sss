-- Añadir campo bio a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- ================================
-- PIMENTONAS (Equipo de Yago - Capitán)
-- ================================

-- Yago (Capitán)
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Yago&background=dc2626&color=fff&size=128&bold=true',
  bio = 'Capitán de Pimentonas. El estratega del equipo, siempre con un plan B... y un plan C.'
WHERE display_name = 'Yago';

-- Marcos
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Marcos&background=dc2626&color=fff&size=128&bold=true',
  bio = 'El más consistente del grupo. Su swing es tan predecible como su pedido en el bar.'
WHERE display_name = 'Marcos';

-- Enrique
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Enrique&background=dc2626&color=fff&size=128&bold=true',
  bio = 'El crack del equipo con handicap 14. Dicen que nació con un putter en la mano.'
WHERE display_name = 'Enrique';

-- Semmler
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Semmler&background=dc2626&color=fff&size=128&bold=true',
  bio = 'Especialista en recuperaciones milagrosas. El bunker es su segunda casa.'
WHERE display_name = 'Semmler';

-- Gonzi
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Gonzi&background=dc2626&color=fff&size=128&bold=true',
  bio = 'El arquitecto de la app. Mejor programando que en el approach, pero lo intenta.'
WHERE display_name = 'Gonzi';

-- ================================
-- TABAQUERAS (Equipo de Jorge - Capitán)
-- ================================

-- Jorge (Capitán)
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Jorge&background=2563eb&color=fff&size=128&bold=true',
  bio = 'Capitán de Tabaqueras. Lidera con el ejemplo... sobre todo en el bar del hoyo 9.'
WHERE display_name = 'Jorge';

-- Miguel
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Miguel&background=2563eb&color=fff&size=128&bold=true',
  bio = 'El filósofo del golf. Cada golpe es una reflexión sobre la vida y el universo.'
WHERE display_name = 'Miguel';

-- Pedro
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Pedro&background=2563eb&color=fff&size=128&bold=true',
  bio = 'Handicap 14 y mucha ambición. El rival a batir en cualquier apuesta.'
WHERE display_name = 'Pedro';

-- Sebas
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Sebas&background=2563eb&color=fff&size=128&bold=true',
  bio = 'El más tranquilo del grupo. Su calma en el green es legendaria.'
WHERE display_name = 'Sebas';

-- Felipe
UPDATE profiles SET 
  avatar_url = 'https://ui-avatars.com/api/?name=Felipe&background=2563eb&color=fff&size=128&bold=true',
  bio = 'Potencia bruta en el tee. A veces la bola va donde él quiere.'
WHERE display_name = 'Felipe';

-- Verificar
SELECT display_name, avatar_url, bio, handicap FROM profiles ORDER BY team_id, display_name;
