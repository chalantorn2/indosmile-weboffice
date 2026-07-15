-- 014: Payment fields for tour bookings (Stripe)
--
-- payment_reference  : Stripe Checkout Session id (cs_...), set when the customer
--                      starts a payment; used by the webhook to reconcile.
-- payment_intent_id  : Stripe PaymentIntent id (pi_...), set once payment succeeds.
--
-- `payment_status` / `payment_method` / `payment_date` already exist on `bookings`.

ALTER TABLE `bookings`
    ADD COLUMN `payment_reference` VARCHAR(255) NULL COMMENT 'Stripe Checkout Session id' AFTER `payment_date`,
    ADD COLUMN `payment_intent_id` VARCHAR(255) NULL COMMENT 'Stripe PaymentIntent id' AFTER `payment_reference`,
    ADD INDEX `idx_payment_reference` (`payment_reference`);
