import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDemoData20260614000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tiers
    await queryRunner.query(`
      INSERT INTO tiers (name, slug, description, sort_order) VALUES
        ('Legends Edit', 'legends-edit', 'Our most premium, limited-edition collection — crafted for those who define the moment.', 1),
        ('Signature',    'signature',    'Elevated everyday pieces with signature craftsmanship and refined details.', 2),
        ('Classic',      'classic',      'Timeless staples made to move with you. Versatile, breathable, always on point.', 3)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Categories
    await queryRunner.query(`
      INSERT INTO categories (name, slug, description, hero_image_url, nav_image_url, sort_order) VALUES
        ('Men',   'men',   'Premium menswear from panjabi to polo.',   'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=80', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', 1),
        ('Women', 'women', 'Elegant womenswear for every occasion.',   'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', 2),
        ('Kids',  'kids',  'Comfortable, stylish clothing for kids.', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&q=80', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80', 3)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Sub-categories
    await queryRunner.query(`
      INSERT INTO sub_categories (category_id, name, slug, description, hero_image_url, sort_order)
      SELECT c.id, v.name, v.slug, v.description, v.hero_image_url, v.sort_order
      FROM categories c,
      (VALUES
        ('men',   'Panjabi',        'panjabi',        'Traditional South Asian kurta and panjabi.',    'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=1600&q=80', 1),
        ('men',   'Casual Shirt',   'casual-shirt',   'Relaxed shirts for weekends and casual outings.','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1600&q=80', 2),
        ('men',   'Formal Shirt',   'formal-shirt',   'Crisp, tailored shirts for work and occasions.','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80', 3),
        ('men',   'T-Shirt',        't-shirt',        'Premium cotton tees for everyday wear.',         'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1600&q=80', 4),
        ('men',   'Polo',           'polo',           'Classic polo shirts with a modern edge.',        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=1600&q=80', 5),
        ('men',   'Trouser',        'trouser',        'Tailored trousers for every dress code.',        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1600&q=80', 6),
        ('women', 'Salwar Kameez',  'salwar-kameez',  'Graceful salwar kameez in premium fabrics.',    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&q=80', 1),
        ('women', 'Tops',           'tops',           'Versatile tops for every mood and moment.',      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1600&q=80', 2),
        ('kids',  'Boys Panjabi',   'boys-panjabi',   'Miniature panjabi for the little ones.',         'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&q=80', 1),
        ('kids',  'Girls Frock',    'girls-frock',    'Colourful frocks for festive occasions.',         'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80', 2)
      ) AS v(cat_slug, name, slug, description, hero_image_url, sort_order)
      WHERE c.slug = v.cat_slug
      ON CONFLICT (slug) DO NOTHING
    `);

    // Product 1: Royal Navy Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Royal Navy Panjabi','royal-navy-panjabi',
          'A statement piece in deep navy. Crafted from 100% cotton with hand-embroidered collar detailing. Perfect for Eid, weddings, and formal dinners.',
          'Dry clean only. Iron at medium heat on reverse side.',
          cat.id, sub.id, tier.id, true, 8999, 0, 8999, 45, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=800&q=80','Royal Navy Panjabi front',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80','Royal Navy Panjabi side',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'RNP-S-NAVY','S','Navy',10 FROM p UNION ALL
        SELECT id,'RNP-M-NAVY','M','Navy',15 FROM p UNION ALL
        SELECT id,'RNP-L-NAVY','L','Navy',12 FROM p UNION ALL
        SELECT id,'RNP-XL-NAVY','XL','Navy',8 FROM p
    `);

    // Product 2: Pearl White Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Pearl White Panjabi','pearl-white-panjabi',
          'Ethereal white in a breathable CottoCool blend. Intricate thread work on the chest makes this a timeless festive choice.',
          'Hand wash cold. Do not bleach. Dry flat.',
          cat.id, sub.id, tier.id, true, 7499, 10, 6749, 30, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80','Pearl White Panjabi front',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80','Pearl White Panjabi detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'PWP-S-WHITE','S','White',8 FROM p UNION ALL
        SELECT id,'PWP-M-WHITE','M','White',12 FROM p UNION ALL
        SELECT id,'PWP-L-WHITE','L','White',7 FROM p UNION ALL
        SELECT id,'PWP-XL-WHITE','XL','White',3 FROM p
    `);

    // Product 3: Forest Green Panjabi
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Forest Green Panjabi','forest-green-panjabi',
          'Deep forest green in a structured cotton blend. The tonal embroidery adds depth without distraction.',
          'Machine wash cold on delicate. Hang dry.',
          cat.id, sub.id, tier.id, false, 5999, 0, 5999, 50, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80','Forest Green Panjabi',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'FGP-S-GREEN','S','Forest Green',15 FROM p UNION ALL
        SELECT id,'FGP-M-GREEN','M','Forest Green',18 FROM p UNION ALL
        SELECT id,'FGP-L-GREEN','L','Forest Green',12 FROM p UNION ALL
        SELECT id,'FGP-XL-GREEN','XL','Forest Green',5 FROM p
    `);

    // Product 4: Oxford Blue Formal Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Oxford Blue Formal Shirt','oxford-blue-formal-shirt',
          'A boardroom-ready shirt in crisp Oxford weave. Slim-fit silhouette with mother-of-pearl buttons and a clean collar.',
          'Machine wash at 30°C. Iron while slightly damp.',
          cat.id, sub.id, tier.id, false, 4999, 0, 4999, 60, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='formal-shirt' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Oxford Blue Formal Shirt',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Oxford Blue Formal Shirt detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'OBF-S-BLUE','S','Oxford Blue',12 FROM p UNION ALL
        SELECT id,'OBF-M-BLUE','M','Oxford Blue',20 FROM p UNION ALL
        SELECT id,'OBF-L-BLUE','L','Oxford Blue',18 FROM p UNION ALL
        SELECT id,'OBF-XL-BLUE','XL','Oxford Blue',10 FROM p
    `);

    // Product 5: Essential Black T-Shirt
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Essential Black T-Shirt','essential-black-t-shirt',
          'The perfect black tee. Heavyweight 220gsm cotton with a structured neck that holds its shape wash after wash.',
          'Machine wash cold. Tumble dry low. Do not bleach.',
          cat.id, sub.id, tier.id, true, 2499, 0, 2499, 120, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80','Essential Black T-Shirt',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80','Essential Black T-Shirt back',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'EBT-S-BLACK','S','Black',30 FROM p UNION ALL
        SELECT id,'EBT-M-BLACK','M','Black',40 FROM p UNION ALL
        SELECT id,'EBT-L-BLACK','L','Black',35 FROM p UNION ALL
        SELECT id,'EBT-XL-BLACK','XL','Black',15 FROM p
    `);

    // Product 6: Cloud White T-Shirt (CottoCool, discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Cloud White T-Shirt','cloud-white-t-shirt',
          'Our signature CottoCool blend keeps you 3°C cooler. Ultra-soft, anti-odour, and built for the tropics.',
          'Machine wash cold. Hang dry in shade.',
          cat.id, sub.id, tier.id, true, 2999, 15, 2549, 100, 10
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='t-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80','Cloud White T-Shirt CottoCool',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'CWT-S-WHITE','S','White',25 FROM p UNION ALL
        SELECT id,'CWT-M-WHITE','M','White',35 FROM p UNION ALL
        SELECT id,'CWT-L-WHITE','L','White',30 FROM p UNION ALL
        SELECT id,'CWT-XL-WHITE','XL','White',10 FROM p
    `);

    // Product 7: Navy Polo
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Navy Polo','navy-polo',
          'The polo reimagined. Pique cotton with a clean two-button placket and rib cuffs. Smart casual done right.',
          'Machine wash at 30°C. Do not wring.',
          cat.id, sub.id, tier.id, false, 3499, 0, 3499, 80, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80','Navy Polo front',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80','Navy Polo detail',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'NVP-S-NAVY','S','Navy',20 FROM p UNION ALL
        SELECT id,'NVP-M-NAVY','M','Navy',30 FROM p UNION ALL
        SELECT id,'NVP-L-NAVY','L','Navy',22 FROM p UNION ALL
        SELECT id,'NVP-XL-NAVY','XL','Navy',8 FROM p
    `);

    // Product 8: Slate Grey Casual Shirt (discounted)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Slate Grey Casual Shirt','slate-grey-casual-shirt',
          'A relaxed-fit shirt in washed slate grey. Soft linen-cotton blend with a chest pocket and button-down collar.',
          'Machine wash cold. Do not dry clean.',
          cat.id, sub.id, tier.id, false, 3999, 20, 3199, 55, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='casual-shirt' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','Slate Grey Casual Shirt',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'SGC-S-GREY','S','Slate Grey',12 FROM p UNION ALL
        SELECT id,'SGC-M-GREY','M','Slate Grey',18 FROM p UNION ALL
        SELECT id,'SGC-L-GREY','L','Slate Grey',15 FROM p UNION ALL
        SELECT id,'SGC-XL-GREY','XL','Slate Grey',10 FROM p
    `);

    // Product 9: Burgundy Legends Panjabi (flash sale)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, is_flash_sale, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Burgundy Legends Panjabi','burgundy-legends-panjabi',
          'A deep burgundy statement piece with gold zari work along the collar and cuffs. Exclusively for our Legends Edit.',
          'Dry clean only. Store in breathable garment bag.',
          cat.id, sub.id, tier.id, false, true, 11999, 25, 8999, 20, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='panjabi' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','Burgundy Legends Panjabi',true,0 FROM p),
      img2 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80','Burgundy Legends embroidery',false,1 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'BLP-S-BURG','S','Burgundy',5 FROM p UNION ALL
        SELECT id,'BLP-M-BURG','M','Burgundy',8 FROM p UNION ALL
        SELECT id,'BLP-L-BURG','L','Burgundy',5 FROM p UNION ALL
        SELECT id,'BLP-XL-BURG','XL','Burgundy',2 FROM p
    `);

    // Product 10: Charcoal Slim Trouser
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Charcoal Slim Trouser','charcoal-slim-trouser',
          'Tailored in a wool-blend stretch fabric. Slim-fit silhouette with a flat front and side pockets.',
          'Dry clean recommended. Machine wash cold on delicate.',
          cat.id, sub.id, tier.id, false, 5499, 0, 5499, 40, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='trouser' AND tier.slug='signature'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80','Charcoal Slim Trouser',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'CST-30-CHAR','30','Charcoal',10 FROM p UNION ALL
        SELECT id,'CST-32-CHAR','32','Charcoal',15 FROM p UNION ALL
        SELECT id,'CST-34-CHAR','34','Charcoal',12 FROM p UNION ALL
        SELECT id,'CST-36-CHAR','36','Charcoal',3 FROM p
    `);

    // Product 11: Rose Anarkali Salwar Kameez (Women)
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Rose Anarkali Salwar Kameez','rose-anarkali-salwar-kameez',
          'A flowing rose-coloured Anarkali silhouette in georgette fabric. Comes with matching palazzo and dupatta.',
          'Dry clean only. Hand wash cold in gentle detergent.',
          cat.id, sub.id, tier.id, false, 9999, 10, 8999, 25, 5
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='women' AND sub.slug='salwar-kameez' AND tier.slug='legends-edit'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80','Rose Anarkali Salwar Kameez',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'RAS-XS-ROSE','XS','Rose',5 FROM p UNION ALL
        SELECT id,'RAS-S-ROSE','S','Rose',8 FROM p UNION ALL
        SELECT id,'RAS-M-ROSE','M','Rose',8 FROM p UNION ALL
        SELECT id,'RAS-L-ROSE','L','Rose',4 FROM p
    `);

    // Product 12: Cobalt Blue Polo
    await queryRunner.query(`
      WITH p AS (
        INSERT INTO products (name, slug, description, care_instructions, category_id, sub_category_id, tier_id,
          is_cottocool, base_price_cents, discount_percent, final_price_cents, stock_total, low_stock_threshold)
        SELECT 'Cobalt Blue Polo','cobalt-blue-polo',
          'A vibrant cobalt polo in premium pique cotton. The contrast rib detail adds a sporty-luxe edge.',
          'Machine wash at 30°C. Do not bleach.',
          cat.id, sub.id, tier.id, true, 3299, 0, 3299, 65, 8
        FROM categories cat, sub_categories sub, tiers tier
        WHERE cat.slug='men' AND sub.slug='polo' AND tier.slug='classic'
        RETURNING id
      ),
      img1 AS (INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
        SELECT id,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80','Cobalt Blue Polo',true,0 FROM p)
      INSERT INTO product_variants (product_id, sku, size, colour, stock_qty)
        SELECT id,'CBP-S-COBALT','S','Cobalt Blue',15 FROM p UNION ALL
        SELECT id,'CBP-M-COBALT','M','Cobalt Blue',25 FROM p UNION ALL
        SELECT id,'CBP-L-COBALT','L','Cobalt Blue',18 FROM p UNION ALL
        SELECT id,'CBP-XL-COBALT','XL','Cobalt Blue',7 FROM p
    `);

    // Nav items
    await queryRunner.query(`
      WITH men_nav AS (
        INSERT INTO nav_items (label, url, type, ref_id, parent_id, is_active, show_in_nav, sort_order)
        SELECT 'Men', '/c/men', 'category', c.id, NULL, true, true, 1
        FROM categories c WHERE c.slug = 'men'
        RETURNING id
      ),
      women_nav AS (
        INSERT INTO nav_items (label, url, type, ref_id, parent_id, is_active, show_in_nav, sort_order)
        SELECT 'Women', '/c/women', 'category', c.id, NULL, true, true, 2
        FROM categories c WHERE c.slug = 'women'
        RETURNING id
      ),
      kids_nav AS (
        INSERT INTO nav_items (label, url, type, ref_id, parent_id, is_active, show_in_nav, sort_order)
        SELECT 'Kids', '/c/kids', 'category', c.id, NULL, true, true, 3
        FROM categories c WHERE c.slug = 'kids'
        RETURNING id
      ),
      sale_nav AS (
        INSERT INTO nav_items (label, url, type, ref_id, parent_id, is_active, show_in_nav, sort_order)
        VALUES ('Sale', '/sale', 'link', NULL, NULL, true, true, 4)
        RETURNING id
      ),
      men_children AS (
        INSERT INTO nav_items (label, url, type, parent_id, is_active, show_in_nav, sort_order)
        SELECT v.label, v.url, 'sub_category', men_nav.id, true, true, v.sort_order
        FROM men_nav, (VALUES
          ('Panjabi',       '/s/panjabi',      1),
          ('Casual Shirts', '/s/casual-shirt', 2),
          ('Formal Shirts', '/s/formal-shirt', 3),
          ('T-Shirts',      '/s/t-shirt',      4),
          ('Polo',          '/s/polo',         5),
          ('Trouser',       '/s/trouser',      6)
        ) AS v(label, url, sort_order)
      )
      INSERT INTO nav_items (label, url, type, parent_id, is_active, show_in_nav, sort_order)
      SELECT v.label, v.url, 'sub_category', women_nav.id, true, true, v.sort_order
      FROM women_nav, (VALUES
        ('Salwar Kameez', '/s/salwar-kameez', 1),
        ('Tops',          '/s/tops',          2)
      ) AS v(label, url, sort_order)
    `);

    // Banners
    await queryRunner.query(`
      INSERT INTO banners (title, subtitle, image_url, link_url, page_type, is_active, sort_order) VALUES
        ('Eid Collection 2025',
         'Where tradition meets modern elegance. The Legends Edit — now live.',
         'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&q=90',
         '/c/men', 'homepage', true, 1),
        ('New Season. New Story.',
         'Fresh silhouettes. Signature fabrics. Shop the latest drops.',
         'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1920&q=90',
         '/c/women', 'homepage', true, 2),
        ('Men — The Panjabi Edit',
         'Refined heritage. Modern cut. Discover our panjabi collection.',
         'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=1920&q=90',
         '/s/panjabi', 'category_men', true, 1)
      ON CONFLICT DO NOTHING
    `);

    // App Settings
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description) VALUES
        ('site_name',                     'NOOREMOON',                    true,  'Brand name displayed in the header and title'),
        ('site_tagline',                  'Premium South Asian Fashion',  true,  'Short tagline shown below the logo'),
        ('announcement_bar_text',         'Free shipping on orders over $150 · Shop the Eid Collection →', true, 'Scrolling announcement bar text'),
        ('announcement_bar_active',       'true',                         true,  'Toggle announcement bar on/off'),
        ('shipping_flat_rate_cents',      '1000',                         true,  'Flat shipping rate in cents'),
        ('free_shipping_threshold_cents', '15000',                        true,  'Free shipping above this order total (cents)'),
        ('exchange_window_days',          '7',                            true,  'Days after delivery customer can request exchange'),
        ('loyalty_points_per_dollar',     '10',                           true,  'Loyalty points earned per dollar spent'),
        ('support_email',                 'support@nooremoon.global',     true,  'Customer-facing support email'),
        ('instagram_url',                 'https://instagram.com/nooremoon', true, 'Instagram profile URL'),
        ('facebook_url',                  'https://facebook.com/nooremoon',  true, 'Facebook page URL'),
        ('customs_disclaimer_text',       'International orders may be subject to import duties and taxes, which are the responsibility of the recipient.', true, 'Customs disclaimer shown at checkout')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM nav_items`);
    await queryRunner.query(`DELETE FROM banners WHERE page_type IN ('homepage','category_men')`);
    await queryRunner.query(`DELETE FROM product_variants WHERE sku ~ '^(RNP|PWP|FGP|OBF|EBT|CWT|NVP|SGC|BLP|CST|RAS|CBP)-'`);
    await queryRunner.query(`DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE slug IN ('royal-navy-panjabi','pearl-white-panjabi','forest-green-panjabi','oxford-blue-formal-shirt','essential-black-t-shirt','cloud-white-t-shirt','navy-polo','slate-grey-casual-shirt','burgundy-legends-panjabi','charcoal-slim-trouser','rose-anarkali-salwar-kameez','cobalt-blue-polo'))`);
    await queryRunner.query(`DELETE FROM products WHERE slug IN ('royal-navy-panjabi','pearl-white-panjabi','forest-green-panjabi','oxford-blue-formal-shirt','essential-black-t-shirt','cloud-white-t-shirt','navy-polo','slate-grey-casual-shirt','burgundy-legends-panjabi','charcoal-slim-trouser','rose-anarkali-salwar-kameez','cobalt-blue-polo')`);
    await queryRunner.query(`DELETE FROM sub_categories WHERE slug IN ('panjabi','casual-shirt','formal-shirt','t-shirt','polo','trouser','salwar-kameez','tops','boys-panjabi','girls-frock')`);
    await queryRunner.query(`DELETE FROM categories WHERE slug IN ('men','women','kids')`);
    await queryRunner.query(`DELETE FROM tiers WHERE slug IN ('legends-edit','signature','classic')`);
  }
}
