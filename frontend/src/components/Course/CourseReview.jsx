import React from 'react';

const CourseReview = ({ courseId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      <p className="text-gray-600">No reviews yet.</p>
    </div>
  );
};

export default CourseReview;