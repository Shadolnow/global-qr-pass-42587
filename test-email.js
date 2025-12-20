// Test script to verify Resend API configuration
// Run this to check if your Resend API key is working

import { Resend } from 'resend';

const RESEND_API_KEY = 're_RbDAfxBw_Ao3CovXUbc1t9pAp86jCqYAQ';

async function testResendEmail() {
    console.log('🧪 Testing Resend API Configuration...\n');

    try {
        const resend = new Resend(RESEND_API_KEY);

        console.log('📧 Sending test email...');

        const { data, error } = await resend.emails.send({
            from: 'EventTix <onboarding@resend.dev>',
            to: 'eventix.now@gmail.com', // Your Resend account email (testing mode)
            subject: '✅ EventTix - Email Verification Test',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
              <h1 style="color: white; margin: 0;">✅ Success!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
              <h2>Resend API is Working! 🎉</h2>
              <p>Your EventTix email configuration is set up correctly.</p>
              <p><strong>API Key:</strong> ${RESEND_API_KEY.substring(0, 10)}...</p>
              <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              <hr>
              <p style="color: #666; font-size: 14px;">
                This is a test email from your EventTix application.<br>
                Email verification and OTP system is ready to go! 🚀
              </p>
            </div>
          </body>
        </html>
      `
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            console.log('\n🔍 Troubleshooting:');
            console.log('1. Check your Resend API key is valid');
            console.log('2. Verify you have email sending credits');
            console.log('3. Make sure the API key has proper permissions');
            return false;
        }

        console.log('✅ Email sent successfully!');
        console.log('📬 Email ID:', data.id);
        console.log('\n🎉 Configuration is working!');
        console.log('👉 Check your inbox (and spam folder)');
        console.log('👉 Verify OTP emails will work the same way');

        return true;
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔍 Common issues:');
        console.log('- Invalid API key format');
        console.log('- Network connectivity issues');
        console.log('- Resend service is down');
        return false;
    }
}

// Run the test
console.log('🚀 EventTix Email Configuration Test\n');
console.log('━'.repeat(50));

testResendEmail().then(success => {
    console.log('━'.repeat(50));
    if (success) {
        console.log('\n✅ ALL SYSTEMS GO! Email verification will work.');
        console.log('📝 Next: Add this to Vercel environment variables');
        console.log('📄 Guide: See VERCEL_ENV_SETUP.md\n');
    } else {
        console.log('\n❌ Configuration needs attention');
        console.log('📄 Help: See FIX_EMAIL_VERIFICATION.md\n');
    }
    process.exit(success ? 0 : 1);
});
