-- Add Georgian translations to existing SKUs and Suppliers
-- Run with: psql -U nika -d buildapp_dev -f scripts/add-georgian-translations.sql

-- Update Suppliers with Georgian names
UPDATE suppliers
SET
  business_name_ka = 'თბილისის ბეტონის ქარხანა შპს',
  about_ka = 'წამყვანი ბეტონის მწარმოებელი თბილისში'
WHERE business_name_en = 'Tbilisi Concrete Plant LLC';

UPDATE suppliers
SET
  business_name_ka = 'კავკასია მასალები შპს',
  about_ka = 'მშენებლობის მასალების ოპტიმალური მიმწოდებელი'
WHERE business_name_en = 'Kavkaz Materials LLC';

UPDATE suppliers
SET
  business_name_ka = 'პროტულსი ქირავდება შპს',
  about_ka = 'პროფესიონალური ინსტრუმენტების გაქირავება'
WHERE business_name_en = 'ProTools Rental LLC';

-- Update SKUs with Georgian translations

-- Concrete M300
UPDATE skus
SET
  name_ka = 'ბეტონი',
  category_ka = 'ბეტონი',
  unit_ka = 'მ³',
  spec_string_ka = 'M300',
  description_ka = 'მაღალი ხარისხის ბეტონი M300 მარკა, შესანიშნავი საძირკვლისა და კონსტრუქციებისთვის'
WHERE name_en = 'Concrete M300';

-- Concrete M400
UPDATE skus
SET
  name_ka = 'ბეტონი',
  category_ka = 'ბეტონი',
  unit_ka = 'მ³',
  spec_string_ka = 'M400',
  description_ka = 'ძლიერი ბეტონი M400 მარკა, იდეალურია მძიმე დატვირთვისთვის'
WHERE name_en = 'Concrete M400';

-- Concrete Blocks 20cm
UPDATE skus
SET
  name_ka = 'ბეტონის ბლოკები',
  category_ka = 'ბლოკები',
  unit_ka = 'ცალი',
  spec_string_ka = '20სმ',
  description_ka = 'ბეტონის ბლოკები 20სმ სისქე, კედლების მშენებლობისთვის'
WHERE name_en = 'Concrete Blocks 20cm';

-- Gravel 5-20mm
UPDATE skus
SET
  name_ka = 'ღორღი',
  category_ka = 'ინერტები',
  unit_ka = 'მ³',
  spec_string_ka = '5-20მმ',
  description_ka = 'ღორღი 5-20მმ ფრაქცია, ბეტონისა და გზის მშენებლობისთვის'
WHERE name_en = 'Gravel 5-20mm';

-- Rebar 12mm
UPDATE skus
SET
  name_ka = 'არმატურა',
  category_ka = 'არმატურა',
  unit_ka = 'ტონა',
  spec_string_ka = '12მმ',
  description_ka = 'ფოლადის არმატურა 12მმ დიამეტრი, ბეტონის გამაგრებისთვის'
WHERE name_en = 'Rebar 12mm';

-- Verify the updates
SELECT
  name_en,
  name_ka,
  category_en,
  category_ka,
  unit_en,
  unit_ka,
  spec_string_en,
  spec_string_ka
FROM skus
ORDER BY name_en;

SELECT
  business_name_en,
  business_name_ka
FROM suppliers
ORDER BY business_name_en;
