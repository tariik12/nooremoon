import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedKidsDemoData20260620000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── Boys Panjabi (13 products) ─────────────────────────────────────────

    // Product K1: Sky Blue Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Sky Blue Boys Panjabi','sky-blue-boys-panjabi',
          'A cheerful sky blue panjabi perfect for Eid and family celebrations. Soft cotton keeps little ones comfortable all day.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 2499, 0, 2499, 80, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Sky Blue Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB1-2Y-SKY','2Y','Sky Blue',15 FROM p UNION ALL
        SELECT id,'KB1-4Y-SKY','4Y','Sky Blue',20 FROM p UNION ALL
        SELECT id,'KB1-6Y-SKY','6Y','Sky Blue',20 FROM p UNION ALL
        SELECT id,'KB1-8Y-SKY','8Y','Sky Blue',15 FROM p UNION ALL
        SELECT id,'KB1-10Y-SKY','10Y','Sky Blue',10 FROM p
    `);

    // Product K2: Ivory White Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Ivory White Boys Panjabi','ivory-white-boys-panjabi',
          'A pristine ivory panjabi with delicate gold embroidery on the collar. The Legends Edit for your little prince.',
          'Dry clean only. Store in a garment bag.',
          cat.id, sub.id, tier.id, false, 7499, 0, 7499, 30, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80','Ivory White Boys Panjabi',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80','Ivory White Boys Panjabi detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB2-2Y-IVORY','2Y','Ivory',5 FROM p UNION ALL
        SELECT id,'KB2-4Y-IVORY','4Y','Ivory',8 FROM p UNION ALL
        SELECT id,'KB2-6Y-IVORY','6Y','Ivory',8 FROM p UNION ALL
        SELECT id,'KB2-8Y-IVORY','8Y','Ivory',6 FROM p UNION ALL
        SELECT id,'KB2-10Y-IVORY','10Y','Ivory',3 FROM p
    `);

    // Product K3: Mint Green Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Mint Green Boys Panjabi','mint-green-boys-panjabi',
          'Fresh mint green in a breathable CottoCool blend. Perfect for summer celebrations and everyday wear.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 3999, 0, 3999, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Mint Green Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB3-2Y-MINT','2Y','Mint Green',12 FROM p UNION ALL
        SELECT id,'KB3-4Y-MINT','4Y','Mint Green',15 FROM p UNION ALL
        SELECT id,'KB3-6Y-MINT','6Y','Mint Green',18 FROM p UNION ALL
        SELECT id,'KB3-8Y-MINT','8Y','Mint Green',10 FROM p UNION ALL
        SELECT id,'KB3-10Y-MINT','10Y','Mint Green',5 FROM p
    `);

    // Product K4: Royal Purple Boys Panjabi (flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Royal Purple Boys Panjabi','royal-purple-boys-panjabi',
          'Deep royal purple with silver thread work. A showstopper for your little one at weddings and festive occasions.',
          'Dry clean only.',
          cat.id, sub.id, tier.id, false, true, 8999, 20, 7199, 25, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','Royal Purple Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB4-2Y-PURP','2Y','Royal Purple',5 FROM p UNION ALL
        SELECT id,'KB4-4Y-PURP','4Y','Royal Purple',7 FROM p UNION ALL
        SELECT id,'KB4-6Y-PURP','6Y','Royal Purple',7 FROM p UNION ALL
        SELECT id,'KB4-8Y-PURP','8Y','Royal Purple',4 FROM p UNION ALL
        SELECT id,'KB4-10Y-PURP','10Y','Royal Purple',2 FROM p
    `);

    // Product K5: Terracotta Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Terracotta Boys Panjabi','terracotta-boys-panjabi',
          'Warm terracotta tones in a structured cotton weave. Pairs beautifully with ivory and gold accessories.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, false, 4499, 0, 4499, 45, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Terracotta Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB5-2Y-TERRA','2Y','Terracotta',8 FROM p UNION ALL
        SELECT id,'KB5-4Y-TERRA','4Y','Terracotta',12 FROM p UNION ALL
        SELECT id,'KB5-6Y-TERRA','6Y','Terracotta',12 FROM p UNION ALL
        SELECT id,'KB5-8Y-TERRA','8Y','Terracotta',9 FROM p UNION ALL
        SELECT id,'KB5-10Y-TERRA','10Y','Terracotta',4 FROM p
    `);

    // Product K6: Sunshine Yellow Boys Panjabi (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Sunshine Yellow Boys Panjabi','sunshine-yellow-boys-panjabi',
          'Bright sunshine yellow that little ones love. Lightweight cotton that is easy to wash and wear again and again.',
          'Machine wash warm. Tumble dry low.',
          cat.id, sub.id, tier.id, true, 1999, 10, 1799, 100, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Sunshine Yellow Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB6-2Y-YLW','2Y','Yellow',20 FROM p UNION ALL
        SELECT id,'KB6-4Y-YLW','4Y','Yellow',25 FROM p UNION ALL
        SELECT id,'KB6-6Y-YLW','6Y','Yellow',25 FROM p UNION ALL
        SELECT id,'KB6-8Y-YLW','8Y','Yellow',20 FROM p UNION ALL
        SELECT id,'KB6-10Y-YLW','10Y','Yellow',10 FROM p
    `);

    // Product K7: Crimson Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Crimson Boys Panjabi','crimson-boys-panjabi',
          'Bold crimson with tone-on-tone embroidery. A standout choice for Eid and special celebrations.',
          'Dry clean preferred. Machine wash cold on delicate.',
          cat.id, sub.id, tier.id, false, 6999, 0, 6999, 35, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=800&q=80','Crimson Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB7-2Y-CRIM','2Y','Crimson',6 FROM p UNION ALL
        SELECT id,'KB7-4Y-CRIM','4Y','Crimson',10 FROM p UNION ALL
        SELECT id,'KB7-6Y-CRIM','6Y','Crimson',10 FROM p UNION ALL
        SELECT id,'KB7-8Y-CRIM','8Y','Crimson',6 FROM p UNION ALL
        SELECT id,'KB7-10Y-CRIM','10Y','Crimson',3 FROM p
    `);

    // Product K8: Slate Grey Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Slate Grey Boys Panjabi','slate-grey-boys-panjabi',
          'A versatile slate grey panjabi that pairs with any colour. Great for school events, family dinners, and casual outings.',
          'Machine wash cold. Do not bleach.',
          cat.id, sub.id, tier.id, false, 1999, 0, 1999, 90, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80','Slate Grey Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB8-2Y-GREY','2Y','Slate Grey',18 FROM p UNION ALL
        SELECT id,'KB8-4Y-GREY','4Y','Slate Grey',22 FROM p UNION ALL
        SELECT id,'KB8-6Y-GREY','6Y','Slate Grey',22 FROM p UNION ALL
        SELECT id,'KB8-8Y-GREY','8Y','Slate Grey',18 FROM p UNION ALL
        SELECT id,'KB8-10Y-GREY','10Y','Slate Grey',10 FROM p
    `);

    // Product K9: Olive Green Boys Panjabi (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Olive Green Boys Panjabi','olive-green-boys-panjabi',
          'Earthy olive green in a sturdy cotton blend. Rugged enough for active kids, smart enough for special days.',
          'Machine wash warm. Tumble dry low.',
          cat.id, sub.id, tier.id, false, 2499, 15, 2124, 70, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Olive Green Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB9-2Y-OLIVE','2Y','Olive Green',14 FROM p UNION ALL
        SELECT id,'KB9-4Y-OLIVE','4Y','Olive Green',18 FROM p UNION ALL
        SELECT id,'KB9-6Y-OLIVE','6Y','Olive Green',18 FROM p UNION ALL
        SELECT id,'KB9-8Y-OLIVE','8Y','Olive Green',12 FROM p UNION ALL
        SELECT id,'KB9-10Y-OLIVE','10Y','Olive Green',8 FROM p
    `);

    // Product K10: Indigo Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Indigo Boys Panjabi','indigo-boys-panjabi',
          'Rich indigo with subtle woven texture. The Signature craftsmanship means it looks better with every wash.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, false, 3999, 0, 3999, 50, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80','Indigo Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB10-2Y-IND','2Y','Indigo',10 FROM p UNION ALL
        SELECT id,'KB10-4Y-IND','4Y','Indigo',13 FROM p UNION ALL
        SELECT id,'KB10-6Y-IND','6Y','Indigo',13 FROM p UNION ALL
        SELECT id,'KB10-8Y-IND','8Y','Indigo',10 FROM p UNION ALL
        SELECT id,'KB10-10Y-IND','10Y','Indigo',4 FROM p
    `);

    // Product K11: Peach Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Peach Boys Panjabi','peach-boys-panjabi',
          'Soft peach in a breathable weave. A gentle, warm tone that photographs beautifully at family events.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 2299, 0, 2299, 65, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Peach Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB11-2Y-PEACH','2Y','Peach',12 FROM p UNION ALL
        SELECT id,'KB11-4Y-PEACH','4Y','Peach',16 FROM p UNION ALL
        SELECT id,'KB11-6Y-PEACH','6Y','Peach',16 FROM p UNION ALL
        SELECT id,'KB11-8Y-PEACH','8Y','Peach',13 FROM p UNION ALL
        SELECT id,'KB11-10Y-PEACH','10Y','Peach',8 FROM p
    `);

    // Product K12: Teal Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Teal Boys Panjabi','teal-boys-panjabi',
          'A vibrant teal with fine pintuck detailing along the chest. Signature quality that outlasts the season.',
          'Machine wash cold on delicate. Do not tumble dry.',
          cat.id, sub.id, tier.id, false, 4499, 10, 4049, 40, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Teal Boys Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB12-2Y-TEAL','2Y','Teal',8 FROM p UNION ALL
        SELECT id,'KB12-4Y-TEAL','4Y','Teal',10 FROM p UNION ALL
        SELECT id,'KB12-6Y-TEAL','6Y','Teal',12 FROM p UNION ALL
        SELECT id,'KB12-8Y-TEAL','8Y','Teal',7 FROM p UNION ALL
        SELECT id,'KB12-10Y-TEAL','10Y','Teal',3 FROM p
    `);

    // Product K13: Midnight Black Boys Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Midnight Black Boys Panjabi','midnight-black-boys-panjabi',
          'A classic midnight black with intricate silver zari embroidery. The Legends Edit — for the little one who commands attention.',
          'Dry clean only. Store in a breathable garment bag.',
          cat.id, sub.id, tier.id, false, 8499, 0, 8499, 20, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','Midnight Black Boys Panjabi',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80','Midnight Black Boys Panjabi embroidery',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KB13-2Y-BLK','2Y','Black',4 FROM p UNION ALL
        SELECT id,'KB13-4Y-BLK','4Y','Black',5 FROM p UNION ALL
        SELECT id,'KB13-6Y-BLK','6Y','Black',5 FROM p UNION ALL
        SELECT id,'KB13-8Y-BLK','8Y','Black',4 FROM p UNION ALL
        SELECT id,'KB13-10Y-BLK','10Y','Black',2 FROM p
    `);

    // ── Girls Frock (12 products) ──────────────────────────────────────────

    // Product K14: Blush Pink Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Blush Pink Girls Frock','blush-pink-girls-frock',
          'A dreamy blush pink frock with layered tulle skirt and satin ribbon waistband. Perfect for Eid, birthdays, and weddings.',
          'Hand wash cold in mild detergent. Hang dry.',
          cat.id, sub.id, tier.id, false, 7999, 0, 7999, 30, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Blush Pink Girls Frock',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Blush Pink Girls Frock detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF1-2Y-BLUSH','2Y','Blush Pink',6 FROM p UNION ALL
        SELECT id,'GF1-4Y-BLUSH','4Y','Blush Pink',8 FROM p UNION ALL
        SELECT id,'GF1-6Y-BLUSH','6Y','Blush Pink',8 FROM p UNION ALL
        SELECT id,'GF1-8Y-BLUSH','8Y','Blush Pink',5 FROM p UNION ALL
        SELECT id,'GF1-10Y-BLUSH','10Y','Blush Pink',3 FROM p
    `);

    // Product K15: Lavender Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Lavender Girls Frock','lavender-girls-frock',
          'Soft lavender in a flowy chiffon fabric with floral embroidery at the neckline. Lightweight and breathable for warm days.',
          'Hand wash cold. Do not wring. Dry flat.',
          cat.id, sub.id, tier.id, false, 4999, 0, 4999, 50, 6
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Lavender Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF2-2Y-LAV','2Y','Lavender',10 FROM p UNION ALL
        SELECT id,'GF2-4Y-LAV','4Y','Lavender',13 FROM p UNION ALL
        SELECT id,'GF2-6Y-LAV','6Y','Lavender',13 FROM p UNION ALL
        SELECT id,'GF2-8Y-LAV','8Y','Lavender',9 FROM p UNION ALL
        SELECT id,'GF2-10Y-LAV','10Y','Lavender',5 FROM p
    `);

    // Product K16: Coral Orange Girls Frock (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Coral Orange Girls Frock','coral-orange-girls-frock',
          'Vibrant coral in a comfortable cotton-blend that moves freely with active little girls. Great for everyday wear and parties.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 2499, 15, 2124, 80, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Coral Orange Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF3-2Y-CORAL','2Y','Coral',16 FROM p UNION ALL
        SELECT id,'GF3-4Y-CORAL','4Y','Coral',20 FROM p UNION ALL
        SELECT id,'GF3-6Y-CORAL','6Y','Coral',20 FROM p UNION ALL
        SELECT id,'GF3-8Y-CORAL','8Y','Coral',15 FROM p UNION ALL
        SELECT id,'GF3-10Y-CORAL','10Y','Coral',9 FROM p
    `);

    // Product K17: Turquoise Girls Frock (flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Turquoise Girls Frock','turquoise-girls-frock',
          'A stunning turquoise with smocked bodice and tiered skirt. Signature tailoring with a touch of whimsy.',
          'Hand wash cold. Lay flat to dry.',
          cat.id, sub.id, tier.id, false, true, 5499, 20, 4399, 35, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Turquoise Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF4-2Y-TURQ','2Y','Turquoise',7 FROM p UNION ALL
        SELECT id,'GF4-4Y-TURQ','4Y','Turquoise',9 FROM p UNION ALL
        SELECT id,'GF4-6Y-TURQ','6Y','Turquoise',9 FROM p UNION ALL
        SELECT id,'GF4-8Y-TURQ','8Y','Turquoise',7 FROM p UNION ALL
        SELECT id,'GF4-10Y-TURQ','10Y','Turquoise',3 FROM p
    `);

    // Product K18: Lemon Yellow Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Lemon Yellow Girls Frock','lemon-yellow-girls-frock',
          'Cheerful lemon yellow with white broderie anglaise trim. A sunshine dress for sunshine days.',
          'Machine wash cold. Do not bleach. Hang dry.',
          cat.id, sub.id, tier.id, true, 1999, 0, 1999, 90, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Lemon Yellow Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF5-2Y-LEM','2Y','Lemon Yellow',18 FROM p UNION ALL
        SELECT id,'GF5-4Y-LEM','4Y','Lemon Yellow',22 FROM p UNION ALL
        SELECT id,'GF5-6Y-LEM','6Y','Lemon Yellow',22 FROM p UNION ALL
        SELECT id,'GF5-8Y-LEM','8Y','Lemon Yellow',18 FROM p UNION ALL
        SELECT id,'GF5-10Y-LEM','10Y','Lemon Yellow',10 FROM p
    `);

    // Product K19: Rose Red Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Rose Red Girls Frock','rose-red-girls-frock',
          'Deep rose red with intricate hand-embroidered bodice. A statement dress for the most special of occasions.',
          'Dry clean only. Store flat in garment bag.',
          cat.id, sub.id, tier.id, false, 8999, 0, 8999, 22, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Rose Red Girls Frock',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Rose Red Girls Frock embroidery',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF6-2Y-RRED','2Y','Rose Red',4 FROM p UNION ALL
        SELECT id,'GF6-4Y-RRED','4Y','Rose Red',6 FROM p UNION ALL
        SELECT id,'GF6-6Y-RRED','6Y','Rose Red',6 FROM p UNION ALL
        SELECT id,'GF6-8Y-RRED','8Y','Rose Red',4 FROM p UNION ALL
        SELECT id,'GF6-10Y-RRED','10Y','Rose Red',2 FROM p
    `);

    // Product K20: Baby Blue Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Baby Blue Girls Frock','baby-blue-girls-frock',
          'Delicate baby blue with a Peter Pan collar and puff sleeves. Timeless and sweet for every little girl.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, true, 2299, 0, 2299, 75, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Baby Blue Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF7-2Y-BBLU','2Y','Baby Blue',15 FROM p UNION ALL
        SELECT id,'GF7-4Y-BBLU','4Y','Baby Blue',18 FROM p UNION ALL
        SELECT id,'GF7-6Y-BBLU','6Y','Baby Blue',18 FROM p UNION ALL
        SELECT id,'GF7-8Y-BBLU','8Y','Baby Blue',14 FROM p UNION ALL
        SELECT id,'GF7-10Y-BBLU','10Y','Baby Blue',10 FROM p
    `);

    // Product K21: Lilac Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Lilac Girls Frock','lilac-girls-frock',
          'Soft lilac organza over satin lining. The smocked bodice and A-line skirt create an effortlessly elegant silhouette.',
          'Hand wash cold. Do not wring. Lay flat to dry.',
          cat.id, sub.id, tier.id, false, 5499, 10, 4949, 40, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Lilac Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF8-2Y-LILAC','2Y','Lilac',8 FROM p UNION ALL
        SELECT id,'GF8-4Y-LILAC','4Y','Lilac',10 FROM p UNION ALL
        SELECT id,'GF8-6Y-LILAC','6Y','Lilac',10 FROM p UNION ALL
        SELECT id,'GF8-8Y-LILAC','8Y','Lilac',8 FROM p UNION ALL
        SELECT id,'GF8-10Y-LILAC','10Y','Lilac',4 FROM p
    `);

    // Product K22: Emerald Green Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Emerald Green Girls Frock','emerald-green-girls-frock',
          'Rich emerald green in pure georgette with gold zardozi work along the hemline. An heirloom-quality piece for milestone moments.',
          'Dry clean only.',
          cat.id, sub.id, tier.id, false, 9499, 0, 9499, 18, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Emerald Green Girls Frock',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Emerald Green Girls Frock detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF9-2Y-EMR','2Y','Emerald Green',3 FROM p UNION ALL
        SELECT id,'GF9-4Y-EMR','4Y','Emerald Green',5 FROM p UNION ALL
        SELECT id,'GF9-6Y-EMR','6Y','Emerald Green',5 FROM p UNION ALL
        SELECT id,'GF9-8Y-EMR','8Y','Emerald Green',3 FROM p UNION ALL
        SELECT id,'GF9-10Y-EMR','10Y','Emerald Green',2 FROM p
    `);

    // Product K23: Peach Blossom Girls Frock (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Peach Blossom Girls Frock','peach-blossom-girls-frock',
          'Sweet peach with floral print throughout. A lightweight cotton frock that is easy to wear and easier to love.',
          'Machine wash warm. Tumble dry low.',
          cat.id, sub.id, tier.id, true, 2799, 20, 2239, 85, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Peach Blossom Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF10-2Y-PBLOS','2Y','Peach',17 FROM p UNION ALL
        SELECT id,'GF10-4Y-PBLOS','4Y','Peach',20 FROM p UNION ALL
        SELECT id,'GF10-6Y-PBLOS','6Y','Peach',20 FROM p UNION ALL
        SELECT id,'GF10-8Y-PBLOS','8Y','Peach',18 FROM p UNION ALL
        SELECT id,'GF10-10Y-PBLOS','10Y','Peach',10 FROM p
    `);

    // Product K24: Cherry Blossom Girls Frock
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Cherry Blossom Girls Frock','cherry-blossom-girls-frock',
          'Pale pink with delicate cherry blossom embroidery. The Signature collection at its most poetic.',
          'Hand wash cold. Dry flat away from direct sunlight.',
          cat.id, sub.id, tier.id, false, 5999, 0, 5999, 32, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Cherry Blossom Girls Frock',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF11-2Y-CHER','2Y','Cherry Blossom',6 FROM p UNION ALL
        SELECT id,'GF11-4Y-CHER','4Y','Cherry Blossom',8 FROM p UNION ALL
        SELECT id,'GF11-6Y-CHER','6Y','Cherry Blossom',8 FROM p UNION ALL
        SELECT id,'GF11-8Y-CHER','8Y','Cherry Blossom',7 FROM p UNION ALL
        SELECT id,'GF11-10Y-CHER','10Y','Cherry Blossom',3 FROM p
    `);

    // Product K25: Golden Girls Frock (flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Golden Girls Frock','golden-girls-frock',
          'A showstopping golden frock with full skirt and sequin bodice. The Legends Edit — because every little girl deserves to shine.',
          'Dry clean only. Store flat in tissue paper.',
          cat.id, sub.id, tier.id, false, true, 10999, 15, 9349, 15, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-frock' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Golden Girls Frock',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Golden Girls Frock detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'GF12-2Y-GOLD','2Y','Gold',3 FROM p UNION ALL
        SELECT id,'GF12-4Y-GOLD','4Y','Gold',4 FROM p UNION ALL
        SELECT id,'GF12-6Y-GOLD','6Y','Gold',4 FROM p UNION ALL
        SELECT id,'GF12-8Y-GOLD','8Y','Gold',3 FROM p UNION ALL
        SELECT id,'GF12-10Y-GOLD','10Y','Gold',1 FROM p
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = [
      'sky-blue-boys-panjabi','ivory-white-boys-panjabi','mint-green-boys-panjabi',
      'royal-purple-boys-panjabi','terracotta-boys-panjabi','sunshine-yellow-boys-panjabi',
      'crimson-boys-panjabi','slate-grey-boys-panjabi','olive-green-boys-panjabi',
      'indigo-boys-panjabi','peach-boys-panjabi','teal-boys-panjabi','midnight-black-boys-panjabi',
      'blush-pink-girls-frock','lavender-girls-frock','coral-orange-girls-frock',
      'turquoise-girls-frock','lemon-yellow-girls-frock','rose-red-girls-frock',
      'baby-blue-girls-frock','lilac-girls-frock','emerald-green-girls-frock',
      'peach-blossom-girls-frock','cherry-blossom-girls-frock','golden-girls-frock',
    ];
    const list = slugs.map(s => `'${s}'`).join(',');
    await queryRunner.query(`DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE slug IN (${list}))`);
    await queryRunner.query(`DELETE FROM product_images   WHERE product_id IN (SELECT id FROM products WHERE slug IN (${list}))`);
    await queryRunner.query(`DELETE FROM products WHERE slug IN (${list})`);
  }
}
