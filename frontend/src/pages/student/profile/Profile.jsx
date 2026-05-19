import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award,
  BookOpen, Edit2, Save, Camera, CheckCircle2, X, Plus, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { Input } from "../../../components/ui/Input";
import { ProgressBar } from "../../../components/ui/ProgressBar";

const profile = {
  name: "Sarah Johnson",
  email: "sarah.johnson@university.edu",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Passionate learner and aspiring full-stack developer. Currently exploring advanced JavaScript patterns and data science fundamentals.",
  avatar: "",
  role: "Computer Science Student",
  joinedDate: "September 2024",
  skills: ["JavaScript", "React", "Python", "Data Science", "UI/UX Design"],
  education: [
    { degree: "Bachelor of Science in Computer Science", school: "Stanford University", year: "2024 - 2028" }
  ],
  achievements: [
    { title: "Quick Learner", desc: "Completed 5 courses in first month", icon: Award },
    { title: "Perfect Score", desc: "Scored 100% on JavaScript Quiz", icon: CheckCircle2 },
    { title: "Consistent", desc: "7-day learning streak", icon: BookOpen },
  ],
  stats: {
    coursesCompleted: 8,
    hoursLearned: 124,
    quizzesTaken: 15,
    avgScore: 87,
    certificatesEarned: 3,
    currentStreak: 7,
  }
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Profile Header */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <Avatar className="w-28 h-28 text-3xl bg-white/20" src={profile.avatar} fallback={profile.name.charAt(0)} />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
              <Camera className="h-4 w-4 text-slate-600" />
            </button>
          </div>
          <div className="flex-1 text-white space-y-2">
            <Badge className="bg-white/20 text-white border-0">{profile.role}</Badge>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-white/80 max-w-xl">{profile.bio}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {profile.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {profile.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Joined {profile.joinedDate}</span>
            </div>
          </div>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 gap-2" onClick={() => setEditing(!editing)}>
            {editing ? <><X className="h-4 w-4" /> Cancel</> : <><Edit2 className="h-4 w-4" /> Edit Profile</>}
          </Button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(profile.stats).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <motion.div variants={item}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Location</label>
                      <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-1 block">Bio</label>
                      <textarea className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Full Name</p><p className="font-medium">{profile.name}</p></div>
                    <div><p className="text-muted-foreground">Email</p><p className="font-medium">{profile.email}</p></div>
                    <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{profile.phone}</p></div>
                    <div><p className="text-muted-foreground">Location</p><p className="font-medium">{profile.location}</p></div>
                  </div>
                )}
                {editing && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Education */}
          <motion.div variants={item}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Education</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="p-3 rounded-lg bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="font-semibold">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.school}</p>
                      <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills */}
          <motion.div variants={item}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                  {editing && (
                    <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />Add</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={item}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Achievements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {profile.achievements.map((ach, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 shrink-0"><ach.icon className="h-4 w-4 text-amber-600" /></div>
                    <div>
                      <p className="font-medium text-sm">{ach.title}</p>
                      <p className="text-xs text-muted-foreground">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}