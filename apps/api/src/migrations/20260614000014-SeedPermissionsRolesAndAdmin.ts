import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedPermissionsRolesAndAdmin20260614000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Permissions ────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO permissions (key, label, "group", description) VALUES
        ('products.view',           'View Products',              'Products',   'View product listings and details'),
        ('products.create',         'Create Products',            'Products',   'Add new products'),
        ('products.edit',           'Edit Products',              'Products',   'Update existing products'),
        ('products.delete',         'Delete Products',            'Products',   'Delete products'),
        ('categories.view',         'View Categories',            'Products',   'View categories and sub-categories'),
        ('categories.create',       'Create Categories',          'Products',   'Add new categories'),
        ('categories.edit',         'Edit Categories',            'Products',   'Update categories'),
        ('categories.delete',       'Delete Categories',          'Products',   'Delete categories'),
        ('tiers.manage',            'Manage Tiers',               'Products',   'Create, edit and delete quality tiers'),
        ('orders.view',             'View Orders',                'Orders',     'View all customer orders'),
        ('orders.update_status',    'Update Order Status',        'Orders',     'Change order status'),
        ('orders.cancel',           'Cancel Orders',              'Orders',     'Cancel customer orders'),
        ('exchange.view',           'View Exchange Requests',     'Orders',     'View exchange requests'),
        ('exchange.approve',        'Approve Exchanges',          'Orders',     'Approve exchange requests'),
        ('exchange.reject',         'Reject Exchanges',           'Orders',     'Reject exchange requests'),
        ('customers.view',          'View Customers',             'Customers',  'View customer accounts'),
        ('customers.edit',          'Edit Customers',             'Customers',  'Edit customer profiles'),
        ('cms.view',                'View CMS Pages',             'CMS',        'View CMS content'),
        ('cms.publish',             'Publish CMS Pages',          'CMS',        'Publish and unpublish CMS pages'),
        ('cms.unpublish',           'Unpublish CMS Pages',        'CMS',        'Unpublish CMS pages'),
        ('banners.manage',          'Manage Banners',             'Marketing',  'Create, edit and delete banners'),
        ('seasons.manage',          'Manage Seasons',             'Marketing',  'Create and manage seasonal collections'),
        ('loyalty.manage',          'Manage Loyalty',             'Loyalty',    'Manage loyalty tiers and settings'),
        ('gift_cards.manage',       'Manage Gift Cards',          'Loyalty',    'Manage gift card templates'),
        ('promotions.manage',       'Manage Promotions',          'Marketing',  'Create and manage promotions and flash sales'),
        ('reports.view',            'View Reports',               'Reports',    'Access analytics and reports'),
        ('admin.manage_roles',      'Manage Roles',               'Admin',      'Create and edit user roles and permissions'),
        ('admin.manage_users',      'Manage Admin Users',         'Admin',      'Manage admin user accounts'),
        ('admin.manage_settings',   'Manage Settings',            'Admin',      'Edit application settings'),
        ('payments.manage',         'Manage Payment Gateways',    'Admin',      'Configure payment gateway settings')
      ON CONFLICT (key) DO NOTHING
    `);

    // ── Roles ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO roles (name, label, description, is_system) VALUES
        ('admin',     'Super Admin',      'Full access to everything', true),
        ('customer',  'Customer',         'Registered customer account', true),
        ('support',   'Support Agent',    'Customer support and order management', false),
        ('marketing', 'Marketing Editor', 'CMS, banners, seasons and promotions', false)
      ON CONFLICT (name) DO NOTHING
    `);

    // ── Assign all permissions to admin role ───────────────────────────────
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'admin'
        ON CONFLICT DO NOTHING
    `);

    // ── Assign support permissions ─────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'support'
          AND p.key IN (
            'orders.view','orders.update_status',
            'exchange.view','exchange.approve','exchange.reject',
            'customers.view','customers.edit'
          )
        ON CONFLICT DO NOTHING
    `);

    // ── Assign marketing permissions ───────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'marketing'
          AND p.key IN (
            'cms.view','cms.publish','cms.unpublish',
            'banners.manage','seasons.manage','promotions.manage',
            'products.view','categories.view','reports.view'
          )
        ON CONFLICT DO NOTHING
    `);

    // ── Default admin user ─────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nooremoon.global';
    const rawPassword = process.env.ADMIN_PASSWORD || 'changeme_before_deploy';
    const passwordHash = await bcrypt.hash(rawPassword, 12);

    await queryRunner.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_email_verified, is_active)
        SELECT $1, $2, 'Super', 'Admin', r.id, true, true
        FROM roles r WHERE r.name = 'admin'
        ON CONFLICT (email) DO NOTHING
    `, [adminEmail, passwordHash]);

    // ── Default app settings ───────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO app_settings (key, value, is_public, description) VALUES
        ('shipping_flat_rate_cents',      '500',    true,  'Flat shipping rate in cents'),
        ('free_shipping_threshold_cents', '5000',   true,  'Free shipping above this order total (cents)'),
        ('loyalty_points_per_dollar',     '1',      true,  'Loyalty points earned per dollar spent'),
        ('exchange_window_days',          '7',      true,  'Days after delivery customer can request exchange'),
        ('announcement_bar_text',         '',       true,  'Top announcement bar text'),
        ('customs_disclaimer_text',       '',       true,  'Customs and import duty disclaimer'),
        ('support_email',                 'support@nooremoon.global', true, 'Customer-facing support email'),
        ('instagram_url',                 '',       true,  'Instagram profile URL'),
        ('facebook_url',                  '',       true,  'Facebook page URL'),
        ('tiktok_url',                    '',       true,  'TikTok profile URL')
      ON CONFLICT (key) DO NOTHING
    `);

    // ── Default payment gateways ───────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO payment_gateways (key, label, is_active, sort_order) VALUES
        ('stripe', 'Credit / Debit Card', false, 1),
        ('bkash',  'bKash',               false, 2),
        ('eps',    'Bangladesh EPS',       false, 3)
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM payment_gateways WHERE key IN ('stripe','bkash','eps')`);
    await queryRunner.query(`DELETE FROM app_settings WHERE key IN ('shipping_flat_rate_cents','free_shipping_threshold_cents','loyalty_points_per_dollar','exchange_window_days','announcement_bar_text','customs_disclaimer_text','support_email','instagram_url','facebook_url','tiktok_url')`);
    await queryRunner.query(`DELETE FROM users WHERE email = $1`, [process.env.ADMIN_EMAIL || 'admin@nooremoon.global']);
    await queryRunner.query(`DELETE FROM role_permissions`);
    await queryRunner.query(`DELETE FROM roles WHERE name IN ('admin','customer','support','marketing')`);
    await queryRunner.query(`DELETE FROM permissions`);
  }
}
