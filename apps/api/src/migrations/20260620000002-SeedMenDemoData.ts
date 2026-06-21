import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMenDemoData20260620000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── Panjabi (8 products) ───────────────────────────────────────────────

    // MP1: Peacock Blue Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Peacock Blue Panjabi','peacock-blue-panjabi',
          'A rich peacock blue with tonal jacquard weave and subtle sheen. The Signature cut — structured, refined, and effortlessly elegant.',
          'Dry clean preferred. Machine wash cold on delicate.',
          cat.id, sub.id, tier.id, false, 6499, 0, 6499, 40, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80','Peacock Blue Panjabi front',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=800&q=80','Peacock Blue Panjabi side',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP1-S-PCBLU','S','Peacock Blue',8 FROM p UNION ALL
        SELECT id,'MP1-M-PCBLU','M','Peacock Blue',12 FROM p UNION ALL
        SELECT id,'MP1-L-PCBLU','L','Peacock Blue',12 FROM p UNION ALL
        SELECT id,'MP1-XL-PCBLU','XL','Peacock Blue',8 FROM p
    `);

    // MP2: Rust Orange Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Rust Orange Panjabi','rust-orange-panjabi',
          'Warm rust orange in a breathable cotton weave. A bold festive choice that pairs beautifully with gold jewellery.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 2999, 0, 2999, 65, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80','Rust Orange Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP2-S-RUST','S','Rust Orange',14 FROM p UNION ALL
        SELECT id,'MP2-M-RUST','M','Rust Orange',18 FROM p UNION ALL
        SELECT id,'MP2-L-RUST','L','Rust Orange',18 FROM p UNION ALL
        SELECT id,'MP2-XL-RUST','XL','Rust Orange',15 FROM p
    `);

    // MP3: Champagne Gold Panjabi (flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Champagne Gold Panjabi','champagne-gold-panjabi',
          'Luxurious champagne gold in pure silk-cotton. Heavy gold zari embroidery on collar and cuffs. The ultimate Eid statement.',
          'Dry clean only. Store in a breathable garment bag.',
          cat.id, sub.id, tier.id, false, true, 13999, 20, 11199, 18, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','Champagne Gold Panjabi',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80','Champagne Gold Panjabi embroidery',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP3-S-CHAMP','S','Champagne Gold',4 FROM p UNION ALL
        SELECT id,'MP3-M-CHAMP','M','Champagne Gold',6 FROM p UNION ALL
        SELECT id,'MP3-L-CHAMP','L','Champagne Gold',5 FROM p UNION ALL
        SELECT id,'MP3-XL-CHAMP','XL','Champagne Gold',3 FROM p
    `);

    // MP4: Sage Green Panjabi (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Sage Green Panjabi','sage-green-panjabi',
          'Calming sage green in a soft cotton mull. Unstructured collar and easy fit — equally at home at a family gathering or a casual Friday.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 2799, 15, 2379, 70, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80','Sage Green Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP4-S-SAGE','S','Sage Green',15 FROM p UNION ALL
        SELECT id,'MP4-M-SAGE','M','Sage Green',20 FROM p UNION ALL
        SELECT id,'MP4-L-SAGE','L','Sage Green',20 FROM p UNION ALL
        SELECT id,'MP4-XL-SAGE','XL','Sage Green',15 FROM p
    `);

    // MP5: Maroon Embroidered Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Maroon Embroidered Panjabi','maroon-embroidered-panjabi',
          'Deep maroon with intricate geometric embroidery across the chest panel. A signature piece that commands attention without effort.',
          'Dry clean preferred. Hand wash cold in gentle detergent.',
          cat.id, sub.id, tier.id, false, 7499, 0, 7499, 35, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=800&q=80','Maroon Embroidered Panjabi',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80','Maroon Embroidered Panjabi detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP5-S-MAR','S','Maroon',7 FROM p UNION ALL
        SELECT id,'MP5-M-MAR','M','Maroon',10 FROM p UNION ALL
        SELECT id,'MP5-L-MAR','L','Maroon',12 FROM p UNION ALL
        SELECT id,'MP5-XL-MAR','XL','Maroon',6 FROM p
    `);

    // MP6: Electric Blue Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Electric Blue Panjabi','electric-blue-panjabi',
          'A vivid electric blue in lightweight CottoCool cotton. Keeps you cool and sharp through long celebration days.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 2599, 0, 2599, 75, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80','Electric Blue Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP6-S-EBLU','S','Electric Blue',18 FROM p UNION ALL
        SELECT id,'MP6-M-EBLU','M','Electric Blue',22 FROM p UNION ALL
        SELECT id,'MP6-L-EBLU','L','Electric Blue',22 FROM p UNION ALL
        SELECT id,'MP6-XL-EBLU','XL','Electric Blue',13 FROM p
    `);

    // MP7: Cream Linen Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Cream Linen Panjabi','cream-linen-panjabi',
          'Pure linen in a warm cream. The natural texture and relaxed drape make this the go-to for summer weddings and resort occasions.',
          'Hand wash cold. Iron while slightly damp.',
          cat.id, sub.id, tier.id, false, 5999, 10, 5399, 45, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80','Cream Linen Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP7-S-CREAM','S','Cream',10 FROM p UNION ALL
        SELECT id,'MP7-M-CREAM','M','Cream',14 FROM p UNION ALL
        SELECT id,'MP7-L-CREAM','L','Cream',14 FROM p UNION ALL
        SELECT id,'MP7-XL-CREAM','XL','Cream',7 FROM p
    `);

    // MP8: Black Velvet Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Black Velvet Panjabi','black-velvet-panjabi',
          'Midnight black in luxurious velvet with a matte finish collar. An understated Legends Edit piece that needs no embellishment.',
          'Dry clean only. Store hanging in a cool, dry space.',
          cat.id, sub.id, tier.id, false, 12999, 0, 12999, 15, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','Black Velvet Panjabi',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80','Black Velvet Panjabi side',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MP8-S-BLKV','S','Black',3 FROM p UNION ALL
        SELECT id,'MP8-M-BLKV','M','Black',5 FROM p UNION ALL
        SELECT id,'MP8-L-BLKV','L','Black',5 FROM p UNION ALL
        SELECT id,'MP8-XL-BLKV','XL','Black',2 FROM p
    `);

    // ── Casual Shirt (5 products) ──────────────────────────────────────────

    // MCS1: Olive Linen Casual Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Olive Linen Casual Shirt','olive-linen-casual-shirt',
          'Pure linen in an earthy olive. Relaxed fit with a camp collar and chest patch pocket. The warm-weather essential.',
          'Machine wash cold. Hang dry. Iron at medium heat.',
          cat.id, sub.id, tier.id, false, 3499, 0, 3499, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='casual-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Olive Linen Casual Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MCS1-S-OLV','S','Olive',13 FROM p UNION ALL
        SELECT id,'MCS1-M-OLV','M','Olive',18 FROM p UNION ALL
        SELECT id,'MCS1-L-OLV','L','Olive',18 FROM p UNION ALL
        SELECT id,'MCS1-XL-OLV','XL','Olive',11 FROM p
    `);

    // MCS2: Terracotta Casual Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Terracotta Casual Shirt','terracotta-casual-shirt',
          'A warm terracotta in a washed cotton twill. Slightly oversized with dropped shoulders and a curved hem for an effortless modern look.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, false, 4499, 0, 4499, 50, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='casual-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Terracotta Casual Shirt',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Terracotta Casual Shirt detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MCS2-S-TERRA','S','Terracotta',10 FROM p UNION ALL
        SELECT id,'MCS2-M-TERRA','M','Terracotta',14 FROM p UNION ALL
        SELECT id,'MCS2-L-TERRA','L','Terracotta',16 FROM p UNION ALL
        SELECT id,'MCS2-XL-TERRA','XL','Terracotta',10 FROM p
    `);

    // MCS3: Navy Check Casual Shirt (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Check Casual Shirt','navy-check-casual-shirt',
          'Classic navy and white gingham check in a soft brushed cotton. A wardrobe anchor that works from brunch to sunset.',
          'Machine wash warm. Tumble dry low.',
          cat.id, sub.id, tier.id, false, 3799, 20, 3039, 55, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='casual-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Navy Check Casual Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MCS3-S-NVYCHK','S','Navy Check',12 FROM p UNION ALL
        SELECT id,'MCS3-M-NVYCHK','M','Navy Check',16 FROM p UNION ALL
        SELECT id,'MCS3-L-NVYCHK','L','Navy Check',18 FROM p UNION ALL
        SELECT id,'MCS3-XL-NVYCHK','XL','Navy Check',9 FROM p
    `);

    // MCS4: White Linen Casual Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'White Linen Casual Shirt','white-linen-casual-shirt',
          'Crisp white linen with a banded collar and mother-of-pearl buttons. Dresses up or down without trying.',
          'Hand wash cold. Iron while damp for a sharp finish.',
          cat.id, sub.id, tier.id, false, 4999, 0, 4999, 45, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='casual-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','White Linen Casual Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MCS4-S-WHTLIN','S','White',10 FROM p UNION ALL
        SELECT id,'MCS4-M-WHTLIN','M','White',14 FROM p UNION ALL
        SELECT id,'MCS4-L-WHTLIN','L','White',14 FROM p UNION ALL
        SELECT id,'MCS4-XL-WHTLIN','XL','White',7 FROM p
    `);

    // MCS5: Burgundy Casual Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Burgundy Casual Shirt','burgundy-casual-shirt',
          'Deep burgundy in a soft flannel-weight cotton. A rich seasonal colour that makes every casual outfit feel intentional.',
          'Machine wash cold. Do not bleach. Hang dry.',
          cat.id, sub.id, tier.id, true, 2999, 0, 2999, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='casual-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Burgundy Casual Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MCS5-S-BURG','S','Burgundy',13 FROM p UNION ALL
        SELECT id,'MCS5-M-BURG','M','Burgundy',18 FROM p UNION ALL
        SELECT id,'MCS5-L-BURG','L','Burgundy',18 FROM p UNION ALL
        SELECT id,'MCS5-XL-BURG','XL','Burgundy',11 FROM p
    `);

    // ── Formal Shirt (6 products) ──────────────────────────────────────────

    // MFS1: Crisp White Formal Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Crisp White Formal Shirt','crisp-white-formal-shirt',
          'The essential white shirt, perfected. 100% poplin cotton with a spread collar, French cuffs, and precise stitching throughout.',
          'Machine wash at 40°C. Iron at high heat while damp.',
          cat.id, sub.id, tier.id, false, 4499, 0, 4499, 80, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Crisp White Formal Shirt',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Crisp White Formal Shirt cuffs',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MFS1-S-CWHT','S','White',18 FROM p UNION ALL
        SELECT id,'MFS1-M-CWHT','M','White',25 FROM p UNION ALL
        SELECT id,'MFS1-L-CWHT','L','White',25 FROM p UNION ALL
        SELECT id,'MFS1-XL-CWHT','XL','White',12 FROM p
    `);

    // MFS2: Light Blue Formal Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Light Blue Formal Shirt','light-blue-formal-shirt',
          'A boardroom staple in sky-wash blue. Slim fit with a classic point collar. Works with grey, navy, or charcoal suits.',
          'Machine wash at 30°C. Iron while slightly damp.',
          cat.id, sub.id, tier.id, false, 3499, 0, 3499, 75, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Light Blue Formal Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MFS2-S-LTBLU','S','Light Blue',18 FROM p UNION ALL
        SELECT id,'MFS2-M-LTBLU','M','Light Blue',22 FROM p UNION ALL
        SELECT id,'MFS2-L-LTBLU','L','Light Blue',22 FROM p UNION ALL
        SELECT id,'MFS2-XL-LTBLU','XL','Light Blue',13 FROM p
    `);

    // MFS3: Pale Pink Formal Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Pale Pink Formal Shirt','pale-pink-formal-shirt',
          'Soft pale pink in a premium two-ply poplin. A subtle confidence move for meetings and formal dinners.',
          'Machine wash at 30°C. Iron at medium-high heat.',
          cat.id, sub.id, tier.id, false, 4499, 0, 4499, 55, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Pale Pink Formal Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MFS3-S-PPINK','S','Pale Pink',12 FROM p UNION ALL
        SELECT id,'MFS3-M-PPINK','M','Pale Pink',16 FROM p UNION ALL
        SELECT id,'MFS3-L-PPINK','L','Pale Pink',16 FROM p UNION ALL
        SELECT id,'MFS3-XL-PPINK','XL','Pale Pink',11 FROM p
    `);

    // MFS4: Charcoal Formal Shirt (Legends Edit)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Charcoal Formal Shirt','charcoal-formal-shirt',
          'Deep charcoal in a rare Japanese cotton weave with a subtle herringbone texture. The Legends Edit redefined for the office.',
          'Dry clean recommended. Machine wash cold on silk cycle.',
          cat.id, sub.id, tier.id, false, 8999, 0, 8999, 25, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Charcoal Formal Shirt',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Charcoal Formal Shirt texture',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MFS4-S-CHAR','S','Charcoal',5 FROM p UNION ALL
        SELECT id,'MFS4-M-CHAR','M','Charcoal',8 FROM p UNION ALL
        SELECT id,'MFS4-L-CHAR','L','Charcoal',8 FROM p UNION ALL
        SELECT id,'MFS4-XL-CHAR','XL','Charcoal',4 FROM p
    `);

    // MFS5: Lavender Formal Shirt (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Lavender Formal Shirt','lavender-formal-shirt',
          'Soft lavender in a smooth 2-ply cotton. Adds a measured personality to any formal ensemble.',
          'Machine wash at 30°C. Do not tumble dry. Iron at medium heat.',
          cat.id, sub.id, tier.id, false, 3499, 20, 2799, 65, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Lavender Formal Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MFS5-S-LAV','S','Lavender',14 FROM p UNION ALL
        SELECT id,'MFS5-M-LAV','M','Lavender',18 FROM p UNION ALL
        SELECT id,'MFS5-L-LAV','L','Lavender',20 FROM p UNION ALL
        SELECT id,'MFS5-XL-LAV','XL','Lavender',13 FROM p
    `);

    // MFS6: Striped Navy Formal Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Striped Navy Formal Shirt','striped-navy-formal-shirt',
          'Classic banker stripe in navy and white. A precision-tailored slim fit that signals authority without a word.',
          'Machine wash at 30°C. Iron while damp for sharpest finish.',
          cat.id, sub.id, tier.id, false, 4999, 0, 4999, 50, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Striped Navy Formal Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MFS6-S-NVYST','S','Navy Stripe',11 FROM p UNION ALL
        SELECT id,'MFS6-M-NVYST','M','Navy Stripe',14 FROM p UNION ALL
        SELECT id,'MFS6-L-NVYST','L','Navy Stripe',16 FROM p UNION ALL
        SELECT id,'MFS6-XL-NVYST','XL','Navy Stripe',9 FROM p
    `);

    // ── T-Shirt (5 products) ───────────────────────────────────────────────

    // MTS1: Navy Blue T-Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Blue T-Shirt','navy-blue-t-shirt',
          'A foundational navy tee in 220gsm combed cotton. Structured crew neck and reinforced shoulder seams — built to last.',
          'Machine wash cold. Tumble dry low. Do not bleach.',
          cat.id, sub.id, tier.id, false, 2499, 0, 2499, 110, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Navy Blue T-Shirt',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80','Navy Blue T-Shirt back',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTS1-S-NVY','S','Navy',25 FROM p UNION ALL
        SELECT id,'MTS1-M-NVY','M','Navy',35 FROM p UNION ALL
        SELECT id,'MTS1-L-NVY','L','Navy',32 FROM p UNION ALL
        SELECT id,'MTS1-XL-NVY','XL','Navy',18 FROM p
    `);

    // MTS2: Heather Grey T-Shirt (discounted, CottoCool)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Heather Grey T-Shirt','heather-grey-t-shirt',
          'A melange heather grey in our CottoCool blend. Naturally breathable, odour-resistant, and softer with every wash.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 2999, 15, 2549, 95, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Heather Grey T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTS2-S-HGRY','S','Heather Grey',22 FROM p UNION ALL
        SELECT id,'MTS2-M-HGRY','M','Heather Grey',30 FROM p UNION ALL
        SELECT id,'MTS2-L-HGRY','L','Heather Grey',28 FROM p UNION ALL
        SELECT id,'MTS2-XL-HGRY','XL','Heather Grey',15 FROM p
    `);

    // MTS3: Forest Green T-Shirt (Signature, CottoCool)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Forest Green T-Shirt','forest-green-t-shirt',
          'A deep forest green in our premium CottoCool Signature fabric. Heavier weight with a refined collar finish and a relaxed boxy cut.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 3799, 0, 3799, 70, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Forest Green T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTS3-S-FGRN','S','Forest Green',15 FROM p UNION ALL
        SELECT id,'MTS3-M-FGRN','M','Forest Green',20 FROM p UNION ALL
        SELECT id,'MTS3-L-FGRN','L','Forest Green',22 FROM p UNION ALL
        SELECT id,'MTS3-XL-FGRN','XL','Forest Green',13 FROM p
    `);

    // MTS4: Brick Red T-Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Brick Red T-Shirt','brick-red-t-shirt',
          'A bold brick red in heavyweight 230gsm cotton. Slightly oversized with ribbed cuffs and a relaxed drop shoulder.',
          'Machine wash cold. Tumble dry low.',
          cat.id, sub.id, tier.id, false, 2499, 0, 2499, 100, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Brick Red T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTS4-S-BRED','S','Brick Red',22 FROM p UNION ALL
        SELECT id,'MTS4-M-BRED','M','Brick Red',32 FROM p UNION ALL
        SELECT id,'MTS4-L-BRED','L','Brick Red',30 FROM p UNION ALL
        SELECT id,'MTS4-XL-BRED','XL','Brick Red',16 FROM p
    `);

    // MTS5: Burgundy Signature T-Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Burgundy Signature T-Shirt','burgundy-signature-t-shirt',
          'A deep burgundy in a premium long-staple Egyptian cotton. The Signature weight and construction that holds its form wash after wash.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, false, 3799, 10, 3419, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Burgundy Signature T-Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTS5-S-BURGSIG','S','Burgundy',13 FROM p UNION ALL
        SELECT id,'MTS5-M-BURGSIG','M','Burgundy',18 FROM p UNION ALL
        SELECT id,'MTS5-L-BURGSIG','L','Burgundy',18 FROM p UNION ALL
        SELECT id,'MTS5-XL-BURGSIG','XL','Burgundy',11 FROM p
    `);

    // ── Polo (5 products) ──────────────────────────────────────────────────

    // MPL1: Emerald Green Polo
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Emerald Green Polo','emerald-green-polo',
          'Rich emerald in a fine pique cotton. A tonal collar with a three-button placket and a neat side vent. Smart casual authority.',
          'Machine wash at 30°C. Do not wring.',
          cat.id, sub.id, tier.id, false, 3999, 0, 3999, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80','Emerald Green Polo',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80','Emerald Green Polo side',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MPL1-S-EMR','S','Emerald Green',13 FROM p UNION ALL
        SELECT id,'MPL1-M-EMR','M','Emerald Green',18 FROM p UNION ALL
        SELECT id,'MPL1-L-EMR','L','Emerald Green',18 FROM p UNION ALL
        SELECT id,'MPL1-XL-EMR','XL','Emerald Green',11 FROM p
    `);

    // MPL2: White Polo
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'White Polo','white-polo',
          'The white polo — a forever essential. Mercerised cotton pique with a clean two-button placket and a relaxed regular fit.',
          'Machine wash at 30°C. Do not bleach.',
          cat.id, sub.id, tier.id, false, 2999, 0, 2999, 85, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80','White Polo',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MPL2-S-WHT','S','White',18 FROM p UNION ALL
        SELECT id,'MPL2-M-WHT','M','White',25 FROM p UNION ALL
        SELECT id,'MPL2-L-WHT','L','White',25 FROM p UNION ALL
        SELECT id,'MPL2-XL-WHT','XL','White',17 FROM p
    `);

    // MPL3: Burgundy Polo (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Burgundy Polo','burgundy-polo',
          'Bordeaux burgundy in a structured Signature pique with contrast rib collar. A versatile transition piece from the office to dinner.',
          'Machine wash at 30°C. Do not wring.',
          cat.id, sub.id, tier.id, false, 3999, 15, 3399, 55, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80','Burgundy Polo',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MPL3-S-BURGPL','S','Burgundy',12 FROM p UNION ALL
        SELECT id,'MPL3-M-BURGPL','M','Burgundy',16 FROM p UNION ALL
        SELECT id,'MPL3-L-BURGPL','L','Burgundy',18 FROM p UNION ALL
        SELECT id,'MPL3-XL-BURGPL','XL','Burgundy',9 FROM p
    `);

    // MPL4: Racing Green Polo (Legends Edit, flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Racing Green Polo','racing-green-polo',
          'Deep racing green in a premium two-ply pique with gold tipping on the collar and cuffs. The Legends Edit polo — a rare thing.',
          'Hand wash cold. Lay flat to dry.',
          cat.id, sub.id, tier.id, false, true, 7999, 20, 6399, 20, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80','Racing Green Polo',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80','Racing Green Polo collar detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MPL4-S-RACGRN','S','Racing Green',4 FROM p UNION ALL
        SELECT id,'MPL4-M-RACGRN','M','Racing Green',7 FROM p UNION ALL
        SELECT id,'MPL4-L-RACGRN','L','Racing Green',6 FROM p UNION ALL
        SELECT id,'MPL4-XL-RACGRN','XL','Racing Green',3 FROM p
    `);

    // MPL5: Sand Beige Polo
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Sand Beige Polo','sand-beige-polo',
          'A warm sand beige in a CottoCool pique. The neutral that anchors any wardrobe — pairs with chinos, trousers, or shorts.',
          'Machine wash cold. Hang dry.',
          cat.id, sub.id, tier.id, true, 2999, 0, 2999, 70, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80','Sand Beige Polo',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MPL5-S-SAND','S','Sand Beige',16 FROM p UNION ALL
        SELECT id,'MPL5-M-SAND','M','Sand Beige',22 FROM p UNION ALL
        SELECT id,'MPL5-L-SAND','L','Sand Beige',22 FROM p UNION ALL
        SELECT id,'MPL5-XL-SAND','XL','Sand Beige',10 FROM p
    `);

    // ── Trouser (3 products) ───────────────────────────────────────────────

    // MTR1: Navy Blue Slim Trouser
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Blue Slim Trouser','navy-blue-slim-trouser',
          'A tailored navy slim trouser in a stretch wool-blend. Flat front with side pockets and a clean break hem. Works with any shirt in the wardrobe.',
          'Dry clean recommended. Machine wash cold on delicate.',
          cat.id, sub.id, tier.id, false, 5999, 0, 5999, 50, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='trouser' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80','Navy Blue Slim Trouser',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTR1-30-NVY','30','Navy',10 FROM p UNION ALL
        SELECT id,'MTR1-32-NVY','32','Navy',15 FROM p UNION ALL
        SELECT id,'MTR1-34-NVY','34','Navy',15 FROM p UNION ALL
        SELECT id,'MTR1-36-NVY','36','Navy',10 FROM p
    `);

    // MTR2: Olive Chino Trouser (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Olive Chino Trouser','olive-chino-trouser',
          'Classic chino cut in a durable olive cotton twill. Sits at the natural waist with a straight leg and two back welt pockets.',
          'Machine wash cold. Tumble dry low. Iron at medium heat.',
          cat.id, sub.id, tier.id, false, 3999, 15, 3399, 65, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='trouser' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80','Olive Chino Trouser',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTR2-30-OLV','30','Olive',14 FROM p UNION ALL
        SELECT id,'MTR2-32-OLV','32','Olive',18 FROM p UNION ALL
        SELECT id,'MTR2-34-OLV','34','Olive',20 FROM p UNION ALL
        SELECT id,'MTR2-36-OLV','36','Olive',13 FROM p
    `);

    // MTR3: Black Formal Trouser (Legends Edit)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Black Formal Trouser','black-formal-trouser',
          'Pure black in a premium super-120s wool. Slim cut with a satin side stripe — the Legends Edit take on the classic dress trouser.',
          'Dry clean only. Press with a damp cloth to remove creases.',
          cat.id, sub.id, tier.id, false, 9999, 0, 9999, 25, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='trouser' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80','Black Formal Trouser',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Black Formal Trouser detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'MTR3-30-BLKF','30','Black',5 FROM p UNION ALL
        SELECT id,'MTR3-32-BLKF','32','Black',8 FROM p UNION ALL
        SELECT id,'MTR3-34-BLKF','34','Black',8 FROM p UNION ALL
        SELECT id,'MTR3-36-BLKF','36','Black',4 FROM p
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = [
      'peacock-blue-panjabi','rust-orange-panjabi','champagne-gold-panjabi',
      'sage-green-panjabi','maroon-embroidered-panjabi','electric-blue-panjabi',
      'cream-linen-panjabi','black-velvet-panjabi',
      'olive-linen-casual-shirt','terracotta-casual-shirt','navy-check-casual-shirt',
      'white-linen-casual-shirt','burgundy-casual-shirt',
      'crisp-white-formal-shirt','light-blue-formal-shirt','pale-pink-formal-shirt',
      'charcoal-formal-shirt','lavender-formal-shirt','striped-navy-formal-shirt',
      'navy-blue-t-shirt','heather-grey-t-shirt','forest-green-t-shirt',
      'brick-red-t-shirt','burgundy-signature-t-shirt',
      'emerald-green-polo','white-polo','burgundy-polo','racing-green-polo','sand-beige-polo',
      'navy-blue-slim-trouser','olive-chino-trouser','black-formal-trouser',
    ];
    const list = slugs.map(s => `'${s}'`).join(',');
    await queryRunner.query(`DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE slug IN (${list}))`);
    await queryRunner.query(`DELETE FROM product_images   WHERE product_id IN (SELECT id FROM products WHERE slug IN (${list}))`);
    await queryRunner.query(`DELETE FROM products WHERE slug IN (${list})`);
  }
}
