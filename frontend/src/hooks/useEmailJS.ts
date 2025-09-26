import { useState } from 'react';
import emailjs from 'emailjs-com';

interface EmailData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

export const useEmailJS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (data: EmailData) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // You'll need to replace these with your actual EmailJS credentials
      const serviceId = 'service_iq4trqn';
      const templateId = 'template_dhiisyh';
      const publicKey = 'GBjIBvOhKmWGV4PoF';

      const templateParams = {
        from_name: data.fullName,
        from_email: data.email,
        phone: data.phone,
        message: data.message,
        to_name: 'Pico Skincare & Cosmo',
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('EmailJS error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendEmail, isLoading, isSuccess, error };
};