import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Yasser Phone database...');

  // ── 1. Store Settings ──────────────────────────────────────────────────────
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      store_name:      'Yasser Phone',
      slogan:          'Premium Mobile Store',
      whatsapp_number: '22232816779',
      phone:           '+222 32 81 67 79',
      email:           'contact@yasserphone.mr',
      address:         'نواكشوط — النقطة الساخنة',
      city:            'نواكشوط',
      currency:        'MRU',
      facebook_url:    'https://facebook.com/yasserphone',
      instagram_url:   'https://instagram.com/yasserphone',
      tiktok_url:      'https://tiktok.com/@yasserphone',
    },
  });
  console.log('  ✓ Store settings');

  // ── 2. Categories (8) ──────────────────────────────────────────────────────
  const categoriesData = [
    { name_ar: 'هواتف ذكية',  slug: 'phones',      sort_order: 1 },
    { name_ar: 'سماعات',      slug: 'audio',       sort_order: 2 },
    { name_ar: 'ساعات ذكية',  slug: 'watches',     sort_order: 3 },
    { name_ar: 'شواحن',       slug: 'chargers',    sort_order: 4 },
    { name_ar: 'إكسسوارات',  slug: 'accessories', sort_order: 5 },
    { name_ar: 'باور بانك',   slug: 'powerbanks',  sort_order: 6 },
    { name_ar: 'حافظات',      slug: 'cases',       sort_order: 7 },
    { name_ar: 'كابلات',      slug: 'cables',      sort_order: 8 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: { ...cat, is_active: true },
    });
  }
  console.log('  ✓ 8 categories');

  // ── 3. Brands (8) ─────────────────────────────────────────────────────────
  const brandsData = [
    { name: 'Apple',   slug: 'apple'   },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Xiaomi',  slug: 'xiaomi'  },
    { name: 'Tecno',   slug: 'tecno'   },
    { name: 'Infinix', slug: 'infinix' },
    { name: 'Huawei',  slug: 'huawei'  },
    { name: 'Oppo',    slug: 'oppo'    },
    { name: 'Realme',  slug: 'realme'  },
  ];

  for (const brand of brandsData) {
    await prisma.brand.upsert({
      where:  { slug: brand.slug },
      update: {},
      create: { ...brand, is_active: true },
    });
  }
  console.log('  ✓ 8 brands');

  // ── Resolve IDs ────────────────────────────────────────────────────────────
  const [
    catPhones, catAudio, catWatches, catChargers, catAccess,
    catPower, catCases, catCables,
  ] = await Promise.all([
    prisma.category.findUniqueOrThrow({ where: { slug: 'phones' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'audio' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'watches' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'chargers' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'accessories' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'powerbanks' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'cases' } }),
    prisma.category.findUniqueOrThrow({ where: { slug: 'cables' } }),
  ]);

  const [
    bApple, bSamsung, bXiaomi, bTecno, bInfinix, bHuawei, bOppo, bRealme,
  ] = await Promise.all([
    prisma.brand.findUniqueOrThrow({ where: { slug: 'apple' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'samsung' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'xiaomi' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'tecno' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'infinix' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'huawei' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'oppo' } }),
    prisma.brand.findUniqueOrThrow({ where: { slug: 'realme' } }),
  ]);

  // ── 4. Products (30) ──────────────────────────────────────────────────────
  type ProductSeed = {
    slug: string;
    name_ar: string;
    description_ar: string;
    price: number;
    old_price?: number | null;
    discount_percent?: number | null;
    main_image_url: string;
    brand_id: number;
    category_id: number;
    condition: string;
    storage?: string | null;
    ram?: string | null;
    color?: string | null;
    warranty?: string | null;
    is_featured: boolean;
    is_offer: boolean;
    rating?: number | null;
    review_count: number;
    bought_recently: number;
    images: string[];
    specs: { name: string; value: string }[];
  };

  const products: ProductSeed[] = [
    // ── Phones ─────────────────────────────────────────────────────────────
    {
      slug: 'iphone-15-pro-max', name_ar: 'آيفون 15 برو ماكس',
      description_ar: 'هاتف iPhone 15 Pro Max الجديد بشاشة Super Retina XDR قياس 6.7 إنش، معالج A17 Pro، كاميرا ثلاثية 48 ميجابكسل مع زوم بصري 5x، وهيكل من التيتانيوم.',
      price: 58000, old_price: 62000, discount_percent: 6,
      main_image_url: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80',
      brand_id: bApple.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '8GB', color: 'Natural Titanium', warranty: '12 شهر',
      is_featured: true, is_offer: true, rating: 4.8, review_count: 59, bought_recently: 53,
      images: [
        'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80',
        'https://images.unsplash.com/photo-1696446702183-be1cb88a9eda?w=800&q=80',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      ],
      specs: [
        { name: 'الشاشة', value: '6.7" Super Retina XDR' },
        { name: 'المعالج', value: 'A17 Pro' },
        { name: 'الكاميرا', value: '48MP Triple' },
        { name: 'البطارية', value: '4422 mAh' },
        { name: 'نظام التشغيل', value: 'iOS 17' },
      ],
    },
    {
      slug: 'samsung-galaxy-s24-ultra', name_ar: 'سامسونج جالاكسي S24 الترا',
      description_ar: 'سامسونج جالاكسي S24 الترا بشاشة Dynamic AMOLED 2X بقياس 6.8 إنش، معالج Snapdragon 8 Gen 3 وقلم S Pen، كاميرا 200 ميجابكسل.',
      price: 52000, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
      brand_id: bSamsung.id, category_id: catPhones.id,
      condition: 'new', storage: '512GB', ram: '12GB', color: 'Titanium Black', warranty: '12 شهر',
      is_featured: true, is_offer: false, rating: 4.4, review_count: 560, bought_recently: 364,
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
        'https://images.unsplash.com/photo-1611791484670-ce19b801d192?w=800&q=80',
      ],
      specs: [
        { name: 'الشاشة', value: '6.8" QHD+ AMOLED' },
        { name: 'المعالج', value: 'Snapdragon 8 Gen 3' },
        { name: 'الكاميرا', value: '200MP Quad' },
        { name: 'البطارية', value: '5000 mAh' },
        { name: 'نظام التشغيل', value: 'Android 14' },
      ],
    },
    {
      slug: 'xiaomi-14-ultra', name_ar: 'شاومي 14 الترا',
      description_ar: 'شاومي 14 الترا مع كاميرا Leica رباعية وعدسة بريسكوب 5x، شاشة LTPO AMOLED، ومعالج Snapdragon 8 Gen 3.',
      price: 42000, old_price: 46000, discount_percent: 9,
      main_image_url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80',
      brand_id: bXiaomi.id, category_id: catPhones.id,
      condition: 'new', storage: '512GB', ram: '16GB', color: 'White', warranty: '12 شهر',
      is_featured: true, is_offer: true, rating: 3.8, review_count: 94, bought_recently: 75,
      images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.73" LTPO AMOLED' },
        { name: 'المعالج', value: 'Snapdragon 8 Gen 3' },
        { name: 'الكاميرا', value: '50MP Quad Leica' },
        { name: 'البطارية', value: '5300 mAh' },
      ],
    },
    {
      slug: 'iphone-14', name_ar: 'آيفون 14',
      description_ar: 'آيفون 14 بشاشة Super Retina XDR 6.1 إنش وكاميرا مزدوجة 12 ميجابكسل.',
      price: 38000, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80',
      brand_id: bApple.id, category_id: catPhones.id,
      condition: 'new', storage: '128GB', ram: '6GB', color: 'Blue', warranty: '12 شهر',
      is_featured: false, is_offer: false, rating: 3.9, review_count: 165, bought_recently: 119,
      images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.1" Super Retina XDR' },
        { name: 'المعالج', value: 'A15 Bionic' },
        { name: 'الكاميرا', value: '12MP Dual' },
        { name: 'البطارية', value: '3279 mAh' },
      ],
    },
    {
      slug: 'iphone-14-pro', name_ar: 'آيفون 14 برو',
      description_ar: 'آيفون 14 برو بشاشة Always-On وكاميرا 48 ميجابكسل ومعالج A16 Bionic.',
      price: 44000, old_price: 48000, discount_percent: 8,
      main_image_url: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80',
      brand_id: bApple.id, category_id: catPhones.id,
      condition: 'new', storage: '128GB', ram: '6GB', color: 'Deep Purple', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.6, review_count: 312, bought_recently: 200,
      images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.1" Super Retina XDR' },
        { name: 'المعالج', value: 'A16 Bionic' },
        { name: 'الكاميرا', value: '48MP Triple' },
      ],
    },
    {
      slug: 'iphone-13-used', name_ar: 'آيفون 13 (مستعمل)',
      description_ar: 'آيفون 13 مستعمل بحالة ممتازة، بطارية 92%، شامل الكرتونة الأصلية.',
      price: 22000, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80',
      brand_id: bApple.id, category_id: catPhones.id,
      condition: 'used', storage: '128GB', ram: '4GB', color: 'Midnight', warranty: '3 أشهر',
      is_featured: false, is_offer: false, rating: 4.7, review_count: 809, bought_recently: 517,
      images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80'],
      specs: [
        { name: 'الحالة', value: 'مستعمل — بطارية 92%' },
        { name: 'الشاشة', value: '6.1" Super Retina XDR' },
      ],
    },
    {
      slug: 'samsung-galaxy-a55-5g', name_ar: 'سامسونج جالاكسي A55 5G',
      description_ar: 'جالاكسي A55 5G بشاشة Super AMOLED ومعالج Exynos 1480.',
      price: 13500, old_price: 15000, discount_percent: 10,
      main_image_url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80',
      brand_id: bSamsung.id, category_id: catPhones.id,
      condition: 'new', storage: '128GB', ram: '8GB', color: 'Awesome Iceblue', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.1, review_count: 342, bought_recently: 228,
      images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.6" Super AMOLED 120Hz' },
        { name: 'المعالج', value: 'Exynos 1480' },
        { name: 'الكاميرا', value: '50MP Triple' },
        { name: 'البطارية', value: '5000 mAh' },
      ],
    },
    {
      slug: 'redmi-note-13-pro', name_ar: 'شاومي ريدمي نوت 13 برو',
      description_ar: 'ريدمي نوت 13 برو بكاميرا 200 ميجابكسل وشاشة AMOLED 120 هرتز.',
      price: 14500, old_price: 16000, discount_percent: 9,
      main_image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
      brand_id: bXiaomi.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '8GB', color: 'Forest Green', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.5, review_count: 667, bought_recently: 430,
      images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.67" AMOLED 120Hz' },
        { name: 'الكاميرا', value: '200MP Triple' },
        { name: 'المعالج', value: 'Snapdragon 7s Gen 2' },
        { name: 'البطارية', value: '5100 mAh' },
      ],
    },
    {
      slug: 'redmi-note-14-5g', name_ar: 'شاومي ريدمي نوت 14 5G',
      description_ar: 'ريدمي نوت 14 5G بشاشة AMOLED 120 هرتز وكاميرا 108 ميجابكسل.',
      price: 12500, old_price: 14000, discount_percent: 11,
      main_image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
      brand_id: bXiaomi.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '8GB', color: 'Ocean Blue', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.7, review_count: 1240, bought_recently: 400,
      images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.67" AMOLED 120Hz' },
        { name: 'الكاميرا', value: '108MP Triple' },
        { name: 'المعالج', value: 'Dimensity 7300' },
      ],
    },
    {
      slug: 'tecno-camon-30-pro', name_ar: 'تكنو كامون 30 برو',
      description_ar: 'تكنو كامون 30 برو مع كاميرا Sony LYT-600 وشاشة AMOLED 6.78 إنش.',
      price: 11500, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
      brand_id: bTecno.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '12GB', color: 'Basaltic Dark', warranty: '12 شهر',
      is_featured: false, is_offer: false, rating: 4.0, review_count: 200, bought_recently: 141,
      images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.78" AMOLED' },
        { name: 'المعالج', value: 'Dimensity 8200' },
        { name: 'الكاميرا', value: '50MP Sony LYT-600' },
      ],
    },
    {
      slug: 'tecno-spark-30-pro', name_ar: 'تكنو سبارك 30 برو',
      description_ar: 'تكنو سبارك 30 برو بكاميرا 108 ميجابكسل وشاشة AMOLED 120 هرتز.',
      price: 7200, old_price: 8500, discount_percent: 15,
      main_image_url: 'https://images.unsplash.com/photo-1601972602288-3be527b4f1d8?w=800&q=80',
      brand_id: bTecno.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '8GB', color: 'Magic Skin Orange', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.5, review_count: 95, bought_recently: 60,
      images: ['https://images.unsplash.com/photo-1601972602288-3be527b4f1d8?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.78" AMOLED 120Hz' },
        { name: 'الكاميرا', value: '108MP Dual' },
        { name: 'البطارية', value: '5000 mAh' },
      ],
    },
    {
      slug: 'infinix-note-40-pro', name_ar: 'إنفنكس نوت 40 برو',
      description_ar: 'إنفنكس نوت 40 برو بشحن لاسلكي 20W وكاميرا 108 ميجابكسل.',
      price: 9800, old_price: 11000, discount_percent: 11,
      main_image_url: 'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=800&q=80',
      brand_id: bInfinix.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '12GB', color: 'Vintage Green', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.5, review_count: 702, bought_recently: 451,
      images: ['https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.78" AMOLED 120Hz' },
        { name: 'الكاميرا', value: '108MP Triple' },
        { name: 'الشحن اللاسلكي', value: '20W' },
      ],
    },
    {
      slug: 'oppo-reno-11-pro', name_ar: 'أوبو رينو 11 برو',
      description_ar: 'أوبو رينو 11 برو بكاميرا 50 ميجابكسل ومعالج Snapdragon 8 Gen 2.',
      price: 18500, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      brand_id: bOppo.id, category_id: catPhones.id,
      condition: 'new', storage: '256GB', ram: '12GB', color: 'Pearl White', warranty: '12 شهر',
      is_featured: false, is_offer: false, rating: 4.7, review_count: 844, bought_recently: 539,
      images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '6.7" AMOLED 120Hz' },
        { name: 'المعالج', value: 'Snapdragon 8 Gen 2' },
        { name: 'الكاميرا', value: '50MP Triple' },
      ],
    },
    {
      slug: 'realme-gt-5-pro', name_ar: 'ريلمي GT 5 برو',
      description_ar: 'ريلمي GT 5 برو بمعالج Snapdragon 8 Gen 3 وشحن سريع 100W.',
      price: 24500, old_price: 27000, discount_percent: 9,
      main_image_url: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&q=80',
      brand_id: bRealme.id, category_id: catPhones.id,
      condition: 'new', storage: '512GB', ram: '16GB', color: 'Red Rover', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.2, review_count: 378, bought_recently: 250,
      images: ['https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&q=80'],
      specs: [
        { name: 'المعالج', value: 'Snapdragon 8 Gen 3' },
        { name: 'الشحن السريع', value: '100W' },
        { name: 'البطارية', value: '5400 mAh' },
      ],
    },
    {
      slug: 'realme-c75', name_ar: 'ريلمي C75',
      description_ar: 'ريلمي C75 بمقاومة الماء IP69 وبطارية ضخمة 6000 mAh.',
      price: 6500, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&q=80',
      brand_id: bRealme.id, category_id: catPhones.id,
      condition: 'new', storage: '128GB', ram: '6GB', color: 'Storm Blue', warranty: '12 شهر',
      is_featured: false, is_offer: false, rating: 4.3, review_count: 67, bought_recently: 35,
      images: ['https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&q=80'],
      specs: [
        { name: 'البطارية', value: '6000 mAh' },
        { name: 'مقاومة الماء', value: 'IP69' },
      ],
    },
    {
      slug: 'honor-magic-v5', name_ar: 'هونر ماجيك V5',
      description_ar: 'هاتف Honor Magic V5 القابل للطي مع كاميرا متقدمة وشاشة AMOLED LTPO.',
      price: 56000, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&q=80',
      brand_id: bHuawei.id, category_id: catPhones.id,
      condition: 'new', storage: '512GB', ram: '16GB', color: 'Charcoal', warranty: '12 شهر',
      is_featured: false, is_offer: false, rating: 4.4, review_count: 188, bought_recently: 100,
      images: ['https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '7.92" LTPO AMOLED' },
        { name: 'المعالج', value: 'Snapdragon 8 Gen 3' },
      ],
    },
    // ── Audio (4) ───────────────────────────────────────────────────────────
    {
      slug: 'airpods-pro-2', name_ar: 'إيربودز برو 2',
      description_ar: 'سماعات AirPods Pro 2 مع إلغاء الضوضاء النشط، شريحة H2، وعلبة شحن MagSafe USB-C.',
      price: 6500, old_price: 7200, discount_percent: 10,
      main_image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
      brand_id: bApple.id, category_id: catAudio.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: true, is_offer: true, rating: 4.4, review_count: 560, bought_recently: 408,
      images: [
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80',
      ],
      specs: [{ name: 'البطارية', value: '6h + 30h case' }, { name: 'إلغاء الضوضاء', value: 'نشط — ANC' }],
    },
    {
      slug: 'airpods-4', name_ar: 'إيربودز 4',
      description_ar: 'AirPods 4 الجيل الجديد مع تصميم جديد وجودة صوت محسنة.',
      price: 5200, old_price: 5800, discount_percent: 10,
      main_image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
      brand_id: bApple.id, category_id: catAudio.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.6, review_count: 410, bought_recently: 180,
      images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80'],
      specs: [{ name: 'البطارية', value: '5h + 30h case' }],
    },
    {
      slug: 'samsung-galaxy-buds3-pro', name_ar: 'سامسونج جالاكسي بادز 3 برو',
      description_ar: 'سماعات Galaxy Buds3 Pro بصوت Hi-Fi 24-bit وإلغاء ضوضاء تكيفي.',
      price: 4800, old_price: 5500, discount_percent: 13,
      main_image_url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80',
      brand_id: bSamsung.id, category_id: catAudio.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: false, is_offer: true, rating: 4.5, review_count: 631, bought_recently: 408,
      images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80'],
      specs: [{ name: 'البطارية', value: '7h + 30h case' }, { name: 'الصوت', value: 'Hi-Fi 24-bit' }],
    },
    {
      slug: 'sony-wh-1000xm5', name_ar: 'سماعات Sony WH-1000XM5',
      description_ar: 'سماعات Sony WH-1000XM5 — قمة عزل الضوضاء بصوت احترافي.',
      price: 11000, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
      brand_id: bSamsung.id, category_id: catAudio.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: true, is_offer: false, rating: 4.7, review_count: 879, bought_recently: 561,
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'],
      specs: [{ name: 'البطارية', value: '30 hours' }, { name: 'إلغاء الضوضاء', value: 'Industry-leading ANC' }],
    },
    // ── Watches (3) ─────────────────────────────────────────────────────────
    {
      slug: 'apple-watch-series-9', name_ar: 'ساعة آبل سيريس 9',
      description_ar: 'ساعة Apple Watch Series 9 بشاشة Retina دائمة الإضاءة، شريحة S9، وميزات صحية متقدمة.',
      price: 12500, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      brand_id: bApple.id, category_id: catWatches.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: true, is_offer: false, rating: 3.9, review_count: 129, bought_recently: 97,
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
      ],
      specs: [
        { name: 'الشاشة', value: '1.9" Retina Always-On' },
        { name: 'المعالج', value: 'S9 SiP' },
        { name: 'البطارية', value: '18 ساعة' },
      ],
    },
    {
      slug: 'apple-watch-ultra-2', name_ar: 'ساعة Apple Watch Ultra 2',
      description_ar: 'Apple Watch Ultra 2 — أقوى ساعة آبل بهيكل تيتانيوم وشاشة 3000 نت.',
      price: 32000, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&q=80',
      brand_id: bApple.id, category_id: catWatches.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: true, is_offer: false, rating: 4.8, review_count: 950, bought_recently: 5,
      images: [
        'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&q=80',
        'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
      ],
      specs: [
        { name: 'الشاشة', value: '1.92" Retina 3000 nits' },
        { name: 'البطارية', value: '36 ساعة' },
        { name: 'الهيكل', value: 'تيتانيوم' },
      ],
    },
    {
      slug: 'huawei-watch-gt-4', name_ar: 'هواوي ووتش GT 4',
      description_ar: 'ساعة هواوي GT 4 بتصميم أنيق وعمر بطارية يصل إلى 14 يوماً.',
      price: 8500, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&q=80',
      brand_id: bHuawei.id, category_id: catWatches.id,
      condition: 'new', warranty: '12 شهر',
      is_featured: false, is_offer: false, rating: 4.0, review_count: 236, bought_recently: 162,
      images: ['https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '1.43" AMOLED' },
        { name: 'البطارية', value: '14 يوماً' },
      ],
    },
    // ── Chargers (2) ────────────────────────────────────────────────────────
    {
      slug: 'apple-charger-20w', name_ar: 'شاحن Apple 20W USB-C',
      description_ar: 'شاحن Apple الأصلي 20W USB-C مع شحن سريع.',
      price: 850, old_price: 1100, discount_percent: 23,
      main_image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
      brand_id: bApple.id, category_id: catChargers.id,
      condition: 'new', warranty: '6 أشهر',
      is_featured: false, is_offer: true, rating: 4.6, review_count: 738, bought_recently: 473,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'],
      specs: [{ name: 'القدرة', value: '20W USB-C' }],
    },
    {
      slug: 'samsung-charger-45w', name_ar: 'شاحن Samsung 45W Super Fast',
      description_ar: 'شاحن سامسونج 45W الأصلي للشحن فائق السرعة.',
      price: 1200, old_price: 1450, discount_percent: 17,
      main_image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
      brand_id: bSamsung.id, category_id: catChargers.id,
      condition: 'new', warranty: '6 أشهر',
      is_featured: false, is_offer: true, rating: 4.3, review_count: 449, bought_recently: 294,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'],
      specs: [{ name: 'القدرة', value: '45W Super Fast' }],
    },
    // ── Accessories (3) ─────────────────────────────────────────────────────
    {
      slug: 'anker-powerbank-20000', name_ar: 'باور بانك Anker 20000mAh',
      description_ar: 'باور بانك Anker بسعة 20000mAh مع شحن سريع 22.5W.',
      price: 1850, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      brand_id: bHuawei.id, category_id: catAccess.id,
      condition: 'new', warranty: '18 شهر',
      is_featured: false, is_offer: false, rating: 4.1, review_count: 307, bought_recently: 206,
      images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80'],
      specs: [{ name: 'السعة', value: '20000 mAh' }, { name: 'الشحن السريع', value: '22.5W' }],
    },
    {
      slug: 'jbl-tune-770nc', name_ar: 'سماعات JBL Tune 770NC',
      description_ar: 'سماعات JBL Tune 770NC اللاسلكية مع إلغاء ضوضاء نشط وبطارية تدوم 70 ساعة.',
      price: 3200, old_price: 3800, discount_percent: 16,
      main_image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      brand_id: bHuawei.id, category_id: catAccess.id,
      condition: 'new', warranty: '6 أشهر',
      is_featured: false, is_offer: true, rating: 4.6, review_count: 773, bought_recently: 495,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
      specs: [{ name: 'البطارية', value: '70 ساعة' }],
    },
    {
      slug: 'iphone-15-promax-case', name_ar: 'كفر iPhone 15 Pro Max جلد',
      description_ar: 'كفر جلد طبيعي فاخر لـ iPhone 15 Pro Max مع MagSafe.',
      price: 750, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80',
      brand_id: bApple.id, category_id: catCases.id,
      condition: 'new', warranty: '3 أشهر',
      is_featured: false, is_offer: false, rating: 4.8, review_count: 915, bought_recently: 583,
      images: ['https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80'],
      specs: [{ name: 'التوافق', value: 'iPhone 15 Pro Max' }, { name: 'MagSafe', value: 'متوافق' }],
    },
    // ── Cables + PowerBanks (2) ──────────────────────────────────────────────
    {
      slug: 'apple-usbc-lightning-2m', name_ar: 'كابل USB-C to Lightning 2م',
      description_ar: 'كابل أصلي من Apple بطول 2 متر للشحن السريع ونقل البيانات.',
      price: 450, old_price: null, discount_percent: null,
      main_image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
      brand_id: bApple.id, category_id: catCables.id,
      condition: 'new', warranty: '3 أشهر',
      is_featured: false, is_offer: false, rating: 4.1, review_count: 271, bought_recently: 184,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'],
      specs: [{ name: 'الطول', value: '2 متر' }, { name: 'النوع', value: 'USB-C to Lightning' }],
    },
    {
      slug: 'xiaomi-smart-band-9', name_ar: 'شاومي سمارت باند 9',
      description_ar: 'سوار شاومي 9 بشاشة AMOLED 1.62 إنش وعمر بطارية 21 يوماً.',
      price: 1450, old_price: 1750, discount_percent: 17,
      main_image_url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
      brand_id: bXiaomi.id, category_id: catPower.id,
      condition: 'new', warranty: '6 أشهر',
      is_featured: false, is_offer: true, rating: 4.2, review_count: 413, bought_recently: 272,
      images: ['https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80'],
      specs: [
        { name: 'الشاشة', value: '1.62" AMOLED' },
        { name: 'البطارية', value: '21 يوماً' },
      ],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) { skipped++; continue; }

    const { images, specs, ...productData } = p;

    await prisma.product.create({
      data: {
        ...productData,
        is_active:    true,
        stock_status: 'in_stock',
        currency:     'MRU',
        images: {
          create: images.map((url, i) => ({ image_url: url, sort_order: i })),
        },
        specs: {
          create: specs.map((s) => ({ spec_name: s.name, spec_value: s.value })),
        },
      },
    });
    created++;
  }

  console.log(`  ✓ Products: ${created} created, ${skipped} skipped (already exist)`);

  // ── 5. Admin user ──────────────────────────────────────────────────────────
  // Password: admin123 (bcrypt hash — change immediately in production!)
  const adminHash = '$2a$10$gObA8mdJaBoA3bRSpXhE8.Inw5pPJUA7iLJ0Ks0uSpKYI6If5HrcK';
  await prisma.admin.upsert({
    where:  { email: 'admin@yasserphone.mr' },
    update: {},
    create: {
      name:          'Yasser Admin',
      email:         'admin@yasserphone.mr',
      password_hash: adminHash,
      role:          'superadmin',
    },
  });
  console.log('  ✓ Admin user (email: admin@yasserphone.mr) — change password immediately in production!');

  console.log('\n✅ Seeding complete!');
  console.log('   Run `npm run db:studio` to inspect the data.');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
