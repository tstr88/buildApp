/**
 * Demo Data Seed Script
 * Creates realistic Georgian suppliers, products, and rental equipment
 * Run: npx ts-node scripts/seed-demo-data.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Tbilisi coordinates for realistic depot locations
const tbilisiLocations = [
  { lat: 41.7151, lng: 44.8271, address_ka: 'ვაჟა-ფშაველას გამზირი 71, თბილისი', address_en: 'Vazha-Pshavela Ave 71, Tbilisi' },
  { lat: 41.7280, lng: 44.7920, address_ka: 'კახეთის გზატკეცილი 15, თბილისი', address_en: 'Kakheti Highway 15, Tbilisi' },
  { lat: 41.6940, lng: 44.8015, address_ka: 'გურამიშვილის გამზირი 45, თბილისი', address_en: 'Guramishvili Ave 45, Tbilisi' },
  { lat: 41.7350, lng: 44.7650, address_ka: 'ავჭალის გზატკეცილი 8, თბილისი', address_en: 'Avchala Highway 8, Tbilisi' },
  { lat: 41.7050, lng: 44.8580, address_ka: 'ისანი-სამგორის რაიონი, თბილისი', address_en: 'Isani-Samgori District, Tbilisi' },
  { lat: 41.7420, lng: 44.8100, address_ka: 'დიდუბე-ჩუღურეთი, თბილისი', address_en: 'Didube-Chughureti, Tbilisi' },
  { lat: 41.6890, lng: 44.7450, address_ka: 'რუსთავის გზატკეცილი 32, თბილისი', address_en: 'Rustavi Highway 32, Tbilisi' },
];

interface DemoSupplier {
  phone: string;
  name: string;
  email: string;
  businessName_ka: string;
  businessName_en: string;
  taxId: string;
  location: typeof tbilisiLocations[0];
  categories: string[];
  about_ka: string;
  about_en: string;
}

interface DemoSKU {
  name_ka: string;
  name_en: string;
  specString_ka: string;
  specString_en: string;
  category_ka: string;
  category_en: string;
  unit_ka: string;
  unit_en: string;
  basePrice: number;
  description_ka: string;
  description_en: string;
  minOrder?: number;
}

interface DemoRentalTool {
  name_ka: string;
  name_en: string;
  specString_ka: string;
  specString_en: string;
  category_ka: string;
  category_en: string;
  dayRate: number;
  weekRate: number;
  monthRate: number;
  depositAmount: number;
  description_ka: string;
  description_en: string;
  quantity: number;
}

const demoSuppliers: DemoSupplier[] = [
  {
    phone: '+995555100001',
    name: 'გიორგი მამულაშვილი',
    email: 'tbilisi.concrete@demo.buildapp.ge',
    businessName_ka: 'თბილისის ბეტონის ქარხანა',
    businessName_en: 'Tbilisi Concrete Plant',
    taxId: '401234567',
    location: tbilisiLocations[0],
    categories: ['concrete', 'aggregates'],
    about_ka: 'თბილისის ბეტონის ქარხანა 2005 წლიდან აწარმოებს მაღალხარისხიან ბეტონს. გვაქვს საკუთარი მიქსერის პარკი და ვემსახურებით მთელ თბილისს.',
    about_en: 'Tbilisi Concrete Plant has been producing high-quality concrete since 2005. We have our own mixer fleet and serve all of Tbilisi.',
  },
  {
    phone: '+995555100002',
    name: 'დავით ნადირაძე',
    email: 'kavkaz.metal@demo.buildapp.ge',
    businessName_ka: 'კავკასიის მეტალი',
    businessName_en: 'Kavkaz Metal',
    taxId: '401234568',
    location: tbilisiLocations[1],
    categories: ['steel', 'metals'],
    about_ka: 'კავკასიის მეტალი არის ლიდერი არმატურისა და ლითონის მასალების მომწოდებელი საქართველოში. მარაგში გვაქვს 500+ ტონა პროდუქცია.',
    about_en: 'Kavkaz Metal is a leading supplier of rebar and metal materials in Georgia. We have 500+ tons of products in stock.',
  },
  {
    phone: '+995555100003',
    name: 'ლევან ჯორბენაძე',
    email: 'geo.blocks@demo.buildapp.ge',
    businessName_ka: 'საქართველოს სამშენებლო ბლოკები',
    businessName_en: 'Georgian Building Blocks',
    taxId: '401234569',
    location: tbilisiLocations[2],
    categories: ['blocks', 'bricks', 'masonry'],
    about_ka: 'ვაწარმოებთ და ვაწვდით ყველა ტიპის სამშენებლო ბლოკს: ბეტონის, ცეცხლგამძლე, თერმოიზოლაციურ ბლოკებს.',
    about_en: 'We manufacture and supply all types of construction blocks: concrete, fireproof, and thermal insulation blocks.',
  },
  {
    phone: '+995555100004',
    name: 'ზურაბ ქურდიანი',
    email: 'sand.gravel@demo.buildapp.ge',
    businessName_ka: 'ქვიშა და ხრეში პლუს',
    businessName_en: 'Sand & Gravel Plus',
    taxId: '401234570',
    location: tbilisiLocations[3],
    categories: ['aggregates', 'sand', 'gravel'],
    about_ka: 'ვემსახურებით სამშენებლო ინდუსტრიას 15 წელზე მეტია. გვაქვს საკუთარი კარიერები და უზრუნველვყოფთ მაღალხარისხიან ინერტულ მასალებს.',
    about_en: 'We have been serving the construction industry for over 15 years. We have our own quarries and provide high-quality aggregate materials.',
  },
  {
    phone: '+995555100005',
    name: 'ნიკა გიორგაძე',
    email: 'cement.house@demo.buildapp.ge',
    businessName_ka: 'ცემენტის სახლი',
    businessName_en: 'Cement House',
    taxId: '401234571',
    location: tbilisiLocations[4],
    categories: ['cement', 'dry_mixes', 'plaster'],
    about_ka: 'ოფიციალური დისტრიბუტორი: Heidelberg Cement, Knauf, Caparol. გვაქვს სრული ასორტიმენტი მშრალი ნარევებისა და ცემენტის.',
    about_en: 'Official distributor of Heidelberg Cement, Knauf, Caparol. We have a full range of dry mixes and cement.',
  },
  {
    phone: '+995555100006',
    name: 'თემურ ბოლქვაძე',
    email: 'heavy.rental@demo.buildapp.ge',
    businessName_ka: 'სამშენებლო ტექნიკის გაქირავება',
    businessName_en: 'Heavy Equipment Rental',
    taxId: '401234572',
    location: tbilisiLocations[5],
    categories: ['rental_equipment', 'heavy_machinery'],
    about_ka: 'ვაქირავებთ ექსკავატორებს, ბულდოზერებს, კრანებს და სხვა მძიმე ტექნიკას. მექანიკოსთა ბრიგადა 24/7.',
    about_en: 'We rent excavators, bulldozers, cranes and other heavy equipment. 24/7 mechanic team available.',
  },
  {
    phone: '+995555100007',
    name: 'გია ხარაბაძე',
    email: 'protools@demo.buildapp.ge',
    businessName_ka: 'პროფი იარაღები',
    businessName_en: 'Pro Tools Rental',
    taxId: '401234573',
    location: tbilisiLocations[6],
    categories: ['rental_tools', 'power_tools'],
    about_ka: 'ვაქირავებთ პროფესიონალურ სამშენებლო იარაღებს: Hilti, Bosch, Makita. ტექნიკური მომსახურება და ინსტრუქტაჟი უფასოა.',
    about_en: 'We rent professional construction tools: Hilti, Bosch, Makita. Free technical service and training.',
  },
];

const skusBySupplier: Record<string, DemoSKU[]> = {
  '+995555100001': [
    { name_ka: 'ბეტონი M200', name_en: 'Concrete M200', specString_ka: 'B15, მოცურება 16-20 სმ', specString_en: 'B15, slump 16-20 cm', category_ka: 'ბეტონი', category_en: 'Concrete', unit_ka: 'მ³', unit_en: 'm³', basePrice: 165, description_ka: 'სტანდარტული ბეტონი საძირკვლებისა და იატაკისთვის', description_en: 'Standard concrete for foundations and floors', minOrder: 2 },
    { name_ka: 'ბეტონი M250', name_en: 'Concrete M250', specString_ka: 'B20, მოცურება 16-20 სმ', specString_en: 'B20, slump 16-20 cm', category_ka: 'ბეტონი', category_en: 'Concrete', unit_ka: 'მ³', unit_en: 'm³', basePrice: 180, description_ka: 'გაძლიერებული ბეტონი მონოლითური მშენებლობისთვის', description_en: 'Reinforced concrete for monolithic construction', minOrder: 2 },
    { name_ka: 'ბეტონი M300', name_en: 'Concrete M300', specString_ka: 'B22.5, მოცურება 16-20 სმ', specString_en: 'B22.5, slump 16-20 cm', category_ka: 'ბეტონი', category_en: 'Concrete', unit_ka: 'მ³', unit_en: 'm³', basePrice: 195, description_ka: 'მაღალი კლასის ბეტონი სვეტებისა და გადახურვისთვის', description_en: 'High-class concrete for columns and slabs', minOrder: 2 },
    { name_ka: 'ბეტონი M350', name_en: 'Concrete M350', specString_ka: 'B25, მოცურება 18-22 სმ', specString_en: 'B25, slump 18-22 cm', category_ka: 'ბეტონი', category_en: 'Concrete', unit_ka: 'მ³', unit_en: 'm³', basePrice: 215, description_ka: 'პრემიუმ ბეტონი დიდი დატვირთვის კონსტრუქციებისთვის', description_en: 'Premium concrete for heavy load structures', minOrder: 2 },
    { name_ka: 'ხრეში 5-20 მმ', name_en: 'Gravel 5-20mm', specString_ka: 'გარეცხილი, გრანიტი', specString_en: 'Washed, granite', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 55, description_ka: 'ბეტონის მომზადებისა და დრენაჟისთვის', description_en: 'For concrete mixing and drainage', minOrder: 5 },
    { name_ka: 'ხრეში 20-40 მმ', name_en: 'Gravel 20-40mm', specString_ka: 'გარეცხილი, გრანიტი', specString_en: 'Washed, granite', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 50, description_ka: 'ფუნდამენტის მომზადებისა და გზების მოწყობისთვის', description_en: 'For foundation preparation and road construction', minOrder: 5 },
    { name_ka: 'ქვიშა მდინარის', name_en: 'River Sand', specString_ka: 'გარეცხილი, 0-5 მმ', specString_en: 'Washed, 0-5mm', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 35, description_ka: 'ბეტონის ნარევისა და კედლების წყობისთვის', description_en: 'For concrete mix and wall construction', minOrder: 3 },
  ],
  '+995555100002': [
    { name_ka: 'არმატურა Ø8 მმ', name_en: 'Rebar Ø8mm', specString_ka: 'A500C, L=11.7 მ', specString_en: 'A500C, L=11.7m', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1150, description_ka: 'კოროზიამედეგი არმატურა ბეტონის კონსტრუქციებისთვის', description_en: 'Corrosion-resistant rebar for concrete structures', minOrder: 0.5 },
    { name_ka: 'არმატურა Ø10 მმ', name_en: 'Rebar Ø10mm', specString_ka: 'A500C, L=11.7 მ', specString_en: 'A500C, L=11.7m', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1120, description_ka: 'უნივერსალური არმატურა ყველა ტიპის სამუშაოსთვის', description_en: 'Universal rebar for all types of work', minOrder: 0.5 },
    { name_ka: 'არმატურა Ø12 მმ', name_en: 'Rebar Ø12mm', specString_ka: 'A500C, L=11.7 მ', specString_en: 'A500C, L=11.7m', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1100, description_ka: 'საძირკვლისა და გადახურვის არმატურა', description_en: 'Foundation and slab rebar', minOrder: 0.5 },
    { name_ka: 'არმატურა Ø14 მმ', name_en: 'Rebar Ø14mm', specString_ka: 'A500C, L=11.7 მ', specString_en: 'A500C, L=11.7m', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1080, description_ka: 'მძიმე კონსტრუქციების არმატურა', description_en: 'Heavy construction rebar', minOrder: 1 },
    { name_ka: 'არმატურა Ø16 მმ', name_en: 'Rebar Ø16mm', specString_ka: 'A500C, L=11.7 მ', specString_en: 'A500C, L=11.7m', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1050, description_ka: 'სამრეწველო მშენებლობის არმატურა', description_en: 'Industrial construction rebar', minOrder: 1 },
    { name_ka: 'პროფილი 60x60x3 მმ', name_en: 'Profile 60x60x3mm', specString_ka: 'კვადრატული, S235', specString_en: 'Square, S235', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1350, description_ka: 'კარკასული მშენებლობისთვის', description_en: 'For frame construction', minOrder: 0.3 },
    { name_ka: 'ლისტი 2 მმ', name_en: 'Sheet 2mm', specString_ka: 'S235, 1250x2500 მმ', specString_en: 'S235, 1250x2500mm', category_ka: 'ფოლადი', category_en: 'Steel', unit_ka: 'ტონა', unit_en: 'ton', basePrice: 1420, description_ka: 'ზოგადი დანიშნულების ფურცელი', description_en: 'General purpose sheet', minOrder: 0.2 },
  ],
  '+995555100003': [
    { name_ka: 'ბეტონის ბლოკი 20x20x40', name_en: 'Concrete Block 20x20x40', specString_ka: 'M100, სრული', specString_en: 'M100, full', category_ka: 'ბლოკები', category_en: 'Blocks', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 1.80, description_ka: 'სტანდარტული კედლის ბლოკი', description_en: 'Standard wall block', minOrder: 100 },
    { name_ka: 'ბეტონის ბლოკი 10x20x40', name_en: 'Concrete Block 10x20x40', specString_ka: 'M100, ნახევარი', specString_en: 'M100, half', category_ka: 'ბლოკები', category_en: 'Blocks', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 1.20, description_ka: 'შიდა ტიხრებისთვის', description_en: 'For interior partitions', minOrder: 100 },
    { name_ka: 'თერმობლოკი 30x20x60', name_en: 'Thermoblock 30x20x60', specString_ka: 'D500, ავტოკლავური', specString_en: 'D500, autoclaved', category_ka: 'ბლოკები', category_en: 'Blocks', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 4.50, description_ka: 'თბოსაიზოლაციო ბლოკი', description_en: 'Thermal insulation block', minOrder: 50 },
    { name_ka: 'აგური თიხის M100', name_en: 'Clay Brick M100', specString_ka: '250x120x65 მმ, წითელი', specString_en: '250x120x65mm, red', category_ka: 'აგური', category_en: 'Bricks', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 0.45, description_ka: 'კლასიკური თიხის აგური', description_en: 'Classic clay brick', minOrder: 500 },
    { name_ka: 'აგური თიხის M125', name_en: 'Clay Brick M125', specString_ka: '250x120x65 მმ, წითელი', specString_en: '250x120x65mm, red', category_ka: 'აგური', category_en: 'Bricks', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 0.55, description_ka: 'გაძლიერებული აგური', description_en: 'Reinforced brick', minOrder: 500 },
    { name_ka: 'აგური ცეცხლგამძლე ШБ-5', name_en: 'Firebrick ShB-5', specString_ka: '230x114x65 მმ', specString_en: '230x114x65mm', category_ka: 'აგური', category_en: 'Bricks', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 2.20, description_ka: 'ბუხრისა და ღუმელისთვის', description_en: 'For fireplaces and furnaces', minOrder: 100 },
  ],
  '+995555100004': [
    { name_ka: 'ქვიშა მშენებლობის', name_en: 'Construction Sand', specString_ka: 'კარიერის, 0-5 მმ', specString_en: 'Quarry, 0-5mm', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 28, description_ka: 'ზოგადი სამშენებლო სამუშაოებისთვის', description_en: 'For general construction work', minOrder: 5 },
    { name_ka: 'ქვიშა გარეცხილი', name_en: 'Washed Sand', specString_ka: 'მდინარის, 0-3 მმ', specString_en: 'River, 0-3mm', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 42, description_ka: 'ბეტონის ნარევისა და ლესვისთვის', description_en: 'For concrete mix and plastering', minOrder: 3 },
    { name_ka: 'ხრეში 5-10 მმ', name_en: 'Gravel 5-10mm', specString_ka: 'გრანიტი, გარეცხილი', specString_en: 'Granite, washed', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 58, description_ka: 'ბეტონის ნარევისთვის', description_en: 'For concrete mix', minOrder: 5 },
    { name_ka: 'ხრეში 10-20 მმ', name_en: 'Gravel 10-20mm', specString_ka: 'გრანიტი, გარეცხილი', specString_en: 'Granite, washed', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 52, description_ka: 'ფუნდამენტისა და ბეტონისთვის', description_en: 'For foundations and concrete', minOrder: 5 },
    { name_ka: 'ხრეში 20-40 მმ', name_en: 'Gravel 20-40mm', specString_ka: 'გრანიტი', specString_en: 'Granite', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 48, description_ka: 'დრენაჟისა და გზებისთვის', description_en: 'For drainage and roads', minOrder: 5 },
    { name_ka: 'ბუტის ქვა', name_en: 'Rubble Stone', specString_ka: 'ნატურალური, 150-300 მმ', specString_en: 'Natural, 150-300mm', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 38, description_ka: 'საყრდენი კედლებისთვის', description_en: 'For retaining walls', minOrder: 10 },
    { name_ka: 'მიწა შავი', name_en: 'Black Soil', specString_ka: 'ნოყიერი', specString_en: 'Fertile', category_ka: 'ინერტული', category_en: 'Aggregates', unit_ka: 'მ³', unit_en: 'm³', basePrice: 25, description_ka: 'გამწვანებისა და ბაღისთვის', description_en: 'For landscaping and gardening', minOrder: 3 },
  ],
  '+995555100005': [
    { name_ka: 'ცემენტი M400', name_en: 'Cement M400', specString_ka: 'CEM I 32.5R, 50 კგ', specString_en: 'CEM I 32.5R, 50kg', category_ka: 'ცემენტი', category_en: 'Cement', unit_ka: 'ტომარა', unit_en: 'bag', basePrice: 16, description_ka: 'უნივერსალური პორტლანდცემენტი', description_en: 'Universal Portland cement', minOrder: 20 },
    { name_ka: 'ცემენტი M500', name_en: 'Cement M500', specString_ka: 'CEM I 42.5N, 50 კგ', specString_en: 'CEM I 42.5N, 50kg', category_ka: 'ცემენტი', category_en: 'Cement', unit_ka: 'ტომარა', unit_en: 'bag', basePrice: 18, description_ka: 'მაღალი ხარისხის ცემენტი', description_en: 'High quality cement', minOrder: 20 },
    { name_ka: 'Knauf Rotband', name_en: 'Knauf Rotband', specString_ka: 'თაბაშირის ლესვა, 30 კგ', specString_en: 'Gypsum plaster, 30kg', category_ka: 'ლესვა', category_en: 'Plaster', unit_ka: 'ტომარა', unit_en: 'bag', basePrice: 32, description_ka: 'შიდა კედლების ლესვა', description_en: 'Interior wall plastering', minOrder: 10 },
    { name_ka: 'Knauf MP-75', name_en: 'Knauf MP-75', specString_ka: 'მანქანური ლესვა, 30 კგ', specString_en: 'Machine plaster, 30kg', category_ka: 'ლესვა', category_en: 'Plaster', unit_ka: 'ტომარა', unit_en: 'bag', basePrice: 28, description_ka: 'მანქანური წესით ლესვისთვის', description_en: 'For machine plastering', minOrder: 20 },
    { name_ka: 'იატაკის ნარევი', name_en: 'Floor Mix', specString_ka: 'თვითსწორებადი, 25 კგ', specString_en: 'Self-leveling, 25kg', category_ka: 'მშრალი ნარევი', category_en: 'Dry Mix', unit_ka: 'ტომარა', unit_en: 'bag', basePrice: 22, description_ka: 'თვითსწორებადი იატაკი 5-50 მმ', description_en: 'Self-leveling floor 5-50mm', minOrder: 20 },
    { name_ka: 'კედლის წებო', name_en: 'Tile Adhesive', specString_ka: 'C2TE, 25 კგ', specString_en: 'C2TE, 25kg', category_ka: 'მშრალი ნარევი', category_en: 'Dry Mix', unit_ka: 'ტომარა', unit_en: 'bag', basePrice: 18, description_ka: 'კერამიკული ფილებისთვის', description_en: 'For ceramic tiles', minOrder: 20 },
    { name_ka: 'გრუნტი Ceresit CT-17', name_en: 'Primer Ceresit CT-17', specString_ka: 'კონცენტრატი, 10 ლ', specString_en: 'Concentrate, 10L', category_ka: 'გრუნტი', category_en: 'Primer', unit_ka: 'ცალი', unit_en: 'pcs', basePrice: 35, description_ka: 'ღრმად შეღწევადი გრუნტი', description_en: 'Deep penetrating primer', minOrder: 5 },
  ],
};

const rentalToolsBySupplier: Record<string, DemoRentalTool[]> = {
  '+995555100006': [
    { name_ka: 'ექსკავატორი JCB 3CX', name_en: 'Excavator JCB 3CX', specString_ka: '4 ტონა, დიზელი', specString_en: '4 ton, diesel', category_ka: 'ექსკავატორი', category_en: 'Excavator', dayRate: 450, weekRate: 2700, monthRate: 9000, depositAmount: 2000, description_ka: 'უნივერსალური ექსკავატორ-დამტვირთველი მიწის სამუშაოებისთვის', description_en: 'Universal excavator-loader for earthworks', quantity: 2 },
    { name_ka: 'მინი ექსკავატორი Kubota', name_en: 'Mini Excavator Kubota', specString_ka: '1.8 ტონა, დიზელი', specString_en: '1.8 ton, diesel', category_ka: 'ექსკავატორი', category_en: 'Excavator', dayRate: 280, weekRate: 1680, monthRate: 5600, depositAmount: 1500, description_ka: 'კომპაქტური ექსკავატორი ვიწრო სივრცეებისთვის', description_en: 'Compact excavator for tight spaces', quantity: 3 },
    { name_ka: 'ფრონტალური დამტვირთველი', name_en: 'Front Loader', specString_ka: 'Volvo L60, 6 ტონა', specString_en: 'Volvo L60, 6 ton', category_ka: 'დამტვირთველი', category_en: 'Loader', dayRate: 500, weekRate: 3000, monthRate: 10000, depositAmount: 3000, description_ka: 'ინერტული მასალების დატვირთვა და ტრანსპორტირება', description_en: 'Aggregate loading and transportation', quantity: 2 },
    { name_ka: 'ავტოკრანი 25 ტონა', name_en: 'Mobile Crane 25 ton', specString_ka: 'Liebherr LTM 1025', specString_en: 'Liebherr LTM 1025', category_ka: 'კრანი', category_en: 'Crane', dayRate: 1200, weekRate: 7200, monthRate: 24000, depositAmount: 8000, description_ka: 'მობილური კრანი სამშენებლო სამუშაოებისთვის', description_en: 'Mobile crane for construction works', quantity: 1 },
    { name_ka: 'ბეტონის ტუმბო', name_en: 'Concrete Pump', specString_ka: 'Putzmeister, 36 მ', specString_en: 'Putzmeister, 36m', category_ka: 'ბეტონის ტექნიკა', category_en: 'Concrete Equipment', dayRate: 600, weekRate: 3600, monthRate: 12000, depositAmount: 4000, description_ka: 'ბეტონის ჩასხმა სიმაღლეზე და მანძილზე', description_en: 'Concrete pumping at height and distance', quantity: 2 },
    { name_ka: 'თვითმცლელი KAMAZ', name_en: 'Dump Truck KAMAZ', specString_ka: '20 მ³, 6x4', specString_en: '20 m³, 6x4', category_ka: 'სატვირთო', category_en: 'Truck', dayRate: 350, weekRate: 2100, monthRate: 7000, depositAmount: 2000, description_ka: 'ინერტული მასალების გადატანა', description_en: 'Aggregate material transport', quantity: 3 },
    { name_ka: 'ვიბროტკეპნა', name_en: 'Vibratory Roller', specString_ka: 'Bomag BW 120, 1.5 ტონა', specString_en: 'Bomag BW 120, 1.5 ton', category_ka: 'ტკეპნა', category_en: 'Compactor', dayRate: 180, weekRate: 1080, monthRate: 3600, depositAmount: 1000, description_ka: 'მიწის და ასფალტის ტკეპნა', description_en: 'Soil and asphalt compaction', quantity: 2 },
    { name_ka: 'მობილური გენერატორი 100 kVA', name_en: 'Mobile Generator 100 kVA', specString_ka: 'დიზელი, Atlas Copco', specString_en: 'Diesel, Atlas Copco', category_ka: 'გენერატორი', category_en: 'Generator', dayRate: 250, weekRate: 1500, monthRate: 5000, depositAmount: 2000, description_ka: 'ელექტროენერგიის წყარო სამშენებლო მოედანზე', description_en: 'Power source for construction site', quantity: 3 },
  ],
  '+995555100007': [
    { name_ka: 'ბეტონის შემრევი 180 ლ', name_en: 'Concrete Mixer 180L', specString_ka: 'ელექტრო, 1.5 კვტ', specString_en: 'Electric, 1.5 kW', category_ka: 'შემრევი', category_en: 'Mixer', dayRate: 35, weekRate: 180, monthRate: 500, depositAmount: 200, description_ka: 'მცირე მოცულობის ბეტონის მომზადება', description_en: 'Small volume concrete preparation', quantity: 5 },
    { name_ka: 'ბეტონის ვიბრატორი', name_en: 'Concrete Vibrator', specString_ka: 'Wacker, 45 მმ', specString_en: 'Wacker, 45mm', category_ka: 'ვიბრატორი', category_en: 'Vibrator', dayRate: 25, weekRate: 130, monthRate: 400, depositAmount: 150, description_ka: 'ბეტონის დატკეპნა და ჰაერის გამოდევნა', description_en: 'Concrete compaction and air removal', quantity: 8 },
    { name_ka: 'პერფორატორი Hilti TE-70', name_en: 'Rotary Hammer Hilti TE-70', specString_ka: '1600 ვტ, SDS-Max', specString_en: '1600W, SDS-Max', category_ka: 'პერფორატორი', category_en: 'Hammer Drill', dayRate: 40, weekRate: 200, monthRate: 600, depositAmount: 300, description_ka: 'მძიმე ბურღვა და დაშლა', description_en: 'Heavy drilling and demolition', quantity: 6 },
    { name_ka: 'პერფორატორი Hilti TE-30', name_en: 'Rotary Hammer Hilti TE-30', specString_ka: '850 ვტ, SDS-Plus', specString_en: '850W, SDS-Plus', category_ka: 'პერფორატორი', category_en: 'Hammer Drill', dayRate: 25, weekRate: 130, monthRate: 400, depositAmount: 200, description_ka: 'საშუალო სიმძლავრის პერფორატორი', description_en: 'Medium power rotary hammer', quantity: 10 },
    { name_ka: 'დემონტაჟის ჩაქუჩი', name_en: 'Demolition Hammer', specString_ka: 'Bosch GSH 16-30, 1750 ვტ', specString_en: 'Bosch GSH 16-30, 1750W', category_ka: 'დემონტაჟი', category_en: 'Demolition', dayRate: 55, weekRate: 280, monthRate: 850, depositAmount: 400, description_ka: 'ბეტონის და ასფალტის დაშლა', description_en: 'Concrete and asphalt demolition', quantity: 4 },
    { name_ka: 'კუთხსახეხი 230 მმ', name_en: 'Angle Grinder 230mm', specString_ka: 'Makita GA9020, 2200 ვტ', specString_en: 'Makita GA9020, 2200W', category_ka: 'სახეხი', category_en: 'Grinder', dayRate: 20, weekRate: 100, monthRate: 300, depositAmount: 100, description_ka: 'ლითონის და ქვის ჭრა', description_en: 'Metal and stone cutting', quantity: 12 },
    { name_ka: 'ჯაჭვის ხერხი Stihl MS-362', name_en: 'Chainsaw Stihl MS-362', specString_ka: 'ბენზინი, 45 სმ', specString_en: 'Petrol, 45cm', category_ka: 'ხერხი', category_en: 'Saw', dayRate: 35, weekRate: 180, monthRate: 550, depositAmount: 250, description_ka: 'ხეების და ძელების ჭრა', description_en: 'Tree and timber cutting', quantity: 5 },
    { name_ka: 'ლაზერული ნიველირი', name_en: 'Laser Level', specString_ka: 'Bosch GRL 300 HV', specString_en: 'Bosch GRL 300 HV', category_ka: 'ნიველირი', category_en: 'Level', dayRate: 45, weekRate: 230, monthRate: 700, depositAmount: 500, description_ka: 'ჰორიზონტის და ვერტიკალის განსაზღვრა', description_en: 'Horizontal and vertical alignment', quantity: 4 },
    { name_ka: 'სკაფოლდინგი 20 მ²', name_en: 'Scaffolding 20 m²', specString_ka: 'ფოლადის, მოდულური', specString_en: 'Steel, modular', category_ka: 'სკაფოლდინგი', category_en: 'Scaffolding', dayRate: 80, weekRate: 400, monthRate: 1200, depositAmount: 500, description_ka: 'ფასადის და შიდა სამუშაოებისთვის', description_en: 'For facade and interior works', quantity: 5 },
    { name_ka: 'შედუღების აპარატი MIG', name_en: 'MIG Welder', specString_ka: 'Lincoln 350A', specString_en: 'Lincoln 350A', category_ka: 'შედუღება', category_en: 'Welding', dayRate: 50, weekRate: 250, monthRate: 750, depositAmount: 400, description_ka: 'ლითონის შედუღება', description_en: 'Metal welding', quantity: 4 },
    { name_ka: 'მაღალწნევიანი სარეცხი', name_en: 'Pressure Washer', specString_ka: 'Karcher HD 9/20, 200 ბარი', specString_en: 'Karcher HD 9/20, 200 bar', category_ka: 'სარეცხი', category_en: 'Cleaner', dayRate: 40, weekRate: 200, monthRate: 600, depositAmount: 200, description_ka: 'ზედაპირების გაწმენდა', description_en: 'Surface cleaning', quantity: 6 },
  ],
};

async function seedDemoData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding demo data...\n');
    await client.query('BEGIN');

    const supplierIds: Record<string, string> = {};

    console.log('📦 Creating demo suppliers...');
    for (const supplier of demoSuppliers) {
      const existingUser = await client.query('SELECT id FROM users WHERE phone = $1', [supplier.phone]);
      let userId: string;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        console.log(`  ⏭️  User exists: ${supplier.name}`);
      } else {
        const userResult = await client.query(
          `INSERT INTO users (phone, name, email, user_type, is_verified, language) VALUES ($1, $2, $3, 'supplier', true, 'ka') RETURNING id`,
          [supplier.phone, supplier.name, supplier.email]
        );
        userId = userResult.rows[0].id;
        console.log(`  ✓ Created user: ${supplier.name}`);
      }

      const existingSupplier = await client.query('SELECT id FROM suppliers WHERE user_id = $1', [userId]);
      if (existingSupplier.rows.length > 0) {
        supplierIds[supplier.phone] = existingSupplier.rows[0].id;
        console.log(`  ⏭️  Supplier exists: ${supplier.businessName_en}`);
      } else {
        const supplierResult = await client.query(
          `INSERT INTO suppliers (user_id, business_name_ka, business_name_en, tax_id, depot_latitude, depot_longitude, depot_address, is_verified, categories, about_ka, about_en, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10, true) RETURNING id`,
          [userId, supplier.businessName_ka, supplier.businessName_en, supplier.taxId, supplier.location.lat, supplier.location.lng, supplier.location.address_ka, supplier.categories, supplier.about_ka, supplier.about_en]
        );
        supplierIds[supplier.phone] = supplierResult.rows[0].id;
        console.log(`  ✓ Created supplier: ${supplier.businessName_en}`);
      }
    }

    console.log('\n📋 Creating product SKUs...');
    for (const [phone, skus] of Object.entries(skusBySupplier)) {
      const supplierId = supplierIds[phone];
      if (!supplierId) continue;

      for (const sku of skus) {
        const existingSku = await client.query('SELECT id FROM skus WHERE supplier_id = $1 AND name_en = $2', [supplierId, sku.name_en]);
        if (existingSku.rows.length > 0) {
          console.log(`  ⏭️  SKU exists: ${sku.name_en}`);
          continue;
        }

        await client.query(
          `INSERT INTO skus (supplier_id, name_ka, name_en, spec_string_ka, spec_string_en, category_ka, category_en, unit_ka, unit_en, base_price, description_ka, description_en, min_order_quantity, direct_order_available, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, true)`,
          [supplierId, sku.name_ka, sku.name_en, sku.specString_ka, sku.specString_en, sku.category_ka, sku.category_en, sku.unit_ka, sku.unit_en, sku.basePrice, sku.description_ka, sku.description_en, sku.minOrder || null]
        );
        console.log(`  ✓ Created SKU: ${sku.name_en} - ₾${sku.basePrice}/${sku.unit_en}`);
      }
    }

    console.log('\n🔧 Creating rental equipment...');
    for (const [phone, tools] of Object.entries(rentalToolsBySupplier)) {
      const supplierId = supplierIds[phone];
      if (!supplierId) continue;

      for (const tool of tools) {
        const existingTool = await client.query('SELECT id FROM rental_tools WHERE supplier_id = $1 AND name_en = $2', [supplierId, tool.name_en]);
        if (existingTool.rows.length > 0) {
          console.log(`  ⏭️  Tool exists: ${tool.name_en}`);
          continue;
        }

        await client.query(
          `INSERT INTO rental_tools (supplier_id, name_ka, name_en, spec_string_ka, spec_string_en, category_ka, category_en, day_rate, week_rate, month_rate, deposit_amount, description_ka, description_en, quantity_available, direct_booking_available, is_available, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, true, true)`,
          [supplierId, tool.name_ka, tool.name_en, tool.specString_ka, tool.specString_en, tool.category_ka, tool.category_en, tool.dayRate, tool.weekRate, tool.monthRate, tool.depositAmount, tool.description_ka, tool.description_en, tool.quantity]
        );
        console.log(`  ✓ Created rental: ${tool.name_en} - ₾${tool.dayRate}/day`);
      }
    }

    await client.query('COMMIT');
    console.log('\n====================================');
    console.log('✅ Demo data seeded successfully!');
    console.log('====================================\n');
    console.log('Demo Suppliers (OTP: 123456):');
    for (const supplier of demoSuppliers) {
      console.log(`  ${supplier.phone} - ${supplier.businessName_en}`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoData().catch(console.error);
