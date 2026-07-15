<?php

/**
 * Tour booking emails — every message a booking can generate, in one place.
 *
 * The customer sees three, in order:
 *   1. sendCustomerBookingReceivedEmail  — request received, do not pay yet
 *   2. sendCustomerPaymentLinkEmail      — confirmed, here is your Pay Now button
 *   3. sendPaymentReceiptEmail           — payment received
 *
 * Shared by bookings.php (booking + confirm + manual mark-paid) and
 * stripe_webhook.php (card payment), so a receipt looks the same however it was paid.
 *
 * Requires helpers.php (sendMail, emailLayout, emailInfoTable, bookingStatusUrl).
 */

/**
 * Trip rows reused across the booking emails.
 */
function bookingDetailRows($booking, $tour)
{
    return [
        'Tour'         => $tour['name'] ?? '-',
        'Destination'  => $tour['destination'] ?? '-',
        'Travel Date'  => date('d M Y', strtotime($booking['travel_date'])),
        'Adults'       => $booking['adults'],
        'Children'     => $booking['children'] > 0 ? $booking['children'] : null,
        'Total Guests' => $booking['number_of_guests'],
        'Total Price'  => number_format((float)$booking['total_price'], 0) . ' ' . ($booking['currency'] ?? 'THB'),
    ];
}

/**
 * On a new booking: notify the office and confirm receipt to the customer.
 */
function sendBookingEmails($booking, $tour)
{
    sendAdminBookingEmail($booking, $tour);
    sendCustomerBookingReceivedEmail($booking, $tour);
}

/**
 * Admin: new booking landed, go confirm it.
 */
function sendAdminBookingEmail($booking, $tour)
{
    $ref = $booking['booking_reference'];

    $content = "<h3 style='color:#1B2E4A;margin-top:0;'>Customer</h3>"
        . emailInfoTable([
            'Name'  => $booking['customer_name'],
            'Email' => $booking['customer_email'],
            'Phone' => $booking['customer_phone'],
        ])
        . "<h3 style='color:#1B2E4A;margin-top:20px;'>Booking Details</h3>"
        . emailInfoTable(bookingDetailRows($booking, $tour));

    if (!empty($booking['special_requests'])) {
        $requests = nl2br(htmlspecialchars($booking['special_requests'], ENT_QUOTES, 'UTF-8'));
        $content .= "<h3 style='color:#1B2E4A;margin-top:20px;'>Special Requests</h3>
            <p style='background:#fff;padding:12px;border-radius:4px;'>{$requests}</p>";
    }

    $content .= "<p style='margin-top:20px;font-size:13px;color:#666;'>
        Confirm this booking in the admin panel to send the customer their payment link.</p>";

    sendMail(
        ADMIN_EMAIL,
        'New Booking from ' . $booking['customer_name'] . ' - ' . ($tour['name'] ?? 'Tour') . ' (' . $ref . ')',
        emailLayout('New Tour Booking', $ref, $content, 'yellow'),
        $booking['customer_name'] . ' <' . $booking['customer_email'] . '>'
    );
}

/**
 * Customer, mail 1 of 3: request received, awaiting confirmation.
 * No payment link yet — availability is checked by hand before we ask for money.
 */
function sendCustomerBookingReceivedEmail($booking, $tour)
{
    $ref       = $booking['booking_reference'];
    $name      = htmlspecialchars($booking['customer_name'], ENT_QUOTES, 'UTF-8');
    $statusUrl = bookingStatusUrl($ref);

    $content = "<p style='margin-top:0;font-size:15px;'>Hi {$name},</p>
        <p style='font-size:15px;'>Thank you for booking with Indo Smile South Services.
        We have received your request and our team is checking availability now.</p>"
        . emailInfoTable(bookingDetailRows($booking, $tour))
        . "<div style='background:#fff;border-left:4px solid #FFC72C;padding:12px 15px;margin-top:20px;'>
            <strong style='color:#1B2E4A;'>What happens next?</strong>
            <p style='margin:6px 0 0;font-size:14px;'>We will confirm your booking within 24 hours and email you a
            secure payment link. <strong>No payment is needed yet.</strong></p>
        </div>
        <p style='text-align:center;margin:25px 0 10px;'>
            <a href='{$statusUrl}' style='display:inline-block;background:#1B2E4A;color:#fff;text-decoration:none;
               padding:12px 28px;border-radius:8px;font-weight:bold;font-size:15px;'>View Booking Status</a>
        </p>
        <p style='text-align:center;font-size:12px;color:#888;margin:0;'>
            Keep your reference <strong>{$ref}</strong> handy when contacting us.</p>";

    sendMail(
        $booking['customer_email'],
        'We received your booking - ' . ($tour['name'] ?? 'Tour') . ' (' . $ref . ')',
        emailLayout('Booking Request Received', $ref, $content, 'yellow'),
        ADMIN_EMAIL
    );
}

/**
 * Customer, mail 2 of 3: availability secured, time to pay.
 *
 * Deliberately links to the booking status page rather than embedding a Stripe URL:
 * the checkout session is minted fresh when they click Pay Now, so this email cannot
 * go stale or expire in their inbox — which also makes it safe to resend.
 */
function sendCustomerPaymentLinkEmail($booking, $tour)
{
    $ref       = $booking['booking_reference'];
    $name      = htmlspecialchars($booking['customer_name'], ENT_QUOTES, 'UTF-8');
    $statusUrl = bookingStatusUrl($ref);
    $total     = number_format((float)$booking['total_price'], 0) . ' ' . ($booking['currency'] ?? 'THB');

    $content = "<p style='margin-top:0;font-size:15px;'>Hi {$name},</p>
        <p style='font-size:15px;'>Good news — your booking is <strong>confirmed</strong> and your seats are held.
        Please complete payment to finalise it.</p>"
        . emailInfoTable([
            'Tour'         => $tour['name'] ?? '-',
            'Destination'  => $tour['destination'] ?? '-',
            'Travel Date'  => date('d M Y', strtotime($booking['travel_date'])),
            'Total Guests' => $booking['number_of_guests'],
            'Amount Due'   => $total,
        ])
        . "<p style='text-align:center;margin:25px 0 8px;'>
            <a href='{$statusUrl}' style='display:inline-block;background:#1B2E4A;color:#fff;text-decoration:none;
               padding:14px 36px;border-radius:8px;font-weight:bold;font-size:16px;'>Pay Now &middot; {$total}</a>
        </p>
        <p style='text-align:center;font-size:12px;color:#888;margin:0 0 20px;'>
            Secure card payment powered by Stripe</p>
        <div style='background:#fff;border-left:4px solid #1B2E4A;padding:12px 15px;'>
            <p style='margin:0;font-size:13px;color:#666;'>If the button does not work, open this link:<br>
            <a href='{$statusUrl}' style='color:#1B2E4A;'>{$statusUrl}</a></p>
        </div>";

    sendMail(
        $booking['customer_email'],
        'Booking confirmed - please complete payment (' . $ref . ')',
        emailLayout('Booking Confirmed', $ref, $content, 'blue'),
        ADMIN_EMAIL
    );
}

/**
 * Customer, mail 3 of 3: payment received.
 *
 * $methodLabel names how they paid — "Card (Stripe)" from the webhook, or whatever
 * the admin recorded for an offline payment.
 */
function sendPaymentReceiptEmail($booking, $tour, $methodLabel = 'Card (Stripe)')
{
    $ref  = $booking['booking_reference'];
    $name = htmlspecialchars($booking['customer_name'], ENT_QUOTES, 'UTF-8');
    $statusUrl = bookingStatusUrl($ref);

    $content = "<p style='margin-top:0;font-size:15px;'>Hi {$name},</p>
        <p style='font-size:15px;'>Your payment has been received and your booking is now fully confirmed.
        We look forward to welcoming you!</p>"
        . emailInfoTable([
            'Tour'         => $tour['name'] ?? '-',
            'Destination'  => $tour['destination'] ?? '-',
            'Travel Date'  => date('d M Y', strtotime($booking['travel_date'])),
            'Total Guests' => $booking['number_of_guests'],
            'Amount Paid'  => number_format((float)$booking['total_price'], 0) . ' ' . ($booking['currency'] ?? 'THB'),
            'Paid On'      => date('d M Y H:i'),
            'Payment'      => $methodLabel,
        ])
        . "<div style='background:#fff;border-left:4px solid #1E8E5A;padding:12px 15px;margin-top:20px;'>
            <strong style='color:#1B2E4A;'>Before you travel</strong>
            <p style='margin:6px 0 0;font-size:14px;'>Our team will contact you with pickup details.
            Please show this reference to your guide on the day.</p>
        </div>
        <p style='text-align:center;margin:25px 0 10px;'>
            <a href='{$statusUrl}' style='display:inline-block;background:#1B2E4A;color:#fff;text-decoration:none;
               padding:12px 28px;border-radius:8px;font-weight:bold;font-size:15px;'>View Booking</a>
        </p>";

    sendMail(
        $booking['customer_email'],
        'Payment received - your booking is confirmed (' . $ref . ')',
        emailLayout('Payment Received', $ref, $content, 'green'),
        ADMIN_EMAIL
    );
}

/**
 * Admin: money is in.
 */
function sendAdminPaymentEmail($booking, $tour, $methodLabel = 'Card (Stripe)')
{
    $ref = $booking['booking_reference'];

    $content = emailInfoTable([
        'Customer'    => $booking['customer_name'],
        'Email'       => $booking['customer_email'],
        'Phone'       => $booking['customer_phone'],
        'Tour'        => $tour['name'] ?? '-',
        'Travel Date' => date('d M Y', strtotime($booking['travel_date'])),
        'Guests'      => $booking['number_of_guests'],
        'Amount Paid' => number_format((float)$booking['total_price'], 0) . ' ' . ($booking['currency'] ?? 'THB'),
        'Payment'     => $methodLabel,
    ]);

    sendMail(
        ADMIN_EMAIL,
        'PAID - ' . $booking['customer_name'] . ' (' . $ref . ')',
        emailLayout('Payment Received', $ref, $content, 'green'),
        $booking['customer_email']
    );
}
