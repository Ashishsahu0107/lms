import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { getCourses } from "../../../services/courseService";
import { getQuizById, createQuiz, updateQuiz, getQuestionBank } from "../../../services/quizService";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import toast from "react-hot-toast";

export default function CreateQuiz() {
  const { id } = useParams(); // quizId if editing
  const navigate = useNavigate();
  const isEditing = !!id;

  // Courses List
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState(30);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [quizType, setQuizType] = useState("exam");
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [status, setStatus] = useState("published");

  // Question Bank States
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState(new Set());

  // Questions Canvas Array
  // Question Structure: { id: String (temp), type: String, question: String, options: [String], correctAnswer: [String], explanation: String, marks: Number, difficulty: String }
  const [questions, setQuestions] = useState([]);

  // Load courses & quiz details if editing
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const coursesRes = await getCourses();
        if (coursesRes.data?.success) {
          const coursesList = coursesRes.data.data || [];
          setCourses(coursesList);
          if (coursesList.length > 0 && !isEditing) {
            setCourseId(coursesList[0]._id);
          }
        }

        if (isEditing) {
          const quizRes = await getQuizById(id);
          if (quizRes.data?.success) {
            const data = quizRes.data.data;
            const quiz = data.quiz;
            setTitle(quiz.title);
            setDescription(quiz.description || "");
            setInstructions(quiz.instructions || "");
            setCourseId(quiz.courseId?._id || quiz.courseId);
            setDuration(quiz.duration);
            setTotalMarks(quiz.totalMarks);
            setPassingMarks(quiz.passingMarks);
            setQuizType(quiz.quizType || "exam");
            setAttemptLimit(quiz.attemptLimit);
            setShuffleQuestions(!!quiz.shuffleQuestions);
            setShuffleOptions(!!quiz.shuffleOptions);
            setStartDate(quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : "");
            setEndDate(quiz.endDate ? new Date(quiz.endDate).toISOString().slice(0, 16) : "");
            setNegativeMarking(!!quiz.negativeMarking);
            setStatus(quiz.status || "published");

            // Populate Questions array with loaded references
            const populatedQuestions = (data.questions || []).map((q) => ({
              id: q._id,
              type: q.type,
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswer || [],
              explanation: q.explanation || "",
              marks: q.marks || 5,
              difficulty: q.difficulty || "medium",
            }));
            setQuestions(populatedQuestions);
          } else {
            toast.error("Failed to load quiz details");
            navigate(-1);
          }
        }
      } catch (err) {
        console.error("Error loading Quiz Editor Workspace:", err);
        toast.error("Error preparing Quiz Editor Workspace");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing, navigate]);

  // Questions Add / Remove
  const addQuestionCard = () => {
    const tempId = `temp-${Date.now()}`;
    const newQ = {
      id: tempId,
      type: "mcq",
      question: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: ["Option A"],
      explanation: "",
      marks: 10,
      difficulty: "medium",
    };
    setQuestions([...questions, newQ]);
  };

  // Open Question Bank and load options
  const handleOpenQuestionBank = async () => {
    try {
      setLoadingBank(true);
      setShowBankModal(true);
      const res = await getQuestionBank();
      if (res.data?.success) {
        setBankQuestions(res.data.data || []);
      } else {
        toast.error("Failed to load question bank");
      }
    } catch (err) {
      console.error("Failed to fetch question bank:", err);
      toast.error("Error fetching question bank");
    } finally {
      setLoadingBank(false);
    }
  };

  // Toggle selection inside Question Bank
  const toggleBankSelection = (id) => {
    setSelectedBankIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Import selected bank questions to questions list
  const handleImportSelected = () => {
    if (selectedBankIds.size === 0) return;
    const toImport = bankQuestions.filter((q) => selectedBankIds.has(q._id));
    const formatted = toImport.map((q) => ({
      id: `bank-${q._id}-${Date.now()}`,
      type: q.type,
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer || [],
      explanation: q.explanation || "",
      marks: q.marks || 5,
      difficulty: q.difficulty || "medium",
    }));

    setQuestions([...questions, ...formatted]);
    setSelectedBankIds(new Set());
    setShowBankModal(false);
    toast.success(`Successfully imported ${formatted.length} question(s) from bank!`);
  };

  const removeQuestionCard = (tempId) => {
    setQuestions(questions.filter((q) => q.id !== tempId));
  };

  const updateQuestionField = (tempId, field, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === tempId) {
          // Adjust defaults based on type shift
          if (field === "type") {
            let defaults;
            if (value === "true_false") {
              defaults = { options: ["True", "False"], correctAnswer: ["True"] };
            } else if (value === "mcq") {
              defaults = { options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: ["Option A"] };
            } else if (value === "multiple_select") {
              defaults = { options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: ["Option A"] };
            } else {
              defaults = { options: [], correctAnswer: [""] }; // Text based
            }
            return { ...q, [field]: value, ...defaults };
          }
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  // Option text modifier
  const updateOptionText = (qId, optionIdx, text) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          const updatedOptions = [...q.options];
          const oldOptionVal = updatedOptions[optionIdx];
          updatedOptions[optionIdx] = text;

          // Sync correct answer selection array if option text changes
          const updatedCorrectAnswers = q.correctAnswer.map((ans) =>
            ans === oldOptionVal ? text : ans
          );

          return { ...q, options: updatedOptions, correctAnswer: updatedCorrectAnswers };
        }
        return q;
      })
    );
  };

  // Correct options togglers
  const toggleCorrectOption = (qId, optionText, isMultiple = false) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          let updatedCorrect;
          if (!isMultiple) {
            // Radio behavior: single correct answer
            updatedCorrect = [optionText];
          } else {
            // Checkbox behavior: toggle array
            const exists = q.correctAnswer.includes(optionText);
            updatedCorrect = exists
              ? q.correctAnswer.filter((ans) => ans !== optionText)
              : [...q.correctAnswer, optionText];
          }
          return { ...q, correctAnswer: updatedCorrect };
        }
        return q;
      })
    );
  };

  const addOptionChoice = (qId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          const nextOptChar = String.fromCharCode(65 + q.options.length); // A, B, C, D...
          return {
            ...q,
            options: [...q.options, `New Option ${nextOptChar}`],
          };
        }
        return q;
      })
    );
  };

  const removeOptionChoice = (qId, optionIdx) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          const optToRemove = q.options[optionIdx];
          const updatedOptions = q.options.filter((_, idx) => idx !== optionIdx);
          const updatedCorrect = q.correctAnswer.filter((ans) => ans !== optToRemove);
          return { ...q, options: updatedOptions, correctAnswer: updatedCorrect };
        }
        return q;
      })
    );
  };

  // Submit Handler
  const handlePublish = async (e) => {
    e.preventDefault();

    if (!title.trim() || !courseId) {
      toast.error("Please fill title and target course fields.");
      return;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      toast.error("Quiz Start Date must be before Quiz End Date.");
      return;
    }

    if (questions.length === 0) {
      toast.error("Assessment canvas requires at least one question card.");
      return;
    }

    // Verify sum of questions points matches total marks
    const sumMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);
    if (sumMarks !== Number(totalMarks)) {
      toast.error(`Marks Mismatch: The sum of all question marks (${sumMarks} pts) must exactly match the Quiz Total Marks (${totalMarks} pts). Please adjust.`);
      return;
    }

    // Verify all choices have correct answer keys
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.type === "mcq" || q.type === "true_false" || q.type === "multiple_select") {
        if (!q.correctAnswer.length || q.correctAnswer[0] === "") {
          toast.error(`Blank Solutions: Question #${i + 1} has no correct solution selected.`);
          return;
        }
      } else {
        if (q.correctAnswer[0] === undefined || q.correctAnswer[0].trim() === "") {
          toast.error(`Blank Guidelines: Question #${i + 1} has no correct guideline solution typed.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const dataPayload = {
        title,
        description,
        instructions,
        courseId,
        duration: Number(duration),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        quizType,
        attemptLimit: Number(attemptLimit),
        shuffleQuestions,
        shuffleOptions,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        negativeMarking,
        status,
        questions,
      };

      const res = isEditing ? await updateQuiz(id, dataPayload) : await createQuiz(dataPayload);

      if (res.data?.success) {
        toast.success(isEditing ? "Quiz details updated successfully!" : "Quiz brief published to course successfully!");
        navigate("/teacher/quizzes");
      } else {
        toast.error("Failed to save quiz");
      }
    } catch (err) {
      console.error("Error saving quiz details:", err);
      toast.error("Encountered error publishing assessment card");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4" id="quiz-editor-loading">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Preparing dynamic curriculum canvas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="quiz-editor-workspace">
      {/* HEADER NAV */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="rounded-2xl gap-2 hover:bg-base-200 border border-base-300"
          id="quiz-editor-back-btn"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Button>

        <h1 className="text-2xl font-black text-foreground">
          {isEditing ? "Modify Assessment Brief" : "Publish New Assessment Brief"}
        </h1>
      </div>

      <form onSubmit={handlePublish} className="space-y-8">
        {/* PARAMETERS SECTION */}
        <Card className="border border-base-300 bg-base-100 shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-base-200/50 p-6 border-b border-base-300 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Quiz Configuration Parameters
            </h3>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Quiz Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Redux state workflows"
                  className="h-11 bg-base-200 border-none rounded-xl pl-4"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Target Course</label>
                <select
                  className="select select-bordered border-base-300 w-full h-11 rounded-xl px-3 bg-base-200 text-sm font-semibold"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Total Marks</label>
                <Input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="h-11 bg-base-200 border-none rounded-xl pl-4 font-bold"
                  min={10}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Passing Marks</label>
                <Input
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  className="h-11 bg-base-200 border-none rounded-xl pl-4 font-bold text-success"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Time Limit (Mins)</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-11 bg-base-200 border-none rounded-xl pl-4 font-semibold text-warning"
                  min={1}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Attempts Limit</label>
                <Input
                  type="number"
                  value={attemptLimit}
                  onChange={(e) => setAttemptLimit(e.target.value)}
                  className="h-11 bg-base-200 border-none rounded-xl pl-4 font-semibold"
                  min={0}
                  title="0 for unlimited attempts"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Category</label>
                <select
                  className="select select-bordered border-base-300 w-full h-11 rounded-xl px-3 bg-base-200 text-sm font-semibold"
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                >
                  <option value="exam">Exam assessment</option>
                  <option value="practice">Practice Quiz</option>
                  <option value="homework">Topic homework</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-base-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Start Date / Time
                </label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 bg-base-200 border-none rounded-lg pl-4 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> End Date / Time
                </label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 bg-base-200 border-none rounded-lg pl-4 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-base-300">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="checkbox checkbox-primary rounded-lg"
                  id="toggle-shuffle"
                />
                <label htmlFor="toggle-shuffle" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                  Randomize Questions
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="checkbox checkbox-primary rounded-lg"
                  id="toggle-shuffle-opts"
                />
                <label htmlFor="toggle-shuffle-opts" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                  Randomize Options
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="checkbox checkbox-primary rounded-lg"
                  id="toggle-negative"
                />
                <label htmlFor="toggle-negative" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                  Negative Marking (25%)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-muted-foreground mr-2">Status:</label>
                <select
                  className="select select-bordered border-base-300 select-xs h-9 rounded-lg px-2 bg-base-200 text-xs font-bold"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="published">Published</option>
                  <option value="draft">Save as Draft</option>
                  <option value="closed">Closed / Past</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Quiz Guidelines Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Type assessment code grids instructions, allowed materials or test details here..."
                className="textarea textarea-bordered border-base-300 w-full h-[80px] rounded-2xl bg-base-200 text-sm p-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* QUESTIONS EDITOR CANVAS */}
        <div className="space-y-5" id="questions-editor-canvas">
          <div className="flex justify-between items-center bg-base-100 border border-base-300 p-5 rounded-2xl shadow-md">
            <div>
              <h3 className="text-lg font-black text-foreground">Questions Canvas</h3>
              <p className="text-xs text-muted-foreground">Add question sheets, options selections, and scores.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleOpenQuestionBank}
                className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-white gap-1.5 rounded-xl text-xs h-10 px-4"
              >
                <Sparkles className="h-4.5 w-4.5 animate-pulse" /> Reusable Bank
              </Button>
              <Button
                type="button"
                onClick={addQuestionCard}
                className="btn btn-primary gap-1.5 rounded-xl text-white text-xs h-10 px-4"
              >
                <PlusCircle className="h-4.5 w-4.5" /> Append Question
              </Button>
            </div>
          </div>

          {/* Canvas cards list */}
          <div className="space-y-6">
            {questions.map((q, index) => (
              <Card key={q.id} className="border border-base-300 bg-base-100 shadow-xl rounded-3xl overflow-hidden">
                <div className="p-4 bg-base-200/50 border-b border-base-300 flex justify-between items-center flex-wrap gap-2">
                  <span className="font-extrabold text-xs text-primary">Question Card #{index + 1}</span>
                  <Button
                    type="button"
                    onClick={() => removeQuestionCard(q.id)}
                    className="btn btn-circle btn-xs btn-ghost text-error"
                    title="Remove question card"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Question text */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Question Text</label>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestionField(q.id, "question", e.target.value)}
                        placeholder="Type question prompt..."
                        className="h-10 bg-base-200 border-none rounded-lg pl-3 text-xs font-bold"
                        required
                      />
                    </div>

                    {/* Question type select */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Question Type</label>
                      <select
                        className="select select-bordered border-base-300 w-full h-10 rounded-lg px-2 bg-base-200 text-xs font-semibold"
                        value={q.type}
                        onChange={(e) => updateQuestionField(q.id, "type", e.target.value)}
                      >
                        <option value="mcq">Single MCQ Choice</option>
                        <option value="multiple_select">Multiple Select choices</option>
                        <option value="true_false">True / False</option>
                        <option value="short">Short Answer string</option>
                        <option value="long">Long Essay Description</option>
                        <option value="code">Coding Compiler solution</option>
                      </select>
                    </div>

                    {/* Marks & Difficulty */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Points</label>
                        <Input
                          type="number"
                          value={q.marks}
                          onChange={(e) => updateQuestionField(q.id, "marks", Number(e.target.value))}
                          className="h-10 bg-base-200 border-none rounded-lg pl-3 font-bold text-xs"
                          min={1}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Difficulty</label>
                        <select
                          className="select select-bordered border-base-300 w-full h-10 rounded-lg px-2 bg-base-200 text-xs font-semibold"
                          value={q.difficulty}
                          onChange={(e) => updateQuestionField(q.id, "difficulty", e.target.value)}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Options/Choices Area */}
                  {(q.type === "mcq" || q.type === "multiple_select" || q.type === "true_false") && (
                    <div className="space-y-3 bg-base-200/40 p-5 rounded-2xl border border-base-300">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                          Choices List & Solutions
                        </label>
                        {q.type !== "true_false" && (
                          <Button
                            type="button"
                            onClick={() => addOptionChoice(q.id)}
                            className="btn btn-xs btn-outline rounded-lg gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Choice
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, idx) => {
                          const isCorrect = q.correctAnswer.includes(opt);
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              {/* Checkbox / Radio toggle correctness */}
                              {q.type === "multiple_select" ? (
                                <input
                                  type="checkbox"
                                  checked={isCorrect}
                                  onChange={() => toggleCorrectOption(q.id, opt, true)}
                                  className="checkbox checkbox-xs checkbox-primary rounded"
                                  title="Check if correct choice"
                                />
                              ) : (
                                <input
                                  type="radio"
                                  checked={isCorrect}
                                  onChange={() => toggleCorrectOption(q.id, opt, false)}
                                  className="radio radio-xs radio-primary"
                                  name={`correct-radio-${q.id}`}
                                  title="Select single correct choice"
                                />
                              )}

                              <Input
                                value={opt}
                                onChange={(e) => updateOptionText(q.id, idx, e.target.value)}
                                disabled={q.type === "true_false"}
                                className="h-9 bg-base-200 border-none rounded-lg pl-3 text-xs flex-1"
                                placeholder={`Enter Option Choice ${idx + 1}`}
                                required
                              />

                              {q.type !== "true_false" && q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOptionChoice(q.id, idx)}
                                  className="btn btn-circle btn-ghost btn-xs text-error"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Short / Long / Coding Text response key */}
                  {(q.type === "short" || q.type === "long" || q.type === "code") && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground block uppercase">
                        Correct Answer Solution / Evaluation Guidelines
                      </label>
                      <textarea
                        value={q.correctAnswer[0] || ""}
                        onChange={(e) => updateQuestionField(q.id, "correctAnswer", [e.target.value])}
                        placeholder={
                          q.type === "code"
                            ? "e.g. function sum(a,b) { return a+b; }"
                            : q.type === "short"
                            ? "e.g. closure, block-scoped"
                            : "Enter the complete essay guidelines or correct sample answer details here..."
                        }
                        className="textarea textarea-bordered border-base-300 w-full h-[80px] rounded-xl bg-base-200 text-xs p-3 font-mono leading-relaxed"
                        required
                      />
                    </div>
                  )}

                  {/* Explanation text */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Explanatory Solution Notes</label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => updateQuestionField(q.id, "explanation", e.target.value)}
                      placeholder="Add why this solution is correct, providing students with learning summaries..."
                      className="textarea textarea-bordered border-base-300 w-full h-[60px] rounded-xl bg-base-200 text-xs p-3 leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end gap-4 pb-10">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            variant="ghost"
            className="rounded-2xl border border-base-300 bg-base-100 px-6"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="btn btn-primary rounded-2xl text-white px-8 h-12 flex items-center justify-center gap-1.5"
            id="quiz-editor-publish-btn"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                {isEditing ? "Publish Changes" : "Publish Quiz Assessment"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* QUESTION BANK IMPORT MODAL */}
      <Modal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="Question Bank Portal"
        description="Select reusable question cards compiled from your past quizzes."
      >
        <div className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-2 border border-base-300 p-3 rounded-2xl bg-base-200">
            {loadingBank ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="loading loading-spinner text-primary"></span>
                <span className="text-xs text-muted-foreground animate-pulse">Loading question library...</span>
              </div>
            ) : bankQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-10">No questions found in library.</p>
            ) : (
              bankQuestions.map((q) => {
                const isSelected = selectedBankIds.has(q._id);
                return (
                  <div
                    key={q._id}
                    onClick={() => toggleBankSelection(q._id)}
                    className={`p-3 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-base-100 border-base-300 hover:bg-base-300"
                    }`}
                  >
                    <div className="space-y-1 max-w-[85%]">
                      <span className="block font-bold text-foreground line-clamp-2">{q.question}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        Quiz: <span className="font-bold">{q.quizId?.title || "Previous quiz"}</span> | Type: {q.type.toUpperCase()} | Points: {q.marks}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"}`}>
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-base-300">
            <Button variant="ghost" onClick={() => setShowBankModal(false)}>Close</Button>
            <Button
              onClick={handleImportSelected}
              disabled={selectedBankIds.size === 0}
              className="btn btn-primary text-white"
            >
              Import Selected ({selectedBankIds.size})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
