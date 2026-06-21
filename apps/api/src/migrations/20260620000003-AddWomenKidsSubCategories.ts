import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWomenKidsSubCategories20260620000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── New sub-categories ─────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO sub_categories (category_id, name, slug, description, hero_image_url, sort_order)
      SELECT c.id, v.name, v.slug, v.description, v.hero_image_url, v.sort_order
      FROM categories c,
      (VALUES
        ('women', 'Kurti',             'kurti',              'Casual and festive kurtis for every occasion.',       'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&q=80', 3),
        ('women', 'Saree',             'saree',              'Handcrafted sarees in silk, georgette and chiffon.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80', 4),
        ('women', 'Abaya',             'abaya',              'Elegant modest fashion for every occasion.',          'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=1600&q=80', 5),
        ('women', 'Dress',             'dress',              'Modern dresses from midi to maxi.',                   'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80', 6),
        ('kids',  'Boys T-Shirt',      'boys-t-shirt',       'Comfortable everyday tees for boys.',                'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&q=80', 3),
        ('kids',  'Boys Trouser',      'boys-trouser',       'Relaxed and smart trousers for boys.',               'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&q=80', 4),
        ('kids',  'Girls Salwar',      'girls-salwar',       'Graceful salwar kameez sets for girls.',             'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80', 3),
        ('kids',  'Baby Collection',   'baby-collection',    'Soft, safe clothing for babies and toddlers.',       'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&q=80', 5)
      ) AS v(cat_slug, name, slug, description, hero_image_url, sort_order)
      WHERE c.slug = v.cat_slug
      ON CONFLICT (slug) DO NOTHING
    `);

    // ── Nav items for new sub-categories ──────────────────────────────────

    // Add Kids sub-nav children (kids parent exists but had no children)
    await queryRunner.query(`
      WITH kids_nav AS (
        SELECT id FROM nav_items WHERE url = '/c/kids' AND parent_id IS NULL LIMIT 1
      )
      INSERT INTO nav_items (label, url, type, parent_id, is_active, show_in_nav, sort_order)
      SELECT v.label, v.url, 'sub_category', kids_nav.id, true, true, v.sort_order
      FROM kids_nav, (VALUES
        ('Boys Panjabi',    '/s/boys-panjabi',  1),
        ('Girls Frock',     '/s/girls-frock',   2),
        ('Boys T-Shirt',    '/s/boys-t-shirt',  3),
        ('Boys Trouser',    '/s/boys-trouser',  4),
        ('Girls Salwar',    '/s/girls-salwar',  5),
        ('Baby Collection', '/s/baby-collection', 6)
      ) AS v(label, url, sort_order)
      ON CONFLICT DO NOTHING
    `);

    // Add new Women sub-nav children under the existing women nav parent
    await queryRunner.query(`
      WITH women_nav AS (
        SELECT id FROM nav_items WHERE url = '/c/women' AND parent_id IS NULL LIMIT 1
      )
      INSERT INTO nav_items (label, url, type, parent_id, is_active, show_in_nav, sort_order)
      SELECT v.label, v.url, 'sub_category', women_nav.id, true, true, v.sort_order
      FROM women_nav, (VALUES
        ('Kurti',  '/s/kurti',  3),
        ('Saree',  '/s/saree',  4),
        ('Abaya',  '/s/abaya',  5),
        ('Dress',  '/s/dress',  6)
      ) AS v(label, url, sort_order)
      ON CONFLICT DO NOTHING
    `);

    // ── Women — Kurti (3 products) ─────────────────────────────────────────

    // WK1: Pink Floral Kurti
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Pink Floral Kurti','pink-floral-kurti',
          'A soft pink kurti with an all-over floral print in a breathable CottoCool fabric. Relaxed fit with three-quarter sleeves and a side slit.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 2499, 0, 2499, 80, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='kurti' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Pink Floral Kurti',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80','Pink Floral Kurti detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WK1-XS-PINK','XS','Pink',14 FROM p UNION ALL
        SELECT id,'WK1-S-PINK','S','Pink',20 FROM p UNION ALL
        SELECT id,'WK1-M-PINK','M','Pink',22 FROM p UNION ALL
        SELECT id,'WK1-L-PINK','L','Pink',16 FROM p UNION ALL
        SELECT id,'WK1-XL-PINK','XL','Pink',8 FROM p
    `);

    // WK2: Navy Printed Kurti
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Printed Kurti','navy-printed-kurti',
          'A rich navy kurti with a hand-block print in ivory. Straight cut with a mandarin collar and intricate pin-tuck detailing at the chest.',
          'Hand wash cold. Iron at medium heat on reverse.',
          cat.id, sub.id, tier.id, false, 4499, 0, 4499, 55, 6
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='kurti' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Navy Printed Kurti',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WK2-XS-NVY','XS','Navy',9 FROM p UNION ALL
        SELECT id,'WK2-S-NVY','S','Navy',14 FROM p UNION ALL
        SELECT id,'WK2-M-NVY','M','Navy',16 FROM p UNION ALL
        SELECT id,'WK2-L-NVY','L','Navy',11 FROM p UNION ALL
        SELECT id,'WK2-XL-NVY','XL','Navy',5 FROM p
    `);

    // WK3: White Embroidered Kurti (Legends Edit, discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'White Embroidered Kurti','white-embroidered-kurti',
          'Pristine white in a fine mull cotton with hand-done chikankari embroidery along the neckline and hem. A Legends Edit heirloom piece.',
          'Dry clean only. Store flat in tissue paper.',
          cat.id, sub.id, tier.id, false, 8499, 15, 7224, 22, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='kurti' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80','White Embroidered Kurti',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','White Embroidered Kurti detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WK3-XS-WHT','XS','White',4 FROM p UNION ALL
        SELECT id,'WK3-S-WHT','S','White',6 FROM p UNION ALL
        SELECT id,'WK3-M-WHT','M','White',6 FROM p UNION ALL
        SELECT id,'WK3-L-WHT','L','White',4 FROM p UNION ALL
        SELECT id,'WK3-XL-WHT','XL','White',2 FROM p
    `);

    // ── Women — Saree (3 products) ─────────────────────────────────────────

    // WS1: Red Banarasi Saree (Legends Edit, flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Red Banarasi Saree','red-banarasi-saree',
          'A statement red Banarasi saree in pure silk with gold zari weave throughout. Comes with an unstitched blouse piece. The Legends Edit at its most timeless.',
          'Dry clean only. Store in a muslin cloth bag away from light.',
          cat.id, sub.id, tier.id, false, true, 24999, 20, 19999, 12, 3
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='saree' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80','Red Banarasi Saree',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Red Banarasi Saree zari detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WS1-FREE-RED','Free Size','Red',12 FROM p
    `);

    // WS2: Blue Georgette Saree
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Blue Georgette Saree','blue-georgette-saree',
          'Midnight blue georgette with intricate sequin embroidery on the pallu. Lightweight and fluid — perfect for evening celebrations.',
          'Dry clean only.',
          cat.id, sub.id, tier.id, false, 9999, 0, 9999, 20, 4
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='saree' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80','Blue Georgette Saree',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WS2-FREE-BLU','Free Size','Midnight Blue',20 FROM p
    `);

    // WS3: Pink Chiffon Saree (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Pink Chiffon Saree','pink-chiffon-saree',
          'A blush pink chiffon saree with a delicate floral border and plain pallu. Effortless and breathable for long celebration days.',
          'Dry clean or hand wash cold in mild shampoo. Hang dry in shade.',
          cat.id, sub.id, tier.id, false, 4999, 20, 3999, 30, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='saree' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80','Pink Chiffon Saree',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WS3-FREE-PINK','Free Size','Blush Pink',30 FROM p
    `);

    // ── Women — Abaya (2 products) ─────────────────────────────────────────

    // WA1: Black Classic Abaya
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Black Classic Abaya','black-classic-abaya',
          'A timeless black abaya in a premium crepe fabric. Open-front with a concealed inner button row, flared sleeves and a clean floor-length silhouette.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, false, 5999, 0, 5999, 45, 6
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='abaya' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80','Black Classic Abaya',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Black Classic Abaya sleeve',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WA1-XS-BLK','XS','Black',8 FROM p UNION ALL
        SELECT id,'WA1-S-BLK','S','Black',12 FROM p UNION ALL
        SELECT id,'WA1-M-BLK','M','Black',13 FROM p UNION ALL
        SELECT id,'WA1-L-BLK','L','Black',9 FROM p UNION ALL
        SELECT id,'WA1-XL-BLK','XL','Black',3 FROM p
    `);

    // WA2: Navy Embroidered Abaya (Legends Edit)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Embroidered Abaya','navy-embroidered-abaya',
          'A deep navy abaya with hand-embroidered gold floral motifs along the cuffs and front panels. The Legends Edit — modest fashion at its most elevated.',
          'Dry clean only. Store hanging in a cool, dry space.',
          cat.id, sub.id, tier.id, false, 10999, 0, 10999, 18, 4
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='abaya' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80','Navy Embroidered Abaya',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WA2-XS-NVY','XS','Navy',3 FROM p UNION ALL
        SELECT id,'WA2-S-NVY','S','Navy',5 FROM p UNION ALL
        SELECT id,'WA2-M-NVY','M','Navy',5 FROM p UNION ALL
        SELECT id,'WA2-L-NVY','L','Navy',3 FROM p UNION ALL
        SELECT id,'WA2-XL-NVY','XL','Navy',2 FROM p
    `);

    // ── Women — Dress (3 products) ─────────────────────────────────────────

    // WD1: Emerald Midi Dress
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Emerald Midi Dress','emerald-midi-dress',
          'A rich emerald wrap-front midi dress in satin-backed crepe. Adjustable tie waist, flutter sleeves and a below-the-knee length.',
          'Hand wash cold. Dry flat. Iron at low heat on reverse.',
          cat.id, sub.id, tier.id, false, 5499, 0, 5499, 40, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='dress' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80','Emerald Midi Dress',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80','Emerald Midi Dress waist detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WD1-XS-EMR','XS','Emerald',7 FROM p UNION ALL
        SELECT id,'WD1-S-EMR','S','Emerald',10 FROM p UNION ALL
        SELECT id,'WD1-M-EMR','M','Emerald',12 FROM p UNION ALL
        SELECT id,'WD1-L-EMR','L','Emerald',8 FROM p UNION ALL
        SELECT id,'WD1-XL-EMR','XL','Emerald',3 FROM p
    `);

    // WD2: Ivory Maxi Dress (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Ivory Maxi Dress','ivory-maxi-dress',
          'A flowing ivory maxi dress in lightweight CottoCool fabric. Smocked bodice, adjustable straps and a full sweep skirt. Perfect for summer occasions.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 3999, 20, 3199, 55, 6
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='dress' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80','Ivory Maxi Dress',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WD2-XS-IVORY','XS','Ivory',10 FROM p UNION ALL
        SELECT id,'WD2-S-IVORY','S','Ivory',14 FROM p UNION ALL
        SELECT id,'WD2-M-IVORY','M','Ivory',16 FROM p UNION ALL
        SELECT id,'WD2-L-IVORY','L','Ivory',10 FROM p UNION ALL
        SELECT id,'WD2-XL-IVORY','XL','Ivory',5 FROM p
    `);

    // WD3: Burgundy Wrap Dress (Legends Edit)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Burgundy Wrap Dress','burgundy-wrap-dress',
          'Deep burgundy in a premium silk-blend with a dramatic V-neckline and self-tie wrap. A Legends Edit piece that turns every entrance into a statement.',
          'Dry clean only.',
          cat.id, sub.id, tier.id, false, 12999, 0, 12999, 16, 4
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='dress' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80','Burgundy Wrap Dress',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Burgundy Wrap Dress back',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'WD3-XS-BURG','XS','Burgundy',3 FROM p UNION ALL
        SELECT id,'WD3-S-BURG','S','Burgundy',4 FROM p UNION ALL
        SELECT id,'WD3-M-BURG','M','Burgundy',5 FROM p UNION ALL
        SELECT id,'WD3-L-BURG','L','Burgundy',3 FROM p UNION ALL
        SELECT id,'WD3-XL-BURG','XL','Burgundy',1 FROM p
    `);

    // ── Kids — Boys T-Shirt (3 products) ──────────────────────────────────

    // KBT1: White Kids T-Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'White Kids T-Shirt','white-kids-t-shirt',
          'A clean white everyday tee in soft 200gsm cotton. Crew neck with reinforced shoulders. Washes bright wash after wash.',
          'Machine wash warm. Tumble dry low.',
          cat.id, sub.id, tier.id, true, 1299, 0, 1299, 100, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','White Kids T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBT1-2Y-WHT','2Y','White',20 FROM p UNION ALL
        SELECT id,'KBT1-4Y-WHT','4Y','White',25 FROM p UNION ALL
        SELECT id,'KBT1-6Y-WHT','6Y','White',25 FROM p UNION ALL
        SELECT id,'KBT1-8Y-WHT','8Y','White',20 FROM p UNION ALL
        SELECT id,'KBT1-10Y-WHT','10Y','White',10 FROM p
    `);

    // KBT2: Navy Kids T-Shirt (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Kids T-Shirt','navy-kids-t-shirt',
          'Sturdy navy in a heavyweight cotton perfect for active kids. Anti-shrink, fade-resistant and tough enough to handle the playground.',
          'Machine wash warm. Tumble dry low.',
          cat.id, sub.id, tier.id, false, 1499, 15, 1274, 90, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Navy Kids T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBT2-2Y-NVY','2Y','Navy',18 FROM p UNION ALL
        SELECT id,'KBT2-4Y-NVY','4Y','Navy',22 FROM p UNION ALL
        SELECT id,'KBT2-6Y-NVY','6Y','Navy',22 FROM p UNION ALL
        SELECT id,'KBT2-8Y-NVY','8Y','Navy',18 FROM p UNION ALL
        SELECT id,'KBT2-10Y-NVY','10Y','Navy',10 FROM p
    `);

    // KBT3: Red Stripe Kids T-Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Red Stripe Kids T-Shirt','red-stripe-kids-t-shirt',
          'Bold red and white horizontal stripes in a soft jersey cotton. A fun, playful tee that stands up to active days.',
          'Machine wash cold. Tumble dry low.',
          cat.id, sub.id, tier.id, true, 1499, 0, 1499, 80, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Red Stripe Kids T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBT3-2Y-RED','2Y','Red Stripe',16 FROM p UNION ALL
        SELECT id,'KBT3-4Y-RED','4Y','Red Stripe',20 FROM p UNION ALL
        SELECT id,'KBT3-6Y-RED','6Y','Red Stripe',20 FROM p UNION ALL
        SELECT id,'KBT3-8Y-RED','8Y','Red Stripe',16 FROM p UNION ALL
        SELECT id,'KBT3-10Y-RED','10Y','Red Stripe',8 FROM p
    `);

    // ── Kids — Boys Trouser (2 products) ──────────────────────────────────

    // KBTR1: Navy Boys Trouser
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Boys Trouser','navy-boys-trouser',
          'A smart navy trouser in a durable stretch cotton. Elastic waistband with a drawstring for easy dressing. Smart enough for school, tough enough for everywhere else.',
          'Machine wash cold. Tumble dry low.',
          cat.id, sub.id, tier.id, false, 1999, 0, 1999, 70, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-trouser' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80','Navy Boys Trouser',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBTR1-2Y-NVY','2Y','Navy',14 FROM p UNION ALL
        SELECT id,'KBTR1-4Y-NVY','4Y','Navy',18 FROM p UNION ALL
        SELECT id,'KBTR1-6Y-NVY','6Y','Navy',18 FROM p UNION ALL
        SELECT id,'KBTR1-8Y-NVY','8Y','Navy',12 FROM p UNION ALL
        SELECT id,'KBTR1-10Y-NVY','10Y','Navy',8 FROM p
    `);

    // KBTR2: Khaki Boys Chino Trouser (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Khaki Boys Chino Trouser','khaki-boys-chino-trouser',
          'Classic khaki chino in a cotton-stretch blend. Five-pocket styling with a regular fit that works from school to weekends.',
          'Machine wash warm. Tumble dry low. Iron at medium heat.',
          cat.id, sub.id, tier.id, false, 2299, 10, 2069, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='boys-trouser' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80','Khaki Boys Chino Trouser',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBTR2-2Y-KHKI','2Y','Khaki',12 FROM p UNION ALL
        SELECT id,'KBTR2-4Y-KHKI','4Y','Khaki',15 FROM p UNION ALL
        SELECT id,'KBTR2-6Y-KHKI','6Y','Khaki',16 FROM p UNION ALL
        SELECT id,'KBTR2-8Y-KHKI','8Y','Khaki',11 FROM p UNION ALL
        SELECT id,'KBTR2-10Y-KHKI','10Y','Khaki',6 FROM p
    `);

    // ── Kids — Girls Salwar Kameez (3 products) ────────────────────────────

    // KGS1: Pink Girls Salwar Kameez
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Pink Girls Salwar Kameez','pink-girls-salwar-kameez',
          'A powder pink salwar kameez in a soft georgette fabric with delicate floral print. Comes with matching dupatta. Perfect for Eid and family occasions.',
          'Hand wash cold. Hang dry.',
          cat.id, sub.id, tier.id, false, 3999, 0, 3999, 45, 6
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-salwar' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Pink Girls Salwar Kameez',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KGS1-2Y-PINK','2Y','Pink',9 FROM p UNION ALL
        SELECT id,'KGS1-4Y-PINK','4Y','Pink',11 FROM p UNION ALL
        SELECT id,'KGS1-6Y-PINK','6Y','Pink',12 FROM p UNION ALL
        SELECT id,'KGS1-8Y-PINK','8Y','Pink',8 FROM p UNION ALL
        SELECT id,'KGS1-10Y-PINK','10Y','Pink',5 FROM p
    `);

    // KGS2: Purple Girls Salwar Kameez (Legends Edit)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Purple Girls Salwar Kameez','purple-girls-salwar-kameez',
          'Rich plum purple in a pure silk salwar kameez with gold tilla embroidery on the bodice and cuffs. A Legends Edit heirloom set for your little princess.',
          'Dry clean only.',
          cat.id, sub.id, tier.id, false, 7499, 0, 7499, 18, 4
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-salwar' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Purple Girls Salwar Kameez',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Purple Girls Salwar embroidery',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KGS2-2Y-PUR','2Y','Purple',3 FROM p UNION ALL
        SELECT id,'KGS2-4Y-PUR','4Y','Purple',5 FROM p UNION ALL
        SELECT id,'KGS2-6Y-PUR','6Y','Purple',5 FROM p UNION ALL
        SELECT id,'KGS2-8Y-PUR','8Y','Purple',3 FROM p UNION ALL
        SELECT id,'KGS2-10Y-PUR','10Y','Purple',2 FROM p
    `);

    // KGS3: Yellow Girls Salwar Kameez (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Yellow Girls Salwar Kameez','yellow-girls-salwar-kameez',
          'Cheerful sunshine yellow in a soft cotton-lawn fabric. Easy to wash and comfortable all day. A go-to set for playful everyday occasions.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 2499, 15, 2124, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='girls-salwar' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Yellow Girls Salwar Kameez',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KGS3-2Y-YLW','2Y','Yellow',12 FROM p UNION ALL
        SELECT id,'KGS3-4Y-YLW','4Y','Yellow',15 FROM p UNION ALL
        SELECT id,'KGS3-6Y-YLW','6Y','Yellow',16 FROM p UNION ALL
        SELECT id,'KGS3-8Y-YLW','8Y','Yellow',11 FROM p UNION ALL
        SELECT id,'KGS3-10Y-YLW','10Y','Yellow',6 FROM p
    `);

    // ── Kids — Baby Collection (2 products) ───────────────────────────────

    // KBC1: White Baby Romper Set
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'White Baby Romper Set','white-baby-romper-set',
          'A pure white muslin romper set for babies. Envelope neckline for easy dressing, snap fasteners at the crotch, and OEKO-TEX certified fabric safe for sensitive skin.',
          'Machine wash cold. Tumble dry low. Do not bleach.',
          cat.id, sub.id, tier.id, true, 1999, 0, 1999, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='baby-collection' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','White Baby Romper Set',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBC1-0-3M-WHT','0-3M','White',15 FROM p UNION ALL
        SELECT id,'KBC1-3-6M-WHT','3-6M','White',18 FROM p UNION ALL
        SELECT id,'KBC1-6-12M-WHT','6-12M','White',18 FROM p UNION ALL
        SELECT id,'KBC1-12-18M-WHT','12-18M','White',9 FROM p
    `);

    // KBC2: Pink Baby Dress Set (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Pink Baby Dress Set','pink-baby-dress-set',
          'A blush pink smocked baby dress with matching bloomers. 100% organic cotton with no harsh dyes. Irresistibly soft against baby skin.',
          'Machine wash cold on gentle. Lay flat to dry.',
          cat.id, sub.id, tier.id, true, 2499, 10, 2249, 50, 6
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='kids' AND sub.slug='baby-collection' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80','Pink Baby Dress Set',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'KBC2-0-3M-PINK','0-3M','Pink',12 FROM p UNION ALL
        SELECT id,'KBC2-3-6M-PINK','3-6M','Pink',14 FROM p UNION ALL
        SELECT id,'KBC2-6-12M-PINK','6-12M','Pink',16 FROM p UNION ALL
        SELECT id,'KBC2-12-18M-PINK','12-18M','Pink',8 FROM p
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = [
      'pink-floral-kurti','navy-printed-kurti','white-embroidered-kurti',
      'red-banarasi-saree','blue-georgette-saree','pink-chiffon-saree',
      'black-classic-abaya','navy-embroidered-abaya',
      'emerald-midi-dress','ivory-maxi-dress','burgundy-wrap-dress',
      'white-kids-t-shirt','navy-kids-t-shirt','red-stripe-kids-t-shirt',
      'navy-boys-trouser','khaki-boys-chino-trouser',
      'pink-girls-salwar-kameez','purple-girls-salwar-kameez','yellow-girls-salwar-kameez',
      'white-baby-romper-set','pink-baby-dress-set',
    ];
    const list = slugs.map(s => `'${s}'`).join(',');
    await queryRunner.query(`DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE slug IN (${list}))`);
    await queryRunner.query(`DELETE FROM product_images   WHERE product_id IN (SELECT id FROM products WHERE slug IN (${list}))`);
    await queryRunner.query(`DELETE FROM products WHERE slug IN (${list})`);
    await queryRunner.query(`DELETE FROM nav_items WHERE url IN ('/s/boys-panjabi','/s/girls-frock','/s/boys-t-shirt','/s/boys-trouser','/s/girls-salwar','/s/baby-collection','/s/kurti','/s/saree','/s/abaya','/s/dress')`);
    await queryRunner.query(`DELETE FROM sub_categories WHERE slug IN ('kurti','saree','abaya','dress','boys-t-shirt','boys-trouser','girls-salwar','baby-collection')`);
  }
}
