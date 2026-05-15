import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Clock,
  Award,
  Target,
  Plus,
  Filter,
  Search
} from 'lucide-react';

// Import all our components
import { 
  GlassCard, 
  GradientIconWrap, 
  SectionHeading, 
  SaaSButton, 
  EmptyState
} from '../../components/ui';
import { 
  StudentGrowthChart, 
  RevenueChart, 
  ProgressChart 
} from '../../components/charts';
import { ActivityTable } from '../../components/tables';
import { CourseCard } from '../../components/CourseCard';
import { PageTransition, StaggerContainer } from '../../components/animations';
import { useResponsive } from '../../hooks/useResponsive';
import { useToast } from '../../components/Toast';
import apiService from '../../services/api';

const TeacherDashboard = () => {
  const { isMobile, isTablet } = useResponsive();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    completionRate: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [courses, setCourses] = useState([]);

  const canRenderCharts = useMemo(() => {
    // charts are present already; keep this to avoid rendering on initial empty state
    return !loading;
  }, [loading]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [analyticsRes, coursesRes] = await Promise.all([
          apiService.analytics.getDashboard(),
          apiService.courses.getTeacherCourses()
        ]);

        const analyticsData = analyticsRes?.data?.data ?? analyticsRes?.data ?? {};
        const teacherCourses = coursesRes?.data?.data ?? coursesRes?.data ?? [];

        // Normalize analytics data to the existing UI expectations.
        setStats({
          totalStudents: analyticsData?.totalStudents ?? 0,
          totalCourses: analyticsData?.totalCourses ?? 0,
          totalRevenue: analyticsData?.totalRevenue ?? 0,
          completionRate: analyticsData?.completionRate ?? 0
        });

        const activity = analyticsData?.recentActivity ?? analyticsData?.activity ?? [];
        setRecentActivity(Array.isArray(activity) ? activity : []);

        setCourses(Array.isArray(teacherCourses) ? teacherCourses : []);
      } catch (e) {
        setRecentActivity([]);
        setCourses([]);
        setStats({
          totalStudents: 0,
          totalCourses: 0,
          totalRevenue: 0,
          completionRate: 0
        });
        error(e?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedPeriod]);

  const handleCourseAction = (action) => {
    switch (action) {
      case 'edit':
        success('Opening course editor...');
        break;
      case 'analytics':
        success('Loading analytics...');
        break;
      default:
        break;
    }
  };

  const handleActivityAction = (action) => {
    switch (action) {
      case 'view':
        success('Viewing activity details');
        break;
      default:
        break;
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {change && (
              <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <GradientIconWrap size="lg" gradient={color}>
            <Icon className="w-6 h-6" />
          </GradientIconWrap>
        </div>
      </GlassCard>
    </motion.div>
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's what's happening with your courses.
            </p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            
            <SaaSButton icon={Plus} onClick={() => success('Opening course creator...')}>
              New Course
            </SaaSButton>
          </div>
        </div>

        {/* Stats Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            change={12}
            color="primary"
          />
          <StatCard
            icon={BookOpen}
            title="Total Courses"
            value={stats.totalCourses}
            change={8}
            color="success"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={24}
            color="warning"
          />
          <StatCard
            icon={Target}
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            change={5}
            color="info"
          />
        </StaggerContainer>

        {/* Charts Section */}
        <div className="space-y-6">
          <SectionHeading
            title="Analytics Overview"
            subtitle="Track your performance and growth"
            icon={TrendingUp}
          />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StudentGrowthChart />
            <RevenueChart />
          </div>
          
          <CourseAnalyticsChart />
          <ProgressChart />
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <SectionHeading
            title="Recent Activity"
            subtitle="Latest student activities and interactions"
            icon={Clock}
            action={
              <SaaSButton variant="outline" size="sm" icon={Filter}>
                Filter
              </SaaSButton>
            }
          />
          
          <ActivityTable
            data={recentActivity}
            loading={false}
            onView={(item) => handleActivityAction('view', item)}
            onEdit={(item) => handleActivityAction('edit', item)}
          />
        </div>

        {/* Courses Section */}
        <div className="space-y-6">
          <SectionHeading
            title="My Courses"
            subtitle="Manage and monitor your course performance"
            icon={BookOpen}
            action={
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <SaaSButton variant="outline" size="sm" icon={Plus}>
                  Add Course
                </SaaSButton>
              </div>
            }
          />
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isTeacher={true}
                  onContinue={(id) => handleCourseAction('continue', id)}
                  onEdit={(id) => handleCourseAction('edit', id)}
                  onDelete={(id) => handleCourseAction('delete', id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="noCourses"
              title="No courses found"
              subtitle="Start by creating your first course to begin teaching."
              action={
                <SaaSButton icon={Plus} onClick={() => success('Opening course creator...')}>
                  Create Your First Course
                </SaaSButton>
              }
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center">
            <GradientIconWrap size="xl" gradient="primary" className="mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </GradientIconWrap>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Schedule Live Session
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Plan and schedule upcoming live classes
            </p>
            <SaaSButton variant="outline" fullWidth>
              Schedule Now
            </SaaSButton>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <GradientIconWrap size="xl" gradient="success" className="mx-auto mb-4">
              <Award className="w-8 h-8" />
            </GradientIconWrap>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Create Quiz
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Design assessments for your students
            </p>
            <SaaSButton variant="outline" fullWidth>
              Create Quiz
            </SaaSButton>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <GradientIconWrap size="xl" gradient="warning" className="mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </GradientIconWrap>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              View Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Detailed analytics and insights
            </p>
            <SaaSButton variant="outline" fullWidth>
              View Analytics
            </SaaSButton>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default TeacherDashboard;
