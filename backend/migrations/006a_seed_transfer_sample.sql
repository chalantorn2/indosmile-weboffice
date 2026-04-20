-- =====================================================================
-- Sample data for Transfer system (run AFTER 006_create_transfer_system.sql)
-- =====================================================================
-- 8 locations · 3 vehicles (Sedan / SUV / Van)
-- ALL 28 location pairs covered (every location reachable from every other)
-- Routes are stored with origin_id < destination_id (bidirectional).
-- =====================================================================

-- ─── Locations ───────────────────────────────────────────────────────
INSERT INTO `transfer_locations` (`id`, `name`, `is_active`, `sort_order`) VALUES
    (1, 'Phuket Airport (HKT)', 1, 1),
    (2, 'Patong Beach',         1, 2),
    (3, 'Karon Beach',          1, 3),
    (4, 'Kata Beach',           1, 4),
    (5, 'Phuket Old Town',      1, 5),
    (6, 'Rawai Beach',          1, 6),
    (7, 'Krabi Airport (KBV)',  1, 7),
    (8, 'Khao Lak',             1, 8);

-- ─── Vehicles ────────────────────────────────────────────────────────
INSERT INTO `transfer_vehicles`
    (`id`, `name`, `max_passengers`, `max_luggage`, `image_url`, `description`, `is_active`, `sort_order`) VALUES
    (1, 'Sedan', 3, 2,
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
        'Comfortable sedan ideal for couples or solo travelers with light luggage.',
        1, 1),
    (2, 'SUV', 5, 4,
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
        'Spacious SUV suitable for small families with extra luggage room.',
        1, 2),
    (3, 'Van', 9, 7,
        'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=800&q=80',
        'Roomy van for groups, families, and travelers with plenty of luggage.',
        1, 3);

-- ─── Routes (all 28 pairs) ───────────────────────────────────────────
-- Always insert with origin_id < destination_id (bidirectional pairing)
INSERT INTO `transfer_routes` (`id`, `origin_id`, `destination_id`, `is_active`) VALUES
    -- From Phuket Airport (1) to all others
    ( 1, 1, 2, 1),  -- HKT ↔ Patong
    ( 2, 1, 3, 1),  -- HKT ↔ Karon
    ( 3, 1, 4, 1),  -- HKT ↔ Kata
    ( 4, 1, 5, 1),  -- HKT ↔ Old Town
    ( 5, 1, 6, 1),  -- HKT ↔ Rawai
    ( 6, 1, 7, 1),  -- HKT ↔ Krabi Airport
    ( 7, 1, 8, 1),  -- HKT ↔ Khao Lak
    -- From Patong (2) to remaining
    ( 8, 2, 3, 1),  -- Patong ↔ Karon
    ( 9, 2, 4, 1),  -- Patong ↔ Kata
    (10, 2, 5, 1),  -- Patong ↔ Old Town
    (11, 2, 6, 1),  -- Patong ↔ Rawai
    (12, 2, 7, 1),  -- Patong ↔ Krabi Airport
    (13, 2, 8, 1),  -- Patong ↔ Khao Lak
    -- From Karon (3) to remaining
    (14, 3, 4, 1),  -- Karon ↔ Kata
    (15, 3, 5, 1),  -- Karon ↔ Old Town
    (16, 3, 6, 1),  -- Karon ↔ Rawai
    (17, 3, 7, 1),  -- Karon ↔ Krabi Airport
    (18, 3, 8, 1),  -- Karon ↔ Khao Lak
    -- From Kata (4) to remaining
    (19, 4, 5, 1),  -- Kata ↔ Old Town
    (20, 4, 6, 1),  -- Kata ↔ Rawai
    (21, 4, 7, 1),  -- Kata ↔ Krabi Airport
    (22, 4, 8, 1),  -- Kata ↔ Khao Lak
    -- From Old Town (5) to remaining
    (23, 5, 6, 1),  -- Old Town ↔ Rawai
    (24, 5, 7, 1),  -- Old Town ↔ Krabi Airport
    (25, 5, 8, 1),  -- Old Town ↔ Khao Lak
    -- From Rawai (6) to remaining
    (26, 6, 7, 1),  -- Rawai ↔ Krabi Airport
    (27, 6, 8, 1),  -- Rawai ↔ Khao Lak
    -- Krabi Airport ↔ Khao Lak
    (28, 7, 8, 1);  -- Krabi Airport ↔ Khao Lak

-- ─── Route Prices ────────────────────────────────────────────────────
-- (route_id, vehicle_id, price)  -- vehicle_id: 1=Sedan, 2=SUV, 3=Van
INSERT INTO `transfer_route_prices` (`route_id`, `vehicle_id`, `price`) VALUES
    -- 1: HKT ↔ Patong
    ( 1, 1,  800.00), ( 1, 2, 1100.00), ( 1, 3, 1300.00),
    -- 2: HKT ↔ Karon
    ( 2, 1,  900.00), ( 2, 2, 1200.00), ( 2, 3, 1400.00),
    -- 3: HKT ↔ Kata
    ( 3, 1, 1000.00), ( 3, 2, 1300.00), ( 3, 3, 1500.00),
    -- 4: HKT ↔ Old Town
    ( 4, 1,  700.00), ( 4, 2, 1000.00), ( 4, 3, 1200.00),
    -- 5: HKT ↔ Rawai
    ( 5, 1, 1100.00), ( 5, 2, 1400.00), ( 5, 3, 1600.00),
    -- 6: HKT ↔ Krabi Airport
    ( 6, 1, 2800.00), ( 6, 2, 3200.00), ( 6, 3, 3600.00),
    -- 7: HKT ↔ Khao Lak
    ( 7, 1, 1800.00), ( 7, 2, 2200.00), ( 7, 3, 2500.00),
    -- 8: Patong ↔ Karon
    ( 8, 1,  500.00), ( 8, 2,  700.00), ( 8, 3,  900.00),
    -- 9: Patong ↔ Kata
    ( 9, 1,  600.00), ( 9, 2,  800.00), ( 9, 3, 1000.00),
    -- 10: Patong ↔ Old Town
    (10, 1,  600.00), (10, 2,  800.00), (10, 3, 1000.00),
    -- 11: Patong ↔ Rawai
    (11, 1,  800.00), (11, 2, 1000.00), (11, 3, 1300.00),
    -- 12: Patong ↔ Krabi Airport
    (12, 1, 3000.00), (12, 2, 3500.00), (12, 3, 3900.00),
    -- 13: Patong ↔ Khao Lak
    (13, 1, 2200.00), (13, 2, 2700.00), (13, 3, 3000.00),
    -- 14: Karon ↔ Kata
    (14, 1,  400.00), (14, 2,  500.00), (14, 3,  700.00),
    -- 15: Karon ↔ Old Town
    (15, 1,  700.00), (15, 2,  900.00), (15, 3, 1100.00),
    -- 16: Karon ↔ Rawai
    (16, 1,  600.00), (16, 2,  800.00), (16, 3, 1000.00),
    -- 17: Karon ↔ Krabi Airport
    (17, 1, 3100.00), (17, 2, 3600.00), (17, 3, 4000.00),
    -- 18: Karon ↔ Khao Lak
    (18, 1, 2400.00), (18, 2, 2900.00), (18, 3, 3200.00),
    -- 19: Kata ↔ Old Town
    (19, 1,  700.00), (19, 2,  900.00), (19, 3, 1100.00),
    -- 20: Kata ↔ Rawai
    (20, 1,  500.00), (20, 2,  700.00), (20, 3,  900.00),
    -- 21: Kata ↔ Krabi Airport
    (21, 1, 3200.00), (21, 2, 3700.00), (21, 3, 4100.00),
    -- 22: Kata ↔ Khao Lak
    (22, 1, 2500.00), (22, 2, 3000.00), (22, 3, 3300.00),
    -- 23: Old Town ↔ Rawai
    (23, 1,  700.00), (23, 2,  900.00), (23, 3, 1100.00),
    -- 24: Old Town ↔ Krabi Airport
    (24, 1, 2900.00), (24, 2, 3300.00), (24, 3, 3700.00),
    -- 25: Old Town ↔ Khao Lak
    (25, 1, 2000.00), (25, 2, 2500.00), (25, 3, 2800.00),
    -- 26: Rawai ↔ Krabi Airport
    (26, 1, 3300.00), (26, 2, 3800.00), (26, 3, 4200.00),
    -- 27: Rawai ↔ Khao Lak
    (27, 1, 2700.00), (27, 2, 3200.00), (27, 3, 3500.00),
    -- 28: Krabi Airport ↔ Khao Lak
    (28, 1, 4000.00), (28, 2, 4500.00), (28, 3, 5000.00);
