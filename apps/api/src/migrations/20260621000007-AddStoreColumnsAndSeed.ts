import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreColumnsAndSeed20260621000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE store_locations
        ADD COLUMN IF NOT EXISTS hero_image_url  TEXT,
        ADD COLUMN IF NOT EXISTS maps_url         TEXT,
        ADD COLUMN IF NOT EXISTS business_hours_text VARCHAR(400)
    `);

    await queryRunner.query(`
      INSERT INTO store_locations
        (name, address, city, country, phone, business_hours_text, hero_image_url, maps_url, lat, lng, is_active)
      VALUES
        (
          'Banani 11 Multi-Brand Store',
          'Level 3, Tower 52, Road 11, Block C, Banani, Dhaka 1213',
          'Dhaka', 'Bangladesh',
          '+880 1900-000001',
          'Open 7 days • 10:00 AM – 09:00 PM',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://maps.google.com/?q=Banani+11+Dhaka',
          23.7937, 90.4066,
          true
        ),
        (
          'Dhanmondi 27 Multi-Brand Store',
          'Level 2, Concord Royal Court, Road 27, Dhanmondi, Dhaka 1205',
          'Dhaka', 'Bangladesh',
          '+880 1900-000002',
          'Open 7 days • 10:00 AM – 09:00 PM',
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
          'https://maps.google.com/?q=Dhanmondi+27+Dhaka',
          23.7461, 90.3742,
          true
        ),
        (
          'Gulshan 1 Multi-Brand Store',
          '3rd Floor, Pink City, Plot 15, Road 103, Gulshan 1, Dhaka 1212',
          'Dhaka', 'Bangladesh',
          '+880 1900-000003',
          'Open 7 days • 10:00 AM – 09:30 PM',
          'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
          'https://maps.google.com/?q=Gulshan+1+Dhaka',
          23.7808, 90.4192,
          true
        ),
        (
          'Uttara Sector 7 Multi-Brand Store',
          'Level 2, Unimart, Sector 7, Sonargaon Janapath, Uttara, Dhaka 1230',
          'Dhaka', 'Bangladesh',
          '+880 1900-000004',
          'Open 7 days • 10:00 AM – 09:00 PM • Closed: Wednesday',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
          'https://maps.google.com/?q=Uttara+Sector+7+Dhaka',
          23.8759, 90.3795,
          true
        ),
        (
          'Chattogram GEC Circle Store',
          '2nd Floor, GEC Convention Centre, CDA Avenue, GEC Circle, Chattogram 4100',
          'Chattogram', 'Bangladesh',
          '+880 1900-000005',
          'Open 7 days • 10:00 AM – 09:00 PM',
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
          'https://maps.google.com/?q=GEC+Circle+Chattogram',
          22.3569, 91.8324,
          true
        ),
        (
          'Sylhet Zindabazar Store',
          '3rd Floor, Dream Tower, Zindabazar, Sylhet 3100',
          'Sylhet', 'Bangladesh',
          '+880 1900-000006',
          'Open 7 days • 10:00 AM – 09:00 PM • Closed: Friday',
          'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80',
          'https://maps.google.com/?q=Zindabazar+Sylhet',
          24.8949, 91.8687,
          true
        )
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM store_locations`);
    await queryRunner.query(`
      ALTER TABLE store_locations
        DROP COLUMN IF EXISTS hero_image_url,
        DROP COLUMN IF EXISTS maps_url,
        DROP COLUMN IF EXISTS business_hours_text
    `);
  }
}
