# 📧 TareqsDrip Email System - User Guide

## 🎯 Overview

This is a complete automated email system for your TareqsDrip e-commerce platform. It sends beautiful branded emails to customers and gives you full control over what gets sent.

---

## 🚀 How to Use the System

### **For Administrators**

#### **1. Admin Email Settings** (`/admin/email/settings`)

**What it does**: Control which email types are active globally

**How to use**:
1. Navigate to: `http://localhost:3000/admin/email/settings`
2. Toggle features ON/OFF:
   - **Sales Announcements** - Turn on/off sale notification emails
   - **Special Offers** - Control promotional emails with coupons
   - **New Products** - Enable/disable new product launch emails
   - **Order Emails** - Control order confirmations & shipping updates
3. Configure sender information:
   - **From Email**: The email address customers see
   - **From Name**: Display name (e.g., "TareqsDrip")
   - **Reply To**: Where customer replies go (optional)
4. Set **Rate Limiting**: Max marketing emails per user per day
5. Click **"Save Settings"**

**Best Practices**:
- Keep order emails ALWAYS ON - customers need these
- Adjust rate limits during high-traffic seasons
- Use a professional from email address

---

#### **2. Email Campaigns** (`/admin/email/campaigns`)

**What it does**: Create and send bulk marketing emails to customers

**How to create a campaign**:
1. Navigate to: `http://localhost:3000/admin/email/campaigns`
2. Click **"Create Campaign"**
3. Fill in details:
   - **Campaign Name**: Internal name (e.g., "Summer Sale 2025")
   - **Description**: What this campaign is about
   - **Email Type**: Choose template
     - Sales Announcement
     - Special Offer
     - New Product
     - Promotional
   - **Email Subject**: What users see in inbox
   - **Target**: Send to all users or specific ones
4. Click **"Create Campaign"**
5. Click **"Send Now"** when ready

**Campaign Status**:
- **DRAFT**: Not sent yet, can edit
- **SCHEDULED**: Will send at specified time
- **SENDING**: Currently being sent
- **SENT**: Complete, view stats
- **FAILED**: Had errors, check logs

**Tracking**:
- Total Recipients
- Success Count
- Failure Count
- Open Rate (future feature)
- Click Rate (future feature)

---

### **For Users/Customers**

#### **3. Email Preferences** (`/settings/email`)

**What it does**: Let users control which emails they receive

**How to use**:
1. Navigate to: `http://localhost:3000/settings/email`
2. Choose preferences:
   
   **Marketing Emails**:
   - ✅/❌ Sales Announcements
   - ✅/❌ Special Offers
   - ✅/❌ New Products
   
   **Order Updates**:
   - ✅/❌ Order Confirmations
   - ✅/❌ Shipping & Delivery
   
   **Unsubscribe All**:
   - ✅ Stop all marketing emails (order updates still sent)

3. Click **"Save Preferences"**

**Note**: Critical emails (like order confirmations) will still be sent even if user opts out, but only the essential ones.

---

## 📧 Email Types Explained

### **1. Order Emails** (Transactional - Always Important)

#### **Order Confirmation**
- **When sent**: Immediately after customer places order
- **Contains**: Order number, items, total, shipping address, estimated delivery
- **Trigger**: Automatic via Inngest when order is created

#### **Order Shipped**
- **When sent**: When order ships
- **Contains**: Tracking number, carrier, delivery estimate
- **Trigger**: Automatic when order status changes to "shipped"

#### **Order Delivered**
- **When sent**: When package is delivered
- **Contains**: Delivery confirmation, request for review
- **Trigger**: Automatic when tracking shows delivered

---

### **2. Marketing Emails**

#### **Sales Announcement**
- **Use for**: Major sales events (Black Friday, Summer Sale)
- **Contains**: Sale title, discount percentage, start/end dates, featured image
- **Best time**: Send 1-2 days before sale starts

#### **Special Offer**
- **Use for**: Exclusive discounts, coupon codes
- **Contains**: Offer details, coupon code, expiry date
- **Best time**: During slow sales periods

#### **New Product Launch**
- **Use for**: Announcing new arrivals
- **Contains**: Product image, description, price, link
- **Best time**: Weekly or bi-weekly

#### **Welcome Email**
- **When sent**: Automatically when user signs up
- **Contains**: Welcome message, brand introduction, first-time discount
- **Trigger**: Automatic via Clerk webhook

---

## 🔧 How the System Works (Behind the Scenes)

### **Email Flow**

```
1. Trigger Event (Order, Campaign, User Signup)
   ↓
2. Inngest Background Job Starts
   ↓
3. Check Admin Settings (Is this email type enabled?)
   ↓
4. Check User Preferences (Did user opt in?)
   ↓
5. Generate Email from Template
   ↓
6. Send via Mailtrap
   ↓
7. Log Result in Database
   ↓
8. Update Campaign Stats (if applicable)
```

### **Smart Features**

1. **Respect User Choices**: Won't send if user opted out
2. **Admin Override**: Global toggle overrides everything
3. **Batch Processing**: Sends 100 emails at a time
4. **Retry Logic**: Failed emails retry automatically
5. **Rate Limiting**: Prevents email spam
6. **Full Audit Trail**: Every email logged

---

## 🎨 Email Templates

All emails use TareqsDrip branding with:
- Purple/Indigo gradient theme
- Modern, mobile-responsive design
- Unsubscribe link in footer
- Professional layout
- Brand logo placeholder

---

## 🔨 Developer Integration

### **Trigger Order Emails from Your Code**

```typescript
import { inngest } from '@/lib/inngest/client';

// When order is created
await inngest.send({
  name: 'order/created',
  data: {
    orderId: order.id,
    userId: user.id,
    email: user.email,
  },
});

// When order ships
await inngest.send({
  name: 'order/shipped',
  data: {
    orderId: order.id,
    userId: user.id,
    email: user.email,
  },
});

// When order is delivered
await inngest.send({
  name: 'order/delivered',
  data: {
    orderId: order.id,
    userId: user.id,
    email: user.email,
  },
});
```

### **Trigger Welcome Email**

```typescript
// When user signs up (via Clerk webhook)
await inngest.send({
  name: 'user/created',
  data: {
    userId: user.id,
    email: user.emailAddress,
    firstName: user.firstName,
  },
});
```

### **Send Campaign**

```typescript
// After creating campaign via admin panel
await inngest.send({
  name: 'email/campaign.send',
  data: {
    campaignId: campaign.id,
  },
});
```

---

## 📊 Monitoring & Analytics

### **Email Logs** (Database Table: `email_logs`)

Every email is logged with:
- Recipient email
- Email type
- Status (SENT, FAILED, SKIPPED)
- Timestamp
- Error message (if failed)
- Campaign ID (if part of campaign)

### **View Logs** (Future Feature)
You can add an admin page to view:
```typescript
const logs = await prisma.emailLog.findMany({
  orderBy: { createdAt: 'desc' },
  take: 100,
});
```

---

## 🚨 Troubleshooting

### **Emails Not Sending?**

1. **Check Admin Settings**: Is the email type enabled?
2. **Check User Preferences**: Did the user opt in?
3. **Check Mailtrap**: Valid API token in `.env`?
4. **Check Inngest**: Is dev server running?
5. **Check Database**: Are there error logs?

### **Campaign Stuck in SENDING?**

1. Check Inngest dashboard: `http://localhost:8288`
2. Look for failed job runs
3. Check email logs for errors

### **User Says They're Not Getting Emails**

1. Check their preferences: `/settings/email`
2. Check if they unsubscribed from all
3. Verify their email is correct in database

---

## 🎓 Best Practices

### **For Admins**

1. **Don't Spam**: Limit marketing emails to 2-3 per week
2. **Test First**: Send to yourself before bulk sending
3. **Segment Audience**: Target specific users when possible
4. **Monitor Stats**: Check open rates and failures
5. **Update Templates**: Keep content fresh and relevant

### **For Users**

1. **Set Preferences Early**: Choose what you want to receive
2. **Use Folders**: Create email rules for TareqsDrip emails
3. **Check Spam**: First email might go to spam folder
4. **Unsubscribe Properly**: Use preference page, not spam button

---

## 📱 Mobile View

All email templates are mobile-responsive and look great on:
- iOS Mail
- Gmail (Android/iOS)
- Outlook Mobile
- Samsung Email

---

## 🔐 Security & Privacy

- User preferences are stored securely
- Emails contain unique unsubscribe links
- API tokens are environment variables only
- No email content is logged
- GDPR/CAN-SPAM compliant

---

## 🆘 Support

**Issues?**
1. Check this guide first
2. Look at the README.md for technical setup
3. Check Inngest dashboard for job failures
4. Review Mailtrap dashboard for delivery issues

**Need Help?**
- Email logs show detailed errors
- Inngest provides step-by-step execution traces
- Mailtrap shows delivery attempts

---

## 🚀 Quick Start Checklist

- [ ] Inngest dev server running: `npx inngest-cli dev`
- [ ] Next.js app running: `npm run dev`
- [ ] Mailtrap API token configured in `.env`
- [ ] Database connected (Neon PostgreSQL)
- [ ] Admin settings configured
- [ ] Test email sent successfully

---

**That's it! You now have a complete understanding of how to use the TareqsDrip Email System.** 🎉
