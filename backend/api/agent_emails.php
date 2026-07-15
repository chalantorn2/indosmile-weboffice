<?php

/**
 * Agent account emails.
 *
 * Only one message so far: the credentials handover. It is never sent automatically —
 * an admin presses "Email to Agent" while the one-time password is still on screen,
 * because that plaintext exists for exactly as long as that dialog is open.
 *
 * Requires helpers.php (sendMail, emailLayout, emailInfoTable, SITE_URL, ADMIN_EMAIL).
 */

/**
 * Public URL of the agent portal login screen.
 */
function agentLoginUrl()
{
    return SITE_URL . '/agent/login';
}

/**
 * Hand an agent the keys to their portal: who they are, how to get in, and the
 * temporary password they must replace on first login.
 */
function sendAgentCredentialsEmail($agent, $plainPassword)
{
    $loginUrl = agentLoginUrl();

    $company = htmlspecialchars($agent['company_name'], ENT_QUOTES, 'UTF-8');
    $contact = !empty($agent['contact_name'])
        ? htmlspecialchars($agent['contact_name'], ENT_QUOTES, 'UTF-8')
        : $company;

    $content = "<p style='margin-top:0;'>Dear {$contact},</p>

        <p>Your agent account with <strong>Indo Smile South Services</strong> is ready.
        You can now sign in to the agent portal to browse our tours and see your contract rates.</p>

        <h3 style='color:#1B2E4A;margin-top:24px;'>Your Login Details</h3>"
        . emailInfoTable([
            'Company'            => $agent['company_name'],
            'Agent Code'         => $agent['agent_code'],
            'Login Email'        => $agent['email'],
            'Temporary Password' => $plainPassword,
        ])
        . "<div style='text-align:center;margin:28px 0;'>
            <a href='{$loginUrl}'
               style='display:inline-block;background:#FFC72C;color:#1B2E4A;padding:14px 32px;
                      border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;'>
                Sign in to the Agent Portal
            </a>
        </div>

        <p style='background:#FFF8E5;border:1px solid #FFE49B;border-radius:6px;padding:14px;font-size:14px;'>
            <strong>Please change your password straight away.</strong> The password above is temporary —
            you will be asked to choose your own the first time you sign in. Do not share it with anyone.
        </p>

        <p style='font-size:14px;color:#666;'>
            If the button does not work, open this link in your browser:<br>
            <a href='{$loginUrl}' style='color:#1B2E4A;'>{$loginUrl}</a>
        </p>

        <p style='font-size:14px;'>Any trouble signing in, just reply to this email and we will sort it out.</p>

        <p style='margin-bottom:0;'>Welcome aboard,<br><strong>Indo Smile South Services</strong></p>";

    $body = emailLayout('Your Agent Account is Ready', null, $content, 'blue');

    return sendMail(
        $agent['email'],
        'Your Indo Smile agent account — login details',
        $body,
        ADMIN_EMAIL
    );
}
