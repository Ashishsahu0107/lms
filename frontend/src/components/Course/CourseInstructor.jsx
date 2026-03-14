import React from 'react';

const CourseInstructor = ({ instructor }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Instructor</h2>
      <div className="flex items-center gap-4">
        <img 
          src={instructor?.avatar || 'https://via.placeholder.com/100'} 
          alt={instructor?.name}
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h3 className="text-xl font-semibold">{instructor?.name}</h3>
          <p className="text-gray-600">{instructor?.title}</p>
          <p className="text-gray-500 mt-2">{instructor?.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseInstructor;