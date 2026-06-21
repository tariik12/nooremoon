import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fixes two classes of image issues:
 * 1. Broken 404 Unsplash URLs — replaced with verified working alternatives
 * 2. Direct-woman photos on Islamic/modest-fashion products — replaced with
 *    fabric, flat-lay, or texture shots (no person visible)
 */
export class FixProductImages20260620000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── 1. Fix globally broken (404) photo IDs ─────────────────────────────

    // photo-1631233859262 (panjabi detail) → working panjabi photo
    await queryRunner.query(`
      UPDATE product_images
      SET url = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80'
      WHERE url = 'https://images.unsplash.com/photo-1631233859262-0c49bfc9d4a1?w=800&q=80'
    `);

    // photo-1594938298603 (panjabi) → working men's kurta photo
    await queryRunner.query(`
      UPDATE product_images
      SET url = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80'
      WHERE url = 'https://images.unsplash.com/photo-1594938298603-c8148c4b4849?w=800&q=80'
    `);

    // photo-1541643600914 (panjabi/casual) → working shirt photo
    await queryRunner.query(`
      UPDATE product_images
      SET url = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'
      WHERE url = 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80'
    `);

    // ── 2. photo-1583391733956 (404 + showed woman) ─────────────────────────
    // This was the most widely used broken URL. Replace per sub-category with
    // appropriate fabric / flat-lay images that do NOT show a woman.

    // Abaya → dark draped-fabric texture
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'abaya'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // Salwar Kameez → woven ethnic textile close-up
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'salwar-kameez'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // Kurti → folded-clothing flat-lay
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'kurti'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // Saree → silk/drape fabric shot
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'saree'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // Dress → clothing flat-lay on neutral background
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'dress'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // Girls Frock → fabric / product texture
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'girls-frock'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // Girls Salwar → ethnic textile close-up
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'girls-salwar'
        AND pi.url = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    `);

    // ── 3. Replace remaining woman-showing images on Islamic categories ──────

    // Abaya: photo-1578632292335 shows a woman in abaya → dark fabric texture
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'abaya'
        AND pi.url = 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80'
    `);

    // Saree: photo-1610030469983 shows woman in saree → silk fabric shot
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'saree'
        AND pi.url = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'
    `);

    // Kurti: photo-1434389677669 shows woman in top → flat-lay clothing shot
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'kurti'
        AND pi.url = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'
    `);

    // Dress: photo-1539109136881 shows woman in dress → clothing flat-lay
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'dress'
        AND pi.url = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'
    `);

    // Dress: photo-1434389677669 also used on dress → flat-lay
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'dress'
        AND pi.url = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'
    `);

    // Girls Salwar: photo-1543163521 (used here may look wrong) → fabric
    await queryRunner.query(`
      UPDATE product_images pi
      SET url = 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80'
      FROM products p
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE pi.product_id = p.id
        AND sc.slug = 'girls-salwar'
        AND pi.url = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Image URL fixes are not safely reversible — original broken URLs would
    // just re-introduce 404s and inappropriate images.
  }
}
