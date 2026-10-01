# LexCollect auth email templates

Branded versions of the Supabase Auth emails LexCollect sends. Supabase stores these in the
project's dashboard, not in code, so changes here must be pasted in by hand.

The links point to `/auth/confirm` in the app (`src/pages/AuthConfirmPage.tsx`). That page only
redeems the one-time token when the person clicks its button, so mail scanners that open links
first (Microsoft Defender Safe Links, Mimecast, etc.) can't use up the invite.

## Setup (Supabase dashboard → Authentication)

Do these in order. The app has to be live with the `/auth/confirm` route before the templates go in.

1. **URL Configuration**
   - **Site URL**: the live LexCollect address, e.g. `https://app.example.com`. No trailing slash:
     the templates build links as `{{ .SiteURL }}/auth/confirm`.
   - **Redirect URLs**: add `https://app.example.com/auth/confirm` (or `https://app.example.com/**`).

2. **Emails → SMTP Settings**: turn on custom SMTP (Resend, Postmark, SendGrid, Amazon SES,
   Microsoft 365, ...).
   - **Sender name**: `LexCollect`
   - **Sender email**: an address on a domain you own, e.g. `noreply@yourfirm.com`

   Without custom SMTP, email comes from Supabase's own address, and Supabase only delivers it to
   members of your Supabase organization, so invites to new staff never arrive.

3. **Emails → Templates**: paste each file's full contents into the matching template and set its
   subject.

   | Supabase template | Subject | File | Sent when |
   | --- | --- | --- | --- |
   | Invite user | `You're invited to LexCollect` | `invite.html` | Settings → Add User → Send Invite Email |
   | Reset password | `Set your LexCollect password` | `recovery.html` | Resend Invite for someone who already accepted, or a password reset email from Settings → Account |
   | Magic link | `Your LexCollect sign-in link` | `magic_link.html` | "Email Me a Magic Link" on the sign-in page |

4. Deploy the `admin-user-management` edge function so new invitees are flagged to set a password:
   `npx supabase functions deploy admin-user-management`

## Testing

Send an invite to an address you control from **Settings → User Access → Add User**. The email
should come from "LexCollect", and the button should open `/auth/confirm`, ask the recipient to
accept, then ask them to choose a password before landing on their dashboard.
