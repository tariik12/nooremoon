import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fixes hero_image_url / nav_image_url on categories and sub_categories:
 * 1. Replaces 404 Unsplash photo IDs with verified working alternatives
 * 2. Replaces direct-woman photos on Islamic/modest-fashion sub-categories
 *    with fabric, flat-lay, or texture shots (no person visible)
 */
export class FixHeroImages20260620000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── Sub-categories ─────────────────────────────────────────────────────

    // panjabi: 404 (photo-1594938298603) → men's South Asian kurta scene
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&q=80'
      WHERE slug = 'panjabi'
    `);

    // kurti: 404 (photo-1583391733956) → folded-clothing flat-lay, no woman
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80'
      WHERE slug = 'kurti'
    `);

    // salwar-kameez: 404 (photo-1583391733956) → woven ethnic textile close-up
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80'
      WHERE slug = 'salwar-kameez'
    `);

    // abaya: shows woman (photo-1578632292335) → dark draped-fabric texture
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80'
      WHERE slug = 'abaya'
    `);

    // dress: shows woman (photo-1539109136881) → clothing flat-lay, no person
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80'
      WHERE slug = 'dress'
    `);

    // tops: shows woman (photo-1434389677669) → fashion product flat-lay
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80'
      WHERE slug = 'tops'
    `);

    // saree: shows woman (photo-1610030469983) → silk-fabric drape, no person
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80'
      WHERE slug = 'saree'
    `);

    // girls-frock: photo-1543163521 (shoes image, wrong for frocks) → fabric texture
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=1600&q=80'
      WHERE slug = 'girls-frock'
    `);

    // girls-salwar: photo-1543163521 (same wrong image) → ethnic textile
    await queryRunner.query(`
      UPDATE sub_categories
      SET hero_image_url = 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1600&q=80'
      WHERE slug = 'girls-salwar'
    `);

    // ── Categories ─────────────────────────────────────────────────────────

    // women: shows woman (photo-1539109136881) → clothing product flat-lay
    await queryRunner.query(`
      UPDATE categories
      SET
        hero_image_url = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80',
        nav_image_url  = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80'
      WHERE slug = 'women'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Not reversing — original URLs were either 404 or showed women on Islamic products.
  }
}
