-- Migration: Simplify user roles to admin/staff only
-- Run this on production DB

-- Step 1: Convert super_admin to admin
UPDATE `admin_users` SET `role` = 'admin' WHERE `role` = 'super_admin';

-- Step 2: Change enum to only admin/staff
ALTER TABLE `admin_users`
  MODIFY COLUMN `role` enum('admin','staff') NOT NULL DEFAULT 'staff';
