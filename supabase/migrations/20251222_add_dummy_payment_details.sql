-- Add dummy payment details to the event for testing
UPDATE events 
SET 
  upi_id = 'testmerchant@upi',
  payment_qr_image_url = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=testmerchant@upi&pn=TestMerchant'
WHERE id = '453bd18e-86ee-4421-bfcb-f68596362461';

-- Ensure it's a paid event so the payment dialog shows up
UPDATE events
SET is_free = false, ticket_price = 4000
WHERE id = '453bd18e-86ee-4421-bfcb-f68596362461';
