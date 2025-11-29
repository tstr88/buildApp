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
  { lat: 41.7151, lng: 44.8271, address: 'ვაჟა-ფშაველას გამზირი 71, თბილისი' },
  { lat: 41.7280, lng: 44.7920, address: 'კახეთის გზატკეცილი 15, თბილისი' },
  { lat: 41.6940, lng: 44.8015, address: 'გურამიშვილის გამზირი 45, თბილისი' },
  { lat: 41.7350, lng: 44.7650, address: 'ავჭალის გზატკეცილი 8, თბილისი' },
  { lat: 41.7050, lng: 44.8580, address: 'ისანი-სამგორის რაიონი, თბილისი' },
  { lat: 41.7420, lng: 44.8100, address: 'დიდუბე-ჩუღურეთი, თბილისი' },
  { lat: 41.6890, lng: 44.7450, address: 'რუსთავის გზატკეცილი 32, თბილისი' },
];

interface DemoSupplier {
  phone: string;
  name: string;
  email: string;
  businessName: string;
  taxId: string;
  location: typeof tbilisiLocations[0];
  categories: string[];
  about: string;
}

interface DemoSKU {
  name: string;
  specString: string;
  category: string;
  unit: string;
  basePrice: number;
  description: string;
  minOrder?: number;
  maxOrder?: number;
}

interface DemoRentalTool {
  name: string;
  specString: string;
  category: string;
  dayRate: number;
  weekRate: number;
  monthRate: number;
  depositAmount: number;
  description: string;
  quantity: number;
}

const demoSuppliers: DemoSupplier[] = [
  // 1. Concrete & Aggregates Supplier
  {
    phone: '+995555100001',
    name: 'გიორგი მამულაშვილი',
    businessName: 'თბილისის ბეტონის ქარხანა',
    taxId: '401234567',
    location: tbilisiLocations[0],
    categories: ['concrete', 'aggregates'],
    about: 'თბილისის ბეტონის ქარხანა 2005 წლიდან აწარმოებს მაღალხარისხიან ბეტონს. გვაქვს საკუთარი მიქსერის პარკი და ვემსახურებით მთელ თბილისს.',
    email: 'tbilisi.concrete@demo.buildapp.ge',
  },
  // 2. Steel & Metal Supplier
  {
    phone: '+995555100002',
    name: 'დავით ნადირაძე',
    businessName: 'კავკასიის მეტალი',
    taxId: '401234568',
    location: tbilisiLocations[1],
    categories: ['steel', 'metals'],
    about: 'კავკასიის მეტალი არის ლიდერი არმატურისა და ლითონის მასალების მომწოდებელი საქართველოში. მარაგში გვაქვს 500+ ტონა პროდუქცია.',
    email: 'kavkaz.metal@demo.buildapp.ge',
  },
  // 3. Blocks & Bricks Supplier
  {
    phone: '+995555100003',
    name: 'ლევან ჯორბენაძე',
    businessName: 'საქართველოს სამშენებლო ბლოკები',
    taxId: '401234569',
    location: tbilisiLocations[2],
    categories: ['blocks', 'bricks', 'masonry'],
    about: 'ვაწარმოებთ და ვაწვდით ყველა ტიპის სამშენებლო ბლოკს: ბეტონის, ცეცხლგამძლე, თერმოიზოლაციურ ბლოკებს.',
    email: 'geo.blocks@demo.buildapp.ge',
  },
  // 4. Sand & Gravel Supplier
  {
    phone: '+995555100004',
    name: 'ზურაბ ქურდიანი',
    businessName: 'ქვიშა და ხრეში პლუს',
    taxId: '401234570',
    location: tbilisiLocations[3],
    categories: ['aggregates', 'sand', 'gravel'],
    about: 'ვემსახურებით სამშენებლო ინდუსტრიას 15 წელზე მეტია. გვაქვს საკუთარი კარიერები და უზრუნველვყოფთ მაღალხარისხიან ინერტულ მასალებს.',
    email: 'sand.gravel@demo.buildapp.ge',
  },
  // 5. Cement & Dry Mixes Supplier
  {
    phone: '+995555100005',
    name: 'ნიკა გიორგაძე',
    businessName: 'ცემენტის სახლი',
    taxId: '401234571',
    location: tbilisiLocations[4],
    categories: ['cement', 'dry_mixes', 'plaster'],
    about: 'ოფიციალური დისტრიბუტორი: Heidelberg Cement, Knauf, Caparol. გვაქვს სრული ასორტიმენტი მშრალი ნარევებისა და ცემენტის.',
    email: 'cement.house@demo.buildapp.ge',
  },
  // 6. Equipment Rental - Heavy
  {
    phone: '+995555100006',
    name: 'თემურ ბოლქვაძე',
    businessName: 'სამშენებლო ტექნიკის გაქირავება',
    taxId: '401234572',
    location: tbilisiLocations[5],
    categories: ['rental_equipment', 'heavy_machinery'],
    about: 'ვაქირავებთ ექსკავატორებს, ბულდოზერებს, კრანებს და სხვა მძიმე ტექნიკას. მექანიკოსთა ბრიგადა 24/7.',
    email: 'heavy.rental@demo.buildapp.ge',
  },
  // 7. Equipment Rental - Tools
  {
    phone: '+995555100007',
    name: 'გია ხარაბაძე',
    businessName: 'პროფი იარაღები',
    taxId: '401234573',
    location: tbilisiLocations[6],
    categories: ['rental_tools', 'power_tools'],
    about: 'ვაქირავებთ პროფესიონალურ სამშენებლო იარაღებს: Hilti, Bosch, Makita. ტექნიკური მომსახურება და ინსტრუქტაჟი უფასოა.',
    email: 'protools@demo.buildapp.ge',
  },
];

// Products for each supplier type
const skusBySupplier: Record<string, DemoSKU[]> = {
  '+995555100001': [ // Tbilisi Concrete
    { name: 'ბეტონი M200', specString: 'B15, მოცურება 16-20 სმ', category: 'concrete', unit: 'მ³', basePrice: 165, description: 'სტანდარტული ბეტონი საძირკვლებისა და იატაკისთვის', minOrder: 2 },
    { name: 'ბეტონი M250', specString: 'B20, მოცურება 16-20 სმ', category: 'concrete', unit: 'მ³', basePrice: 180, description: 'გაძლიერებული ბეტონი მონოლითური მშენებლობისთვის', minOrder: 2 },
    { name: 'ბეტონი M300', specString: 'B22.5, მოცურება 16-20 სმ', category: 'concrete', unit: 'მ³', basePrice: 195, description: 'მაღალი კლასის ბეტონი სვეტებისა და გადახურვისთვის', minOrder: 2 },
    { name: 'ბეტონი M350', specString: 'B25, მოცურება 18-22 სმ', category: 'concrete', unit: 'მ³', basePrice: 215, description: 'პრემიუმ ბეტონი დიდი დატვირთვის კონსტრუქციებისთვის', minOrder: 2 },
    { name: 'ბეტონი M400', specString: 'B30, მოცურება 18-22 სმ', category: 'concrete', unit: 'მ³', basePrice: 240, description: 'სპეციალური ბეტონი ხიდებისა და სამრეწველო ობიექტებისთვის', minOrder: 3 },
    { name: 'ხრეში 5-20 მმ', specString: 'გარეცხილი, გრანიტი', category: 'aggregates', unit: 'მ³', basePrice: 55, description: 'ბეტონის მომზადებისა და დრენაჟისთვის', minOrder: 5 },
    { name: 'ხრეში 20-40 მმ', specString: 'გარეცხილი, გრანიტი', category: 'aggregates', unit: 'მ³', basePrice: 50, description: 'ფუნდამენტის მომზადებისა და გზების მოწყობისთვის', minOrder: 5 },
    { name: 'ქვიშა მდინარის', specString: 'გარეცხილი, 0-5 მმ', category: 'aggregates', unit: 'მ³', basePrice: 35, description: 'ბეტონის ნარევისა და კედლების წყობისთვის', minOrder: 3 },
  ],
  '+995555100002': [ // Kavkaz Metal
    { name: 'არმატურა Ø8 მმ', specString: 'A500C, L=11.7 მ', category: 'steel', unit: 'ტონა', basePrice: 1150, description: 'კოროზიამედეგი არმატურა ბეტონის კონსტრუქციებისთვის', minOrder: 0.5 },
    { name: 'არმატურა Ø10 მმ', specString: 'A500C, L=11.7 მ', category: 'steel', unit: 'ტონა', basePrice: 1120, description: 'უნივერსალური არმატურა ყველა ტიპის სამუშაოსთვის', minOrder: 0.5 },
    { name: 'არმატურა Ø12 მმ', specString: 'A500C, L=11.7 მ', category: 'steel', unit: 'ტონა', basePrice: 1100, description: 'საძირკვლისა და გადახურვის არმატურა', minOrder: 0.5 },
    { name: 'არმატურა Ø14 მმ', specString: 'A500C, L=11.7 მ', category: 'steel', unit: 'ტონა', basePrice: 1080, description: 'მძიმე კონსტრუქციების არმატურა', minOrder: 1 },
    { name: 'არმატურა Ø16 მმ', specString: 'A500C, L=11.7 მ', category: 'steel', unit: 'ტონა', basePrice: 1050, description: 'სამრეწველო მშენებლობის არმატურა', minOrder: 1 },
    { name: 'არმატურა Ø20 მმ', specString: 'A500C, L=11.7 მ', category: 'steel', unit: 'ტონა', basePrice: 1030, description: 'დიდი განივკვეთის არმატურა', minOrder: 1 },
    { name: 'პროფილი 60x60x3 მმ', specString: 'კვადრატული, S235', category: 'steel', unit: 'ტონა', basePrice: 1350, description: 'კარკასული მშენებლობისთვის', minOrder: 0.3 },
    { name: 'პროფილი 80x40x3 მმ', specString: 'მართკუთხა, S235', category: 'steel', unit: 'ტონა', basePrice: 1380, description: 'ლითონის კონსტრუქციებისთვის', minOrder: 0.3 },
    { name: 'ლისტი 2 მმ', specString: 'S235, 1250x2500 მმ', category: 'steel', unit: 'ტონა', basePrice: 1420, description: 'ზოგადი დანიშნულების ფურცელი', minOrder: 0.2 },
    { name: 'ლისტი 3 მმ', specString: 'S235, 1500x3000 მმ', category: 'steel', unit: 'ტონა', basePrice: 1400, description: 'კონსტრუქციული ფურცელი', minOrder: 0.3 },
  ],
  '+995555100003': [ // Georgian Blocks
    { name: 'ბეტონის ბლოკი 20x20x40', specString: 'M100, სრული', category: 'blocks', unit: 'ცალი', basePrice: 1.80, description: 'სტანდარტული კედლის ბლოკი', minOrder: 100 },
    { name: 'ბეტონის ბლოკი 10x20x40', specString: 'M100, ნახევარი', category: 'blocks', unit: 'ცალი', basePrice: 1.20, description: 'შიდა ტიხრებისთვის', minOrder: 100 },
    { name: 'თერმობლოკი 30x20x60', specString: 'D500, ავტოკლავური', category: 'blocks', unit: 'ცალი', basePrice: 4.50, description: 'თბოსაიზოლაციო ბლოკი', minOrder: 50 },
    { name: 'თერმობლოკი 37.5x20x60', specString: 'D500, ავტოკლავური', category: 'blocks', unit: 'ცალი', basePrice: 5.80, description: 'გაძლიერებული თბოიზოლაცია', minOrder: 50 },
    { name: 'აგური თიხის M100', specString: '250x120x65 მმ, წითელი', category: 'bricks', unit: 'ცალი', basePrice: 0.45, description: 'კლასიკური თიხის აგური', minOrder: 500 },
    { name: 'აგური თიხის M125', specString: '250x120x65 მმ, წითელი', category: 'bricks', unit: 'ცალი', basePrice: 0.55, description: 'გაძლიერებული აგური', minOrder: 500 },
    { name: 'აგური ცეცხლგამძლე ШБ-5', specString: '230x114x65 მმ', category: 'bricks', unit: 'ცალი', basePrice: 2.20, description: 'ბუხრისა და ღუმელისთვის', minOrder: 100 },
    { name: 'კერამზიტბეტონის ბლოკი', specString: '20x20x40, M50', category: 'blocks', unit: 'ცალი', basePrice: 2.10, description: 'მსუბუქი კონსტრუქციული ბლოკი', minOrder: 100 },
  ],
  '+995555100004': [ // Sand & Gravel Plus
    { name: 'ქვიშა მშენებლობის', specString: 'კარიერის, 0-5 მმ', category: 'sand', unit: 'მ³', basePrice: 28, description: 'ზოგადი სამშენებლო სამუშაოებისთვის', minOrder: 5 },
    { name: 'ქვიშა გარეცხილი', specString: 'მდინარის, 0-3 მმ', category: 'sand', unit: 'მ³', basePrice: 42, description: 'ბეტონის ნარევისა და ლესვისთვის', minOrder: 3 },
    { name: 'ქვიშა ფილტრაციის', specString: 'ფრაქცია 0.5-1.2 მმ', category: 'sand', unit: 'მ³', basePrice: 65, description: 'დრენაჟისა და ფილტრაციისთვის', minOrder: 2 },
    { name: 'ხრეში 5-10 მმ', specString: 'გრანიტი, გარეცხილი', category: 'gravel', unit: 'მ³', basePrice: 58, description: 'ბეტონის ნარევისთვის', minOrder: 5 },
    { name: 'ხრეში 10-20 მმ', specString: 'გრანიტი, გარეცხილი', category: 'gravel', unit: 'მ³', basePrice: 52, description: 'ფუნდამენტისა და ბეტონისთვის', minOrder: 5 },
    { name: 'ხრეში 20-40 მმ', specString: 'გრანიტი', category: 'gravel', unit: 'მ³', basePrice: 48, description: 'დრენაჟისა და გზებისთვის', minOrder: 5 },
    { name: 'ხრეში 40-70 მმ', specString: 'ქვის მასა', category: 'gravel', unit: 'მ³', basePrice: 42, description: 'ფუნდამენტის მომზადება', minOrder: 10 },
    { name: 'ბუტის ქვა', specString: 'ნატურალური, 150-300 მმ', category: 'aggregates', unit: 'მ³', basePrice: 38, description: 'საყრდენი კედლებისთვის', minOrder: 10 },
    { name: 'მიწა შავი', specString: 'ნოყიერი', category: 'aggregates', unit: 'მ³', basePrice: 25, description: 'გამწვანებისა და ბაღისთვის', minOrder: 3 },
  ],
  '+995555100005': [ // Cement House
    { name: 'ცემენტი M400', specString: 'CEM I 32.5R, 50 კგ', category: 'cement', unit: 'ტომარა', basePrice: 16, description: 'უნივერსალური პორტლანდცემენტი', minOrder: 20 },
    { name: 'ცემენტი M500', specString: 'CEM I 42.5N, 50 კგ', category: 'cement', unit: 'ტომარა', basePrice: 18, description: 'მაღალი ხარისხის ცემენტი', minOrder: 20 },
    { name: 'ცემენტი თეთრი', specString: 'CEM I 52.5, 50 კგ', category: 'cement', unit: 'ტომარა', basePrice: 45, description: 'დეკორატიული სამუშაოებისთვის', minOrder: 10 },
    { name: 'Knauf Rotband', specString: 'თაბაშირის ლესვა, 30 კგ', category: 'plaster', unit: 'ტომარა', basePrice: 32, description: 'შიდა კედლების ლესვა', minOrder: 10 },
    { name: 'Knauf MP-75', specString: 'მანქანური ლესვა, 30 კგ', category: 'plaster', unit: 'ტომარა', basePrice: 28, description: 'მანქანური წესით ლესვისთვის', minOrder: 20 },
    { name: 'Caparol Putz', specString: 'ფასადის ლესვა, 25 კგ', category: 'plaster', unit: 'ტომარა', basePrice: 55, description: 'გარე კედლების ლესვა', minOrder: 10 },
    { name: 'იატაკის ნარევი', specString: 'თვითსწორებადი, 25 კგ', category: 'dry_mixes', unit: 'ტომარა', basePrice: 22, description: 'თვითსწორებადი იატაკი 5-50 მმ', minOrder: 20 },
    { name: 'კედლის წებო', specString: 'C2TE, 25 კგ', category: 'dry_mixes', unit: 'ტომარა', basePrice: 18, description: 'კერამიკული ფილებისთვის', minOrder: 20 },
    { name: 'გრუნტი Ceresit CT-17', specString: 'კონცენტრატი, 10 ლ', category: 'dry_mixes', unit: 'ცალი', basePrice: 35, description: 'ღრმად შეღწევადი გრუნტი', minOrder: 5 },
    { name: 'ჰიდროიზოლაცია Ceresit CR-65', specString: 'ცემენტის ბაზაზე, 25 კგ', category: 'dry_mixes', unit: 'ტომარა', basePrice: 48, description: 'სარდაფისა და საძირკვლის იზოლაცია', minOrder: 5 },
  ],
};

// Rental tools for equipment suppliers
const rentalToolsBySupplier: Record<string, DemoRentalTool[]> = {
  '+995555100006': [ // Heavy Equipment Rental
    { name: 'ექსკავატორი JCB 3CX', specString: '4 ტონა, დიზელი', category: 'excavator', dayRate: 450, weekRate: 2700, monthRate: 9000, depositAmount: 2000, description: 'უნივერსალური ექსკავატორ-დამტვირთველი მიწის სამუშაოებისთვის', quantity: 2 },
    { name: 'მინი ექსკავატორი Kubota', specString: '1.8 ტონა, დიზელი', category: 'excavator', dayRate: 280, weekRate: 1680, monthRate: 5600, depositAmount: 1500, description: 'კომპაქტური ექსკავატორი ვიწრო სივრცეებისთვის', quantity: 3 },
    { name: 'ბულდოზერი D6', specString: 'Caterpillar, 20 ტონა', category: 'bulldozer', dayRate: 800, weekRate: 4800, monthRate: 16000, depositAmount: 5000, description: 'მძლავრი ბულდოზერი მიწის დიდი მოცულობის სამუშაოსთვის', quantity: 1 },
    { name: 'ფრონტალური დამტვირთველი', specString: 'Volvo L60, 6 ტონა', category: 'loader', dayRate: 500, weekRate: 3000, monthRate: 10000, depositAmount: 3000, description: 'ინერტული მასალების დატვირთვა და ტრანსპორტირება', quantity: 2 },
    { name: 'ავტოკრანი 25 ტონა', specString: 'Liebherr LTM 1025', category: 'crane', dayRate: 1200, weekRate: 7200, monthRate: 24000, depositAmount: 8000, description: 'მობილური კრანი სამშენებლო სამუშაოებისთვის', quantity: 1 },
    { name: 'ავტოკრანი 50 ტონა', specString: 'Liebherr LTM 1050', category: 'crane', dayRate: 1800, weekRate: 10800, monthRate: 36000, depositAmount: 12000, description: 'მძიმე ტვირთის ასაწევი კრანი', quantity: 1 },
    { name: 'ბეტონის ტუმბო', specString: 'Putzmeister, 36 მ', category: 'concrete_pump', dayRate: 600, weekRate: 3600, monthRate: 12000, depositAmount: 4000, description: 'ბეტონის ჩასხმა სიმაღლეზე და მანძილზე', quantity: 2 },
    { name: 'თვითმცლელი KAMAZ', specString: '20 მ³, 6x4', category: 'truck', dayRate: 350, weekRate: 2100, monthRate: 7000, depositAmount: 2000, description: 'ინერტული მასალების გადატანა', quantity: 3 },
    { name: 'ვიბროტკეპნა', specString: 'Bomag BW 120, 1.5 ტონა', category: 'compactor', dayRate: 180, weekRate: 1080, monthRate: 3600, depositAmount: 1000, description: 'მიწის და ასფალტის ტკეპნა', quantity: 2 },
    { name: 'მობილური გენერატორი 100 kVA', specString: 'დიზელი, Atlas Copco', category: 'generator', dayRate: 250, weekRate: 1500, monthRate: 5000, depositAmount: 2000, description: 'ელექტროენერგიის წყარო სამშენებლო მოედანზე', quantity: 3 },
  ],
  '+995555100007': [ // Pro Tools Rental
    { name: 'ბეტონის შემრევი 180 ლ', specString: 'ელექტრო, 1.5 კვტ', category: 'mixer', dayRate: 35, weekRate: 180, monthRate: 500, depositAmount: 200, description: 'მცირე მოცულობის ბეტონის მომზადება', quantity: 5 },
    { name: 'ბეტონის ვიბრატორი', specString: 'Wacker, 45 მმ', category: 'vibrator', dayRate: 25, weekRate: 130, monthRate: 400, depositAmount: 150, description: 'ბეტონის დატკეპნა და ჰაერის გამოდევნა', quantity: 8 },
    { name: 'პერფორატორი Hilti TE-70', specString: '1600 ვტ, SDS-Max', category: 'power_drill', dayRate: 40, weekRate: 200, monthRate: 600, depositAmount: 300, description: 'მძიმე ბურღვა და დაშლა', quantity: 6 },
    { name: 'პერფორატორი Hilti TE-30', specString: '850 ვტ, SDS-Plus', category: 'power_drill', dayRate: 25, weekRate: 130, monthRate: 400, depositAmount: 200, description: 'საშუალო სიმძლავრის პერფორატორი', quantity: 10 },
    { name: 'დემონტაჟის ჩაქუჩი', specString: 'Bosch GSH 16-30, 1750 ვტ', category: 'demolition', dayRate: 55, weekRate: 280, monthRate: 850, depositAmount: 400, description: 'ბეტონის და ასფალტის დაშლა', quantity: 4 },
    { name: 'კუთხსახეხი 230 მმ', specString: 'Makita GA9020, 2200 ვტ', category: 'grinder', dayRate: 20, weekRate: 100, monthRate: 300, depositAmount: 100, description: 'ლითონის და ქვის ჭრა', quantity: 12 },
    { name: 'ელექტრო ხერხი ცირკულარული', specString: 'Makita 5008MG, 210 მმ', category: 'saw', dayRate: 25, weekRate: 130, monthRate: 400, depositAmount: 150, description: 'ხის და დაფების ჭრა', quantity: 8 },
    { name: 'ჯაჭვის ხერხი Stihl MS-362', specString: 'ბენზინი, 45 სმ', category: 'saw', dayRate: 35, weekRate: 180, monthRate: 550, depositAmount: 250, description: 'ხეების და ძელების ჭრა', quantity: 5 },
    { name: 'ხახუნის მანქანა', specString: 'Festool RO 150, 720 ვტ', category: 'sander', dayRate: 30, weekRate: 150, monthRate: 450, depositAmount: 200, description: 'ზედაპირის სახეხი და გასუფთავება', quantity: 6 },
    { name: 'ლაზერული ნიველირი', specString: 'Bosch GRL 300 HV', category: 'laser', dayRate: 45, weekRate: 230, monthRate: 700, depositAmount: 500, description: 'ჰორიზონტის და ვერტიკალის განსაზღვრა', quantity: 4 },
    { name: 'ტელესკოპური კიბე 8 მ', specString: 'ალუმინი, 150 კგ', category: 'ladder', dayRate: 15, weekRate: 75, monthRate: 220, depositAmount: 100, description: 'სიმაღლეზე მუშაობისთვის', quantity: 10 },
    { name: 'სკაფოლდინგი 20 მ²', specString: 'ფოლადის, მოდულური', category: 'scaffolding', dayRate: 80, weekRate: 400, monthRate: 1200, depositAmount: 500, description: 'ფასადის და შიდა სამუშაოებისთვის', quantity: 5 },
    { name: 'კომპრესორი 500 ლ/წთ', specString: 'Atlas Copco, დიზელი', category: 'compressor', dayRate: 120, weekRate: 600, monthRate: 1800, depositAmount: 800, description: 'პნევმო იარაღების კვება', quantity: 3 },
    { name: 'შედუღების აპარატი MIG', specString: 'Lincoln 350A', category: 'welder', dayRate: 50, weekRate: 250, monthRate: 750, depositAmount: 400, description: 'ლითონის შედუღება', quantity: 4 },
    { name: 'მაღალწნევიანი სარეცხი', specString: 'Karcher HD 9/20, 200 ბარი', category: 'cleaner', dayRate: 40, weekRate: 200, monthRate: 600, depositAmount: 200, description: 'ზედაპირების გაწმენდა', quantity: 6 },
  ],
};

async function seedDemoData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding demo data...\n');

    // Start transaction
    await client.query('BEGIN');

    const supplierIds: Record<string, string> = {};

    // 1. Create demo supplier users and profiles
    console.log('📦 Creating demo suppliers...');

    for (const supplier of demoSuppliers) {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE phone = $1',
        [supplier.phone]
      );

      let userId: string;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        console.log(`  ⏭️  User exists: ${supplier.name}`);
      } else {
        // Create user
        const userResult = await client.query(
          `INSERT INTO users (phone, name, email, user_type, is_verified, language)
           VALUES ($1, $2, $3, 'supplier', true, 'ka')
           RETURNING id`,
          [supplier.phone, supplier.name, supplier.email]
        );
        userId = userResult.rows[0].id;
        console.log(`  ✓ Created user: ${supplier.name}`);
      }

      // Check if supplier profile exists
      const existingSupplier = await client.query(
        'SELECT id FROM suppliers WHERE user_id = $1',
        [userId]
      );

      if (existingSupplier.rows.length > 0) {
        supplierIds[supplier.phone] = existingSupplier.rows[0].id;
        console.log(`  ⏭️  Supplier exists: ${supplier.businessName}`);
      } else {
        // Create supplier profile
        const supplierResult = await client.query(
          `INSERT INTO suppliers (user_id, business_name, tax_id, depot_latitude, depot_longitude, depot_address, is_verified, categories, about, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, true)
           RETURNING id`,
          [
            userId,
            supplier.businessName,
            supplier.taxId,
            supplier.location.lat,
            supplier.location.lng,
            supplier.location.address,
            supplier.categories,
            supplier.about,
          ]
        );
        supplierIds[supplier.phone] = supplierResult.rows[0].id;
        console.log(`  ✓ Created supplier: ${supplier.businessName}`);
      }
    }

    // 2. Create SKUs for material suppliers
    console.log('\n📋 Creating product SKUs...');

    for (const [phone, skus] of Object.entries(skusBySupplier)) {
      const supplierId = supplierIds[phone];
      if (!supplierId) continue;

      for (const sku of skus) {
        // Check if SKU exists
        const existingSku = await client.query(
          'SELECT id FROM skus WHERE supplier_id = $1 AND name = $2',
          [supplierId, sku.name]
        );

        if (existingSku.rows.length > 0) {
          console.log(`  ⏭️  SKU exists: ${sku.name}`);
          continue;
        }

        await client.query(
          `INSERT INTO skus (supplier_id, name, spec_string, category, unit, base_price, description, min_order_quantity, direct_order_available, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)`,
          [
            supplierId,
            sku.name,
            sku.specString,
            sku.category,
            sku.unit,
            sku.basePrice,
            sku.description,
            sku.minOrder || null,
          ]
        );
        console.log(`  ✓ Created SKU: ${sku.name} - ₾${sku.basePrice}/${sku.unit}`);
      }
    }

    // 3. Create rental tools
    console.log('\n🔧 Creating rental equipment...');

    for (const [phone, tools] of Object.entries(rentalToolsBySupplier)) {
      const supplierId = supplierIds[phone];
      if (!supplierId) continue;

      for (const tool of tools) {
        // Check if tool exists
        const existingTool = await client.query(
          'SELECT id FROM rental_tools WHERE supplier_id = $1 AND name = $2',
          [supplierId, tool.name]
        );

        if (existingTool.rows.length > 0) {
          console.log(`  ⏭️  Tool exists: ${tool.name}`);
          continue;
        }

        await client.query(
          `INSERT INTO rental_tools (supplier_id, name, spec_string, category, day_rate, week_rate, month_rate, deposit_amount, description, quantity_available, direct_booking_available, is_available, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, true, true)`,
          [
            supplierId,
            tool.name,
            tool.specString,
            tool.category,
            tool.dayRate,
            tool.weekRate,
            tool.monthRate,
            tool.depositAmount,
            tool.description,
            tool.quantity,
          ]
        );
        console.log(`  ✓ Created rental: ${tool.name} - ₾${tool.dayRate}/day`);
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n====================================');
    console.log('✅ Demo data seeded successfully!');
    console.log('====================================\n');
    console.log('Demo Suppliers (OTP: 123456):');
    for (const supplier of demoSuppliers) {
      console.log(`  ${supplier.phone} - ${supplier.businessName}`);
    }
    console.log('');

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
