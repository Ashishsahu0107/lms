import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

const LearningSupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      id: 1,
      question: 'How do I enroll in a course?',
      answer: 'Navigate to the Courses page, find your desired course, and click the "Enroll Now" button. You will immediately gain access to all course materials.',
    },
    {
      id: 2,
      question: 'Can I download course materials?',
      answer: 'Yes! Most courses provide downloadable resources. You can download lecture notes, code files, and other materials directly from each lesson.',
    },
    {
      id: 3,
      question: 'Is there a certificate upon completion?',
      answer: 'Yes! Upon completing all lessons and passing the final quiz, you will receive a certificate of completion that you can share on your profile.',
    },
    {
      id: 4,
      question: 'Can I access courses on mobile?',
      answer: 'Absolutely! Our platform is fully responsive and optimized for mobile devices. You can learn on the go anytime, anywhere.',
    },
    {
      id: 5,
      question: 'What if I need help with course content?',
      answer: 'Use our discussion forums, join live support sessions, or contact our instructors directly. Most questions are answered within 24 hours.',
    },
    {
      id: 6,
      question: 'Can I get a refund?',
      answer: 'Yes, we offer a 30-day money-back guarantee if you are not satisfied with the course.',
    },
  ];

  const supportChannels = [
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      time: 'Available 9 AM - 6 PM',
    },
    {
      icon: <Mail className="w-8 h-8 text-green-600" />,
      title: 'Email Support',
      description: 'support@lms.com',
      time: 'Response within 24 hours',
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      time: 'Available 10 AM - 8 PM',
    },
    {
      icon: <HelpCircle className="w-8 h-8 text-yellow-600" />,
      title: 'Knowledge Base',
      description: 'Browse common issues',
      time: 'Available 24/7',
    },
  ];

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', contactForm);
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Learning Support Center
          </h1>
          <p className="text-xl text-gray-600">
            Get help with your learning journey
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((channel, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition"
            >
              <div className="flex justify-center mb-4">
                {channel.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {channel.title}
              </h3>
              <p className="text-gray-600 mb-3">{channel.description}</p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {channel.time}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'faq'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'tips'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Learning Tips
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="border-l-4 border-gray-300 hover:border-blue-600 transition pl-4 py-2 cursor-pointer group"
                >
                  <summary className="font-semibold text-gray-900 py-2">
                    {faq.question}
                  </summary>
                  <p className="text-gray-600 mt-2 ml-4">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700">
                    We've received your message and will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    rows="6"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Effective Learning Tips
              </h2>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    1. Set a Learning Schedule
                  </h3>
                  <p className="text-gray-700">
                    Dedicate specific time each day to learning. Consistency is key to progress.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    2. Take Notes
                  </h3>
                  <p className="text-gray-700">
                    Writing down key concepts helps with retention and understanding.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    3. Practice Hands-On
                  </h3>
                  <p className="text-gray-700">
                    Apply what you learn through assignments and projects.
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-600">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    4. Join Communities
                  </h3>
                  <p className="text-gray-700">
                    Engage with other learners to discuss concepts and share knowledge.
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-600">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    5. Review Regularly
                  </h3>
                  <p className="text-gray-700">
                    Go back and review previous lessons to reinforce your learning.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningSupportPage;
