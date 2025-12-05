/**
 * Template Instructions Data
 * IKEA-style step-by-step assembly/construction instructions for each template
 * These instructions are dynamically modified based on user parameters
 */

export interface InstructionStep {
  step: number;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  image_url?: string;
  illustration_type?: string; // CSS animation type: 'digging', 'post_install', 'concrete_mixing', etc.
  duration_minutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tools_needed?: string[];
  materials_needed?: string[];
  tips_ka?: string[];
  tips_en?: string[];
  warnings_ka?: string[];
  warnings_en?: string[];
  substeps?: Array<{
    text_ka: string;
    text_en: string;
    image_url?: string;
  }>;
}

export interface SafetyNote {
  text_ka: string;
  text_en: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string;
}

export interface TemplateInstructions {
  title_ka: string;
  title_en: string;
  estimated_duration_hours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  people_required: number;
  steps: InstructionStep[];
  safety_notes: SafetyNote[];
}

/**
 * Generate fence instructions based on user inputs
 */
export function generateFenceInstructions(inputs: {
  length: number;
  height: number;
  style: string;
  gates: string;
  terrain: string;
}): TemplateInstructions {
  const { length, height, style, gates, terrain } = inputs;
  const isWood = style === 'wood_on_metal';
  const hasGate = gates !== 'none';
  const isSloped = terrain === 'sloped';

  // Calculate dynamic values
  const postCount = Math.ceil(length / 2.5) + 2;
  const estimatedHours = Math.max(4, Math.round(length * 0.5 + (hasGate ? 2 : 0) + (isSloped ? 2 : 0)));
  const holeDepth = isSloped ? 70 : 60;

  return {
    title_ka: 'ღობის მონტაჟი',
    title_en: 'Fence Installation',
    estimated_duration_hours: estimatedHours,
    difficulty: isSloped ? 'hard' : (hasGate ? 'medium' : 'easy'),
    people_required: length > 20 ? 3 : 2,
    steps: [
      {
        step: 1,
        title_ka: 'მომზადება და დაგეგმვა',
        title_en: 'Preparation & Planning',
        description_ka: `გაზომეთ და მონიშნეთ ${length}მ სიგრძის ღობის ტრასა. დაგჭირდებათ ${postCount} ბოძი, რომლებიც განთავსდება ყოველ 2.5 მეტრში.`,
        description_en: `Measure and mark the ${length}m fence line. You'll need ${postCount} posts, placed every 2.5 meters.`,
        illustration_type: 'measuring',
        duration_minutes: 30,
        difficulty: 'easy',
        tools_needed: ['საზომი რულეტკა', 'თოკი', 'პალები', 'ჩაქუჩი'],
        substeps: [
          {
            text_ka: 'მონიშნეთ ღობის საწყისი და საბოლოო წერტილები',
            text_en: 'Mark the starting and ending points of the fence',
          },
          {
            text_ka: 'გაასწორეთ თოკი ორ წერტილს შორის',
            text_en: 'Stretch a string line between the two points',
          },
          {
            text_ka: 'მონიშნეთ ბოძების ადგილები ყოველ 2.5 მეტრში',
            text_en: 'Mark post locations every 2.5 meters',
          },
        ],
        tips_ka: [
          'გამოიყენეთ ფერადი თოკი უკეთესი ხილვადობისთვის',
          'შეამოწმეთ კოორდინატები GPS-ით ან მეზობელთან',
        ],
        tips_en: [
          'Use colored string for better visibility',
          'Verify coordinates with GPS or check with neighbors',
        ],
        warnings_ka: ['დარწმუნდით, რომ ღობე თქვენს საკუთრებაზეა'],
        warnings_en: ['Make sure the fence is on your property'],
      },
      {
        step: 2,
        title_ka: 'მიწისქვეშა კომუნიკაციების შემოწმება',
        title_en: 'Check Underground Utilities',
        description_ka: 'სავალდებულო ნაბიჯი! შეამოწმეთ მიწისქვეშა გაზის, წყლის, ელექტროობისა და ინტერნეტის კაბელების მდებარეობა.',
        description_en: 'Mandatory step! Check the location of underground gas, water, electricity, and internet cables.',
        illustration_type: 'measuring',
        duration_minutes: 60,
        difficulty: 'easy',
        substeps: [
          {
            text_ka: 'დაუკავშირდით ადგილობრივ კომუნალურ სამსახურს',
            text_en: 'Contact local utility services',
          },
          {
            text_ka: 'მოითხოვეთ კომუნიკაციების რუკა',
            text_en: 'Request a utilities map',
          },
          {
            text_ka: 'მონიშნეთ კომუნიკაციების ხაზები მიწის ზედაპირზე',
            text_en: 'Mark utility lines on the ground surface',
          },
        ],
        warnings_ka: [
          'არასოდეს თხაროთ კომუნიკაციების შემოწმების გარეშე!',
          'დაზიანებული კომუნიკაციები შეიძლება სასიკვდილო იყოს',
        ],
        warnings_en: [
          'Never dig without checking utilities!',
          'Damaged utilities can be fatal',
        ],
      },
      {
        step: 3,
        title_ka: 'ორმოების გათხრა',
        title_en: 'Dig Post Holes',
        description_ka: `გათხარეთ ${postCount} ორმო ${holeDepth}სმ სიღრმით და 25სმ დიამეტრით. ${isSloped ? 'დახრილ რელიეფზე ორმოები უფრო ღრმა უნდა იყოს.' : ''}`,
        description_en: `Dig ${postCount} holes ${holeDepth}cm deep and 25cm in diameter. ${isSloped ? 'On sloped terrain, holes need to be deeper.' : ''}`,
        illustration_type: 'digging',
        duration_minutes: postCount * 15,
        difficulty: isSloped ? 'hard' : 'medium',
        tools_needed: ['ბრჯები', 'თოხი', 'საზომი', 'ნიჩაბი'],
        substeps: [
          {
            text_ka: 'დაიწყეთ კუთხის ბოძებიდან',
            text_en: 'Start with corner posts',
          },
          {
            text_ka: 'გამოიყენეთ საზომი სიღრმის შესამოწმებლად',
            text_en: 'Use a measuring stick to check depth',
          },
          {
            text_ka: 'ორმოს ფსკერი უნდა იყოს ბრტყელი',
            text_en: 'The bottom of the hole should be flat',
          },
        ],
        tips_ka: [
          'დანამული მიწა უფრო ადვილი სათხრელია',
          'მოათავსეთ ამოთხრილი მიწა ცალკე გროვებში',
        ],
        tips_en: [
          'Wet soil is easier to dig',
          'Keep excavated soil in separate piles',
        ],
      },
      {
        step: 4,
        title_ka: 'ბოძების დაყენება',
        title_en: 'Set Posts',
        description_ka: `დააყენეთ ${height}მ სიმაღლის მეტალის ბოძები. თითოეული ბოძი უნდა იყოს ვერტიკალურად და ერთ ხაზზე დანარჩენებთან.`,
        description_en: `Install ${height}m high metal posts. Each post must be vertical and aligned with the others.`,
        illustration_type: 'post_install',
        duration_minutes: postCount * 10,
        difficulty: 'medium',
        tools_needed: ['დონე', 'თოკი', 'დროებითი საყრდენები'],
        substeps: [
          {
            text_ka: 'დააყენეთ კუთხის ბოძები პირველად',
            text_en: 'Set corner posts first',
          },
          {
            text_ka: 'გამოიყენეთ დონე ვერტიკალობის შესამოწმებლად',
            text_en: 'Use a level to check verticality',
          },
          {
            text_ka: 'გაუშვით თოკი კუთხის ბოძებს შორის შუალედური ბოძების გასათანაბრებლად',
            text_en: 'Run a string between corner posts to align middle posts',
          },
          {
            text_ka: 'დააფიქსირეთ დროებითი საყრდენებით',
            text_en: 'Secure with temporary braces',
          },
        ],
        tips_ka: [
          'ორი ადამიანი უკეთ აკეთებს ამ სამუშაოს',
          'შეამოწმეთ ვერტიკალობა ორი მხრიდან',
        ],
        tips_en: [
          'This job is better with two people',
          'Check verticality from two sides',
        ],
      },
      {
        step: 5,
        title_ka: 'ბეტონის ჩასხმა',
        title_en: 'Pour Concrete',
        description_ka: 'ჩაასხით M300 ბეტონი ბოძების ირგვლივ. დატოვეთ 24-48 საათი გამაგრებისთვის.',
        description_en: 'Pour M300 concrete around the posts. Allow 24-48 hours for curing.',
        illustration_type: 'concrete_mixing',
        duration_minutes: postCount * 8,
        difficulty: 'medium',
        tools_needed: ['ბეტონის მიქსერი ან თაიგული', 'წყალი', 'ნიჩაბი'],
        materials_needed: ['ბეტონი M300', 'წყალი'],
        substeps: [
          {
            text_ka: 'მოამზადეთ ბეტონი ინსტრუქციის მიხედვით',
            text_en: 'Mix concrete according to instructions',
          },
          {
            text_ka: 'ჩაასხით ბეტონი ორმოში ბოძის ირგვლივ',
            text_en: 'Pour concrete into the hole around the post',
          },
          {
            text_ka: 'შეარხიეთ ბეტონი ჰაერის ბუშტუკების მოსაშორებლად',
            text_en: 'Vibrate concrete to remove air bubbles',
          },
          {
            text_ka: 'დააფორმეთ ბეტონის ზედაპირი წყლის გასადინებლად',
            text_en: 'Shape concrete surface to drain water away',
          },
        ],
        tips_ka: [
          'ბეტონი არ უნდა იყოს ძალიან თხევადი',
          'დაფარეთ პლასტმასით ნელი გამოშრობისთვის',
        ],
        tips_en: [
          'Concrete should not be too watery',
          'Cover with plastic for slow curing',
        ],
        warnings_ka: ['ბეტონი აღიზიანებს კანს - გამოიყენეთ ხელთათმანები'],
        warnings_en: ['Concrete irritates skin - wear gloves'],
      },
      {
        step: 6,
        title_ka: 'ჰორიზონტალური ელემენტების მონტაჟი',
        title_en: 'Install Horizontal Rails',
        description_ka: `მიამაგრეთ ჰორიზონტალური ლარტყები ბოძებზე. ${height >= 2 ? '3 ლარტყი რეკომენდირებულია 2მ-ზე მაღალი ღობისთვის.' : '2 ლარტყი საკმარისია.'}`,
        description_en: `Attach horizontal rails to the posts. ${height >= 2 ? '3 rails are recommended for fences over 2m.' : '2 rails are sufficient.'}`,
        illustration_type: 'leveling',
        duration_minutes: Math.ceil(length / 2.5) * 5,
        difficulty: 'medium',
        tools_needed: ['შედუღების აპარატი ან ხრახნები', 'დონე', 'საზომი'],
        substeps: [
          {
            text_ka: 'გაზომეთ და მონიშნეთ ლარტყების სიმაღლეები',
            text_en: 'Measure and mark rail heights',
          },
          {
            text_ka: 'მიამაგრეთ ლარტყები შედუღებით ან ხრახნებით',
            text_en: 'Attach rails by welding or screwing',
          },
          {
            text_ka: 'შეამოწმეთ ჰორიზონტალობა დონით',
            text_en: 'Check level with a spirit level',
          },
        ],
      },
      {
        step: 7,
        title_ka: isWood ? 'ხის ფიცრების მონტაჟი' : 'მეტალის ფურცლების მონტაჟი',
        title_en: isWood ? 'Install Wood Panels' : 'Install Metal Sheets',
        description_ka: isWood
          ? `მიამაგრეთ ხის ფიცრები ჰორიზონტალურ ლარტყებზე. დატოვეთ 5მმ ღრიჭო ფიცრებს შორის გაფართოებისთვის.`
          : `მიამაგრეთ მეტალის ფურცლები ლარტყებზე. ფურცლები უნდა გადაფარავდეს 5სმ-ით.`,
        description_en: isWood
          ? `Attach wood panels to horizontal rails. Leave 5mm gap between panels for expansion.`
          : `Attach metal sheets to rails. Sheets should overlap by 5cm.`,
        illustration_type: 'panel_attach',
        duration_minutes: Math.ceil(length * height / 2) * 3,
        difficulty: 'easy',
        tools_needed: isWood ? ['ხრახნი ან დრელი', 'ხრახნები'] : ['ხრახნები', 'დრელი'],
        substeps: [
          {
            text_ka: 'დაიწყეთ ერთი ბოლოდან',
            text_en: 'Start from one end',
          },
          {
            text_ka: isWood ? 'დატოვეთ ღრიჭოები ფიცრებს შორის' : 'გადაფარეთ ფურცლები 5სმ-ით',
            text_en: isWood ? 'Leave gaps between panels' : 'Overlap sheets by 5cm',
          },
          {
            text_ka: 'გამოიყენეთ მინიმუმ 4 ხრახნი თითო ფურცელზე/ფიცარზე',
            text_en: 'Use at least 4 screws per sheet/panel',
          },
        ],
      },
      ...(hasGate ? [{
        step: 8,
        title_ka: gates === 'car' ? 'სატრანსპორტო კარიბჭის მონტაჟი' : 'საფეხმავლო კარიბჭის მონტაჟი',
        title_en: gates === 'car' ? 'Install Vehicle Gate' : 'Install Walk Gate',
        description_ka: gates === 'car'
          ? 'დაამონტაჟეთ სატრანსპორტო კარიბჭე მძიმე ანკესებით. კარიბჭე უნდა იხსნებოდეს თავისუფლად.'
          : 'დაამონტაჟეთ საფეხმავლო კარიბჭე. შეამოწმეთ, რომ თავისუფლად იხსნება და იკეტება.',
        description_en: gates === 'car'
          ? 'Install vehicle gate with heavy-duty hinges. The gate should open freely.'
          : 'Install walk gate. Make sure it opens and closes freely.',
        illustration_type: 'gate_install',
        duration_minutes: gates === 'car' ? 120 : 60,
        difficulty: 'medium' as const,
        tools_needed: ['დრელი', 'ხრახნები', 'დონე'],
        substeps: [
          {
            text_ka: 'მიამაგრეთ ანკესები ბოძზე',
            text_en: 'Attach hinges to post',
          },
          {
            text_ka: 'მიამაგრეთ კარიბჭე ანკესებზე',
            text_en: 'Attach gate to hinges',
          },
          {
            text_ka: 'დაამონტაჟეთ საკეტი',
            text_en: 'Install the lock mechanism',
          },
          {
            text_ka: 'შეამოწმეთ გახსნა/დახურვა',
            text_en: 'Test opening/closing',
          },
        ],
      }] : []),
      {
        step: hasGate ? 9 : 8,
        title_ka: 'დასრულება და შემოწმება',
        title_en: 'Finishing & Inspection',
        description_ka: 'შეამოწმეთ მთელი ღობე, დაამაგრეთ ნებისმიერი ფხვიერი ელემენტი და გაასუფთავეთ სამუშაო ადგილი.',
        description_en: 'Inspect the entire fence, tighten any loose elements, and clean up the work area.',
        illustration_type: 'completion',
        duration_minutes: 30,
        difficulty: 'easy',
        substeps: [
          {
            text_ka: 'შეამოწმეთ ყველა ხრახნი და კავშირი',
            text_en: 'Check all screws and connections',
          },
          {
            text_ka: 'შეამოწმეთ ბოძების ვერტიკალობა',
            text_en: 'Verify posts are vertical',
          },
          {
            text_ka: 'გაასუფთავეთ ზედმეტი ბეტონი და ნარჩენები',
            text_en: 'Clean up excess concrete and debris',
          },
          {
            text_ka: 'გადაიღეთ ფოტოები დოკუმენტაციისთვის',
            text_en: 'Take photos for documentation',
          },
        ],
        tips_ka: [
          'შეინახეთ ზედმეტი მასალები მომავალი შეკეთებისთვის',
        ],
        tips_en: [
          'Keep spare materials for future repairs',
        ],
      },
    ],
    safety_notes: [
      {
        text_ka: 'შეამოწმეთ საკუთრების საზღვრები ოფიციალური დოკუმენტებით',
        text_en: 'Verify property boundaries with official documents',
        severity: 'warning',
        icon: 'map',
      },
      {
        text_ka: 'კომუნალური ხაზების შემოწმება სავალდებულოა თხრის დაწყებამდე',
        text_en: 'Utility line check is mandatory before digging',
        severity: 'critical',
        icon: 'zap',
      },
      {
        text_ka: `საფუძველი: მინიმუმ ${holeDepth}სმ სიღრმე ყინვის ხაზის ქვემოთ`,
        text_en: `Foundation: minimum ${holeDepth}cm depth below frost line`,
        severity: 'critical',
        icon: 'thermometer',
      },
      {
        text_ka: 'გამოიყენეთ დამცავი ხელთათმანები და სათვალეები',
        text_en: 'Wear protective gloves and safety glasses',
        severity: 'warning',
        icon: 'shield',
      },
      {
        text_ka: 'არ იმუშავოთ მარტო მძიმე ელემენტებთან',
        text_en: "Don't work alone with heavy elements",
        severity: 'info',
        icon: 'users',
      },
    ],
  };
}

/**
 * Generate slab instructions based on user inputs
 */
export function generateSlabInstructions(inputs: {
  length: number;
  width: number;
  thickness: number;
  grade: string;
  reinforcement: string;
}): TemplateInstructions {
  const { length, width, thickness, grade, reinforcement } = inputs;
  const area = length * width;
  const volume = area * (thickness / 100);
  const isCommercial = grade === 'm300';
  const hasReinforcement = reinforcement !== 'none';
  const isRebar = reinforcement === 'rebar';
  const needsPump = volume > 3;

  // Calculate dynamic values
  const estimatedHours = Math.max(4, Math.round(area * 0.3 + (hasReinforcement ? 2 : 0)));
  const gravelDepth = isCommercial ? 15 : 10;

  return {
    title_ka: 'ბეტონის ფილის მოსხმა',
    title_en: 'Concrete Slab Pouring',
    estimated_duration_hours: estimatedHours,
    difficulty: hasReinforcement ? 'medium' : 'easy',
    people_required: area > 20 ? 4 : (area > 10 ? 3 : 2),
    steps: [
      {
        step: 1,
        title_ka: 'ადგილის მომზადება',
        title_en: 'Site Preparation',
        description_ka: `გაასუფთავეთ და გაასწორეთ ${length}მ × ${width}მ ფართობი. მოაშორეთ ბალახი, ფესვები და ზედაპირული ნიადაგი (ტოპსოილი) 15-20სმ სიღრმეზე.`,
        description_en: `Clear and level a ${length}m × ${width}m area. Remove grass, roots, and topsoil to 15-20cm depth.`,
        illustration_type: 'site_preparation',
        duration_minutes: area * 5,
        difficulty: 'easy',
        tools_needed: ['თოხი', 'ნიჩაბი', 'ხელის თვლები', 'საზომი'],
        substeps: [
          {
            text_ka: 'მონიშნეთ ფილის საზღვრები',
            text_en: 'Mark the slab boundaries',
          },
          {
            text_ka: 'მოაშორეთ მცენარეულობა და ორგანული მასალა',
            text_en: 'Remove vegetation and organic material',
          },
          {
            text_ka: 'გაასწორეთ ზედაპირი',
            text_en: 'Level the surface',
          },
          {
            text_ka: 'დაამაგრეთ ნიადაგი',
            text_en: 'Compact the soil',
          },
        ],
        tips_ka: [
          'გამოიყენეთ ლაზერული დონე უკეთესი სიზუსტისთვის',
          'მოაშორეთ ყველა ქვა და ფესვი',
        ],
        tips_en: [
          'Use a laser level for better accuracy',
          'Remove all rocks and roots',
        ],
      },
      {
        step: 2,
        title_ka: 'ხრეშის ფენის მოწყობა',
        title_en: 'Add Gravel Base',
        description_ka: `მოათავსეთ ${gravelDepth}სმ ხრეშის (ღორღის) ფენა და კარგად დაამაგრეთ ვიბროტამპით ან ხელით.`,
        description_en: `Place ${gravelDepth}cm gravel layer and compact well with a plate compactor or by hand.`,
        illustration_type: 'gravel_base',
        duration_minutes: area * 3,
        difficulty: 'easy',
        tools_needed: ['ხელის თვლები', 'ფოცხი', 'ვიბროტამპი (სასურველი)'],
        materials_needed: ['ხრეში/ღორღი'],
        substeps: [
          {
            text_ka: 'გადაანაწილეთ ხრეში თანაბრად',
            text_en: 'Spread gravel evenly',
          },
          {
            text_ka: 'დაამაგრეთ ფენებად (5სმ ფენები)',
            text_en: 'Compact in layers (5cm layers)',
          },
          {
            text_ka: 'შეამოწმეთ სისწორე',
            text_en: 'Check for levelness',
          },
        ],
        tips_ka: [
          'დანესტიანეთ ხრეში უკეთესი დამაგრებისთვის',
          'შეამოწმეთ სისქე რამდენიმე ადგილას',
        ],
        tips_en: [
          'Dampen gravel for better compaction',
          'Check thickness at multiple spots',
        ],
        warnings_ka: ['ხრეშის ფენა სავალდებულოა სტაბილურობისთვის'],
        warnings_en: ['Gravel layer is mandatory for stability'],
      },
      {
        step: 3,
        title_ka: 'ყალიბის მონტაჟი',
        title_en: 'Set Formwork',
        description_ka: `დააყენეთ ხის ყალიბი ${thickness}სმ სიმაღლეზე. ყალიბი უნდა იყოს მტკიცე და წყალგაუმტარი.`,
        description_en: `Set wooden formwork at ${thickness}cm height. Formwork must be sturdy and watertight.`,
        illustration_type: 'formwork',
        duration_minutes: (length + width) * 4,
        difficulty: 'medium',
        tools_needed: ['ხერხი', 'ჩაქუჩი', 'ლურსმნები', 'დონე', 'კვადრატი'],
        materials_needed: ['ხის ფიცრები', 'მიწის პალები'],
        substeps: [
          {
            text_ka: 'მოჭერით ფიცრები საჭირო სიგრძეზე',
            text_en: 'Cut boards to required length',
          },
          {
            text_ka: 'დააყენეთ ყალიბი საზღვრებზე',
            text_en: 'Set formwork at boundaries',
          },
          {
            text_ka: 'დაამაგრეთ პალებით გარედან',
            text_en: 'Secure with stakes from outside',
          },
          {
            text_ka: 'შეამოწმეთ სიმაღლე და კვადრატულობა',
            text_en: 'Check height and squareness',
          },
        ],
        tips_ka: [
          'გამოიყენეთ ზეთი ყალიბის შიდა მხარეს ადვილად მოსახსნელად',
          'დიაგონალები თანაბარი უნდა იყოს კვადრატისთვის',
        ],
        tips_en: [
          'Apply oil to inside of formwork for easy removal',
          'Diagonals must be equal for square corners',
        ],
      },
      ...(hasReinforcement ? [{
        step: 4,
        title_ka: isRebar ? 'არმატურის მოწყობა' : 'არმატურის ბადის მოწყობა',
        title_en: isRebar ? 'Install Rebar' : 'Install Wire Mesh',
        description_ka: isRebar
          ? `დააწყვეთ არმატურა ბადის სახით 15×15სმ უჯრედებით. არმატურა უნდა იყოს ფილის ქვედა 1/3-ში.`
          : `მოათავსეთ არმატურის ბადე. ბადე უნდა იყოს აწეული მიწიდან 3-5სმ-ით.`,
        description_en: isRebar
          ? `Arrange rebar in a grid pattern with 15×15cm cells. Rebar should be in the lower 1/3 of the slab.`
          : `Place wire mesh. Mesh should be raised 3-5cm from the ground.`,
        illustration_type: 'rebar',
        duration_minutes: area * 2,
        difficulty: isRebar ? 'hard' as const : 'medium' as const,
        tools_needed: isRebar ? ['არმატურის საჭრელი', 'მავთული', 'ფიქსატორები'] : ['საჭრელი', 'ფიქსატორები'],
        materials_needed: isRebar ? ['არმატურა', 'სამაგრი მავთული'] : ['არმატურის ბადე'],
        substeps: isRebar ? [
          {
            text_ka: 'მოჭერით არმატურა საჭირო სიგრძეზე',
            text_en: 'Cut rebar to required lengths',
          },
          {
            text_ka: 'დააწყვეთ ქვედა შრე',
            text_en: 'Lay out the bottom layer',
          },
          {
            text_ka: 'დააწყვეთ ზედა შრე კვეთაზე',
            text_en: 'Lay out the top layer perpendicular',
          },
          {
            text_ka: 'შეკარით მავთულით კვეთის წერტილებში',
            text_en: 'Tie with wire at intersection points',
          },
          {
            text_ka: 'აწიეთ ფიქსატორებით',
            text_en: 'Raise with spacers',
          },
        ] : [
          {
            text_ka: 'გადაშალეთ ბადე',
            text_en: 'Unroll the mesh',
          },
          {
            text_ka: 'მოჭერით ზომაზე',
            text_en: 'Cut to size',
          },
          {
            text_ka: 'გადაფარეთ ნაწილები 20სმ-ით',
            text_en: 'Overlap sections by 20cm',
          },
          {
            text_ka: 'აწიეთ ფიქსატორებით',
            text_en: 'Raise with spacers',
          },
        ],
        warnings_ka: ['არმატურა არ უნდა ეხებოდეს მიწას - გამოიყენეთ ფიქსატორები'],
        warnings_en: ['Reinforcement must not touch the ground - use spacers'],
      }] : []),
      {
        step: hasReinforcement ? 5 : 4,
        title_ka: 'ბეტონის მოსხმა და გასწორება',
        title_en: 'Pour & Level Concrete',
        description_ka: `ჩაასხით ${grade.toUpperCase()} ბეტონი (დაგჭირდებათ დაახლოებით ${(volume * 1.05).toFixed(1)}მ³) და გაასწორეთ ზედაპირი. ${needsPump ? 'რეკომენდირებულია ბეტონის ტუმბოს გამოყენება.' : 'შესაძლებელია ხელით ჩასხმა.'}`,
        description_en: `Pour ${grade.toUpperCase()} concrete (you'll need approximately ${(volume * 1.05).toFixed(1)}m³) and level the surface. ${needsPump ? 'Concrete pump is recommended.' : 'Manual pouring is possible.'}`,
        illustration_type: 'concrete_pour',
        duration_minutes: Math.max(60, volume * 20) + area * 2,
        difficulty: 'hard',
        tools_needed: ['ბეტონის მიქსერი', 'თვლები ან ტუმბო', 'ვიბრატორი', 'ნიჩაბი', 'რეიკა (სწორი ფიცარი)', 'ხელის ფლოუტი', 'დონე'],
        materials_needed: [`ბეტონი ${grade.toUpperCase()}`, 'წყალი'],
        substeps: [
          {
            text_ka: 'დაიწყეთ შორეული კუთხიდან',
            text_en: 'Start from the far corner',
          },
          {
            text_ka: 'ჩაასხით თანაბრად მთელ ფართობზე',
            text_en: 'Pour evenly across the entire area',
          },
          {
            text_ka: 'გაანაწილეთ ნიჩბით თანაბრად',
            text_en: 'Spread evenly with shovel',
          },
          {
            text_ka: 'გაათრიეთ რეიკა ყალიბის გასწვრივ',
            text_en: 'Pull screed along the formwork',
          },
          {
            text_ka: 'გამოიყენეთ ფლოუტი საბოლოო გასწორებისთვის',
            text_en: 'Use float for final smoothing',
          },
        ],
        tips_ka: [
          'შეკვეთეთ 5-10% მეტი ბეტონი',
          'დარწმუნდით, რომ გზა მზადაა მიქსერისთვის',
          'გყავდეთ საკმარისი მუშახელი',
          'იმუშავეთ სწრაფად სანამ ბეტონი რბილია',
          'შეინახეთ ცოტა ბეტონი ხვრელების შესავსებად',
        ],
        tips_en: [
          'Order 5-10% extra concrete',
          'Make sure access road is ready for mixer truck',
          'Have enough workers available',
          'Work quickly while concrete is still workable',
          'Keep some concrete aside for filling holes',
        ],
        warnings_ka: [
          'ბეტონი იწყებს გამაგრებას 30-60 წუთში - იჩქარეთ!',
          'ცხელ ამინდში გამაგრება უფრო სწრაფია',
        ],
        warnings_en: [
          'Concrete starts setting in 30-60 minutes - work fast!',
          'Setting is faster in hot weather',
        ],
      },
      {
        step: hasReinforcement ? 6 : 5,
        title_ka: 'გამაგრება და მოვლა',
        title_en: 'Curing & Care',
        description_ka: 'დაფარეთ ფილა პლასტმასით ან სველი ქსოვილით. შეინახეთ ნესტიანად 7 დღის განმავლობაში.',
        description_en: 'Cover slab with plastic or wet burlap. Keep moist for 7 days.',
        illustration_type: 'curing',
        duration_minutes: 30,
        difficulty: 'easy',
        tools_needed: ['პლასტმასის ფირი', 'შლანგი'],
        substeps: [
          {
            text_ka: 'დაელოდეთ ზედაპირის შეშრობას (2-4 საათი)',
            text_en: 'Wait for surface to set (2-4 hours)',
          },
          {
            text_ka: 'დაფარეთ პლასტმასით',
            text_en: 'Cover with plastic',
          },
          {
            text_ka: 'დანამეთ ყოველდღე 7 დღის განმავლობაში',
            text_en: 'Spray with water daily for 7 days',
          },
        ],
        tips_ka: [
          'ნელი გამაგრება = უფრო ძლიერი ბეტონი',
          'არ დადგეთ ფილაზე 24 საათის განმავლობაში',
        ],
        tips_en: [
          'Slower curing = stronger concrete',
          "Don't walk on slab for 24 hours",
        ],
        warnings_ka: [
          'სრული სიმტკიცისთვის საჭიროა 28 დღე',
          'არ დატვირთოთ მძიმე წონით 7 დღემდე',
        ],
        warnings_en: [
          'Full strength requires 28 days',
          "Don't load with heavy weight for 7 days",
        ],
      },
      {
        step: hasReinforcement ? 7 : 6,
        title_ka: 'ყალიბის მოხსნა',
        title_en: 'Remove Formwork',
        description_ka: 'მოხსენით ყალიბი 24-48 საათის შემდეგ. ფრთხილად იმოქმედეთ, რომ არ დააზიანოთ კიდეები.',
        description_en: 'Remove formwork after 24-48 hours. Be careful not to damage the edges.',
        illustration_type: 'completion',
        duration_minutes: (length + width) * 2,
        difficulty: 'easy',
        tools_needed: ['ჩაქუჩი', 'სოლი', 'ფრჩხილების ამომყვანი'],
        substeps: [
          {
            text_ka: 'ამოიღეთ პალები',
            text_en: 'Remove stakes',
          },
          {
            text_ka: 'ფრთხილად მოაშორეთ ფიცრები',
            text_en: 'Carefully remove boards',
          },
          {
            text_ka: 'შეამოწმეთ კიდეები დაზიანებაზე',
            text_en: 'Check edges for damage',
          },
        ],
      },
    ],
    safety_notes: [
      {
        text_ka: `მინიმალური სისქე: ${isCommercial ? '15' : '10'}სმ ${isCommercial ? 'კომერციული' : 'საცხოვრებელი'} გამოყენებისთვის`,
        text_en: `Minimum thickness: ${isCommercial ? '15' : '10'}cm for ${isCommercial ? 'commercial' : 'residential'} use`,
        severity: 'warning',
        icon: 'ruler',
      },
      {
        text_ka: 'ხრეშის საფუძველი სავალდებულოა სტაბილურობისთვის',
        text_en: 'Gravel base is mandatory for stability',
        severity: 'critical',
        icon: 'layers',
      },
      {
        text_ka: 'ბეტონი აღიზიანებს კანს - გამოიყენეთ ხელთათმანები და ჩექმები',
        text_en: 'Concrete irritates skin - wear gloves and boots',
        severity: 'warning',
        icon: 'shield',
      },
      {
        text_ka: 'არ დაუშვათ წყლის დაგროვება ფილაზე გამაგრების დროს',
        text_en: "Don't allow water pooling on slab during curing",
        severity: 'info',
        icon: 'droplet',
      },
      ...(needsPump ? [{
        text_ka: 'დიდი მოცულობისთვის რეკომენდირებულია ბეტონის ტუმბო',
        text_en: 'Concrete pump is recommended for large volumes',
        severity: 'info' as const,
        icon: 'truck',
      }] : []),
    ],
  };
}
