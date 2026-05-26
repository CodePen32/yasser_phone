/**
 * Catalog normalization script.
 *
 * Usage:
 *   npm run catalog:check      — dry-run: prints report, touches nothing
 *   npm run catalog:normalize  — applies safe slug fixes to brands/categories
 *
 * What it does:
 *   1. Reports brands with slugs that look wrong (contain spaces, empty, etc.)
 *   2. Reports categories with bad slugs
 *   3. Reports products missing brand_id or category_id
 *   4. Reports products with invalid slugs
 *   5. Suggests / applies slug fixes using known mapping
 *
 * What it NEVER does:
 *   - Delete any row
 *   - Change prices, images, descriptions, or relations
 *   - Run without explicit DRY_RUN=false flag
 */

import { PrismaClient } from '@prisma/client';
import { isValidSlug } from '../src/lib/slug';

const prisma = new PrismaClient();

const DRY_RUN = process.env.DRY_RUN !== 'false';

// ── Known name → slug mapping (Arabic + English variants) ────────────────────
const NAME_TO_SLUG: Record<string, string> = {
  // Brands
  'apple':          'apple',
  'آيفون':          'apple',
  'iphone':         'apple',
  'samsung':        'samsung',
  'سامسونج':        'samsung',
  'xiaomi':         'xiaomi',
  'شاومي':          'xiaomi',
  'tecno':          'tecno',
  'تكنو':           'tecno',
  'infinix':        'infinix',
  'انفنكس':         'infinix',
  'إنفنكس':         'infinix',
  'huawei':         'huawei',
  'هواوي':          'huawei',
  'oppo':           'oppo',
  'أوبو':           'oppo',
  'vivo':           'vivo',
  'فيفو':           'vivo',
  'realme':         'realme',
  'ريلمي':          'realme',
  'nokia':          'nokia',
  'نوكيا':          'nokia',
  'motorola':       'motorola',
  'موتورولا':       'motorola',
  'oneplus':        'oneplus',
  'ون بلس':         'oneplus',

  // Categories
  'smartphones':         'smartphones',
  'هواتف ذكية':          'smartphones',
  'هاتف ذكي':            'smartphones',
  'phones':              'smartphones',
  'جوالات':              'smartphones',
  'موبايل':              'smartphones',
  'headphones':          'headphones',
  'سماعات':              'headphones',
  'audio':               'headphones',
  'chargers':            'chargers-cables',
  'chargers-cables':     'chargers-cables',
  'شواحن':               'chargers-cables',
  'شواحن وكابلات':       'chargers-cables',
  'accessories':         'accessories',
  'إكسسوارات':           'accessories',
  'اكسسوارات':           'accessories',
  'smartwatches':        'smartwatches',
  'ساعات ذكية':          'smartwatches',
  'watches':             'smartwatches',
  'tablets':             'tablets',
  'أجهزة لوحية':         'tablets',
  'لابتوب':              'laptops',
  'laptops':             'laptops',
  'gaming':              'gaming',
  'ألعاب':               'gaming',

  // Product name mappings (for products with Arabic-only slugs)
  'اسكام برو 18 نوفا':  'escam-pro-18-nova',
  'ايفون 18 برو ماكس':  'iphone-18-pro-max',
  'آيفون 18 برو ماكس':  'iphone-18-pro-max',
};

function suggestSlug(name: string): string | null {
  const key = name.trim().toLowerCase();
  return NAME_TO_SLUG[key] ?? null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function bold(s: string) { return `\x1b[1m${s}\x1b[0m`; }
function red(s: string)  { return `\x1b[31m${s}\x1b[0m`; }
function green(s: string){ return `\x1b[32m${s}\x1b[0m`; }
function yellow(s: string){ return `\x1b[33m${s}\x1b[0m`; }
function cyan(s: string) { return `\x1b[36m${s}\x1b[0m`; }

function section(title: string) {
  console.log('\n' + bold('━'.repeat(60)));
  console.log(bold(`  ${title}`));
  console.log(bold('━'.repeat(60)));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(bold('\n🔍  Yasser Phone — Catalog Normalizer'));
  console.log(DRY_RUN
    ? yellow('   Mode: DRY-RUN (no changes will be made)')
    : red(   '   Mode: LIVE   (changes will be written to DB)'));

  let fixCount = 0;
  let problemCount = 0;

  // ── 1. Brands ───────────────────────────────────────────────────────────────
  section('1. Brands');
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });

  for (const b of brands) {
    const valid   = isValidSlug(b.slug);
    const suggest = suggestSlug(b.name);
    const line    = `  brand #${b.id} "${b.name}"  slug="${b.slug}"`;

    if (valid) {
      console.log(green('  ✓') + line);
    } else {
      problemCount++;
      if (suggest) {
        console.log(yellow('  ⚠') + line + `  →  suggest: "${suggest}"`);
        if (!DRY_RUN) {
          await prisma.brand.update({ where: { id: b.id }, data: { slug: suggest } });
          console.log(green('    ✅ fixed'));
          fixCount++;
        }
      } else {
        console.log(red('  ✗') + line + '  (no suggestion — fix manually)');
      }
    }
  }
  if (brands.length === 0) console.log('  (no brands in DB)');

  // ── 2. Categories ───────────────────────────────────────────────────────────
  section('2. Categories');
  const categories = await prisma.category.findMany({ orderBy: { name_ar: 'asc' } });

  for (const c of categories) {
    const valid   = isValidSlug(c.slug);
    const suggest = suggestSlug(c.name_ar);
    const line    = `  category #${c.id} "${c.name_ar}"  slug="${c.slug}"`;

    if (valid) {
      console.log(green('  ✓') + line);
    } else {
      problemCount++;
      if (suggest) {
        console.log(yellow('  ⚠') + line + `  →  suggest: "${suggest}"`);
        if (!DRY_RUN) {
          await prisma.category.update({ where: { id: c.id }, data: { slug: suggest } });
          console.log(green('    ✅ fixed'));
          fixCount++;
        }
      } else {
        console.log(red('  ✗') + line + '  (no suggestion — fix manually in admin)');
      }
    }
  }
  if (categories.length === 0) console.log('  (no categories in DB)');

  // ── 3. Products without brand_id ────────────────────────────────────────────
  section('3. Products missing brand_id');
  const noBrand = await prisma.product.findMany({
    where:   { brand_id: null },
    select:  { id: true, name_ar: true, slug: true },
    orderBy: { id: 'asc' },
  });
  if (noBrand.length === 0) {
    console.log(green('  ✓ All products have a brand.'));
  } else {
    for (const p of noBrand) {
      problemCount++;
      console.log(red(`  ✗ product #${p.id} "${p.name_ar}"  (slug=${p.slug}) — no brand`));
    }
    console.log(yellow(`\n  → Fix via admin panel: /admin/products`));
  }

  // ── 4. Products without category_id ─────────────────────────────────────────
  section('4. Products missing category_id');
  const noCat = await prisma.product.findMany({
    where:   { category_id: null },
    select:  { id: true, name_ar: true, slug: true },
    orderBy: { id: 'asc' },
  });
  if (noCat.length === 0) {
    console.log(green('  ✓ All products have a category.'));
  } else {
    for (const p of noCat) {
      problemCount++;
      console.log(red(`  ✗ product #${p.id} "${p.name_ar}"  (slug=${p.slug}) — no category`));
    }
    console.log(yellow(`\n  → Fix via admin panel: /admin/products`));
  }

  // ── 5. Products with invalid slug ───────────────────────────────────────────
  section('5. Products with invalid slug');
  const allProducts = await prisma.product.findMany({
    select: { id: true, name_ar: true, slug: true },
    orderBy: { id: 'asc' },
  });
  const badSlug = allProducts.filter((p) => !isValidSlug(p.slug));
  if (badSlug.length === 0) {
    console.log(green('  ✓ All product slugs are valid.'));
  } else {
    for (const p of badSlug) {
      const suggest = suggestSlug(p.name_ar);
      const line    = `  product #${p.id} "${p.name_ar}"  slug="${p.slug}"`;
      if (suggest) {
        problemCount++;
        console.log(yellow('  ⚠') + line + `  →  suggest: "${suggest}"`);
        if (!DRY_RUN) {
          await prisma.product.update({ where: { id: p.id }, data: { slug: suggest } });
          console.log(green('    ✅ fixed'));
          fixCount++;
        }
      } else {
        problemCount++;
        console.log(red('  ✗') + line + '  (no suggestion — fix manually in admin)');
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  section('Summary');
  console.log(`  ${cyan('Total problems found:')} ${problemCount}`);
  if (!DRY_RUN) {
    console.log(`  ${green('Auto-fixed slug issues:')} ${fixCount}`);
    console.log(`  ${yellow('Manual fixes still needed:')} ${problemCount - fixCount}`);
  } else {
    console.log(`  ${yellow('Run "npm run catalog:normalize" to apply safe auto-fixes.')}`);
  }
  console.log('');
}

main()
  .catch((err) => {
    console.error('❌  Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
