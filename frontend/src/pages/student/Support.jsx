import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const StudentSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, showing placeholder data
        setTickets([
          {
            _id: '1',
            subject: 'Login Issue',
            message: 'I am having trouble logging into my account',
            priority: 'high',
            status: 'open',
            createdAt: '2024-05-10T10:30:00Z',
            responses: []
          },
          {
            _id: '2',
            subject: 'Course Access',
            message: 'Cannot access the JavaScript course',
            priority: 'medium',
            status: 'resolved',
            createdAt: '2024-05-08T14:20:00Z',
            responses: [
              {
                message: 'Your access has been restored. Please try again.',
                createdAt: '2024-05-09T09:15:00Z'
              }
            ]
          }
        ]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load support tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicket.subject || !newTicket.message) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // This would need to be implemented in the backend
      const ticket = {
        _id: Date.now().toString(),
        ...newTicket,
        status: 'open',
        createdAt: new Date().toISOString(),
        responses: []
      };

      setTickets([ticket, ...tickets]);
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Support Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help from our support team.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* New Ticket Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Support Ticket
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showForm ? 'Cancel' : 'New Ticket'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of your issue"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Submit Ticket
            </button>
          </form>
        )}
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Support Tickets
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {ticket.subject}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {ticket.message}
                  </p>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {ticket.responses && ticket.responses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {ticket.responses.map((response, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Support Team - {new Date(response.createdAt).toLocaleDateString()}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {response.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {tickets.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 text-lg">
              No support tickets found.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSupport;
