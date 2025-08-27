import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css';

function QuestionPaperBuilder() {
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cos, setCOs] = useState(['']);
  const [modules, setModules] = useState([]);
  const [nextGroupNumber, setNextGroupNumber] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const inactivityTimer = useRef(null);

  const markPresets = {
    'a, b, c, d (5 marks each)': [5, 5, 5, 5],
    'a, b (10 marks each)': [10, 10],
    'a, b, c (7,7,6 marks)': [7, 7, 6],
    'a, b, c (8,8,4 marks)': [8, 8, 4],
  };

  /** ------------------------
   * 🛑 Inactivity Logout (5 mins)
   ------------------------- */
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (!isSubmitted) saveQuestionPaper(true); // save draft before logout
      setTimeout(() => {
        alert('⏳ Session expired due to inactivity. You are being logged out.');
        window.location.href = '/login';
      }, 500);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      clearTimeout(inactivityTimer.current);
    };
  }, []);

  /** ------------------------
   * 💾 Auto-save every 2 mins
   ------------------------- */
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isSubmitted) {
        saveQuestionPaper(true);
      }
    }, 2 * 60 * 1000);
    return () => clearInterval(autoSaveInterval);
  }, []); // ✅ no dependency so it doesn’t reset every change

  /** ------------------------
   * 📌 Add / Update Functions
   ------------------------- */
  const addCO = () => !isSubmitted && setCOs([...cos, '']);
  const updateCO = (i, val) => {
    if (isSubmitted) return;
    const updated = [...cos];
    updated[i] = val;
    setCOs(updated);
  };

  const generateQuestions = (prefix, marksList) => {
    return marksList.map((mark, i) => ({
      label: `${prefix}${String.fromCharCode(97 + i)}`, // e.g., "1a"
      text: '',
      marks: mark,
      co: '',
      level: '',
    }));
  };

  const addEmptyModule = () => {
    if (isSubmitted) return;
    setModules([
      ...modules,
      {
        title: `Module ${modules.length + 1}`,
        pattern: '',
        groups: [],
      },
    ]);
  };

  const setModulePatternAndGenerate = (modIndex, pattern) => {
    if (isSubmitted) return;
    const marksList = markPresets[pattern];
    const group1 = generateQuestions(nextGroupNumber, marksList);
    const group2 = generateQuestions(nextGroupNumber + 1, marksList);

    const updatedModules = [...modules];
    updatedModules[modIndex].pattern = pattern;
    updatedModules[modIndex].groups = [group1, group2];
    setModules(updatedModules);
    setNextGroupNumber(nextGroupNumber + 2);
  };

  const updateQuestion = (modIndex, groupIndex, qIndex, key, val) => {
    if (isSubmitted) return;
    const updatedModules = [...modules];
    updatedModules[modIndex].groups[groupIndex][qIndex][key] = val;
    setModules(updatedModules);
  };

  /** ------------------------
   * 💾 Save or Submit
   ------------------------- */
  const saveQuestionPaper = async (isDraft = false) => {
    try {
      const now = new Date().toISOString();

      for (let mod of modules) {
        for (let group of mod.groups) {
          for (let q of group) {
            if (q.text.trim() !== '') {
              await axios.post('http://localhost:5000/api/question-bank', {
                subject_code: subjectCode,
                subject_name: subject,
                semester: semester,
                question_number: q.label, // 1a, 1b, etc.
                question_text: q.text,
              });
            }
          }
        }
      }

      setLastSavedAt(now);
      if (!isDraft) {
        alert('✅ All questions submitted successfully!');
        setIsSubmitted(true);
      } else {
        console.log('Draft auto-saved at', now);
      }
    } catch (error) {
      console.error('Error saving question bank:', error);
      alert('❌ Failed to save questions.');
    }
  };

  const confirmAndSubmit = () => {
    if (
      window.confirm(
        'Are you sure you want to submit? After submission, editing will be locked.'
      )
    ) {
      saveQuestionPaper(false);
    }
  };

  /** ------------------------
   * 🎨 UI Rendering
   ------------------------- */
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Faculty Portal</h2>
        <p>Question Paper Builder</p>
      </div>

      <div className="main-content">
        <h1>📘 Question Paper Builder</h1>

        {lastSavedAt && (
          <p className="timestamp">
            Last saved at: {new Date(lastSavedAt).toLocaleString()}
          </p>
        )}

        <div className="student-info">
          <label>Subject Code:</label>
          <input
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            placeholder="e.g., CSE23404"
            disabled={isSubmitted}
          />
          <label>Subject Name:</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Theory of Computation"
            disabled={isSubmitted}
          />
          <label>Semester:</label>
          <input
            type="text"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g., 4th Semester B.E."
            disabled={isSubmitted}
          />
        </div>

        <label>Student Instructions:</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          placeholder="Write general instructions here"
          disabled={isSubmitted}
        />

        <h3>📌 Course Outcomes (COs)</h3>
        {cos.map((co, i) => (
          <input
            key={i}
            value={co}
            onChange={(e) => updateCO(i, e.target.value)}
            placeholder={`CO${i + 1}`}
            disabled={isSubmitted}
          />
        ))}
        {!isSubmitted && <button onClick={addCO}>➕ Add CO</button>}

        <h3>📚 Modules</h3>
        {!isSubmitted && <button onClick={addEmptyModule}>➕ Add Module</button>}

        {modules.map((mod, modIndex) => (
          <div key={modIndex} className="module-box">
            <h4>{mod.title}</h4>
            {mod.groups.length === 0 ? (
              !isSubmitted && (
                <>
                  <label>Choose Question Pattern:</label>
                  <select
                    value={mod.pattern}
                    onChange={(e) =>
                      setModulePatternAndGenerate(modIndex, e.target.value)
                    }
                  >
                    <option value="">
                      -- Select Marks Distribution --
                    </option>
                    {Object.keys(markPresets).map((label, i) => (
                      <option key={i} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </>
              )
            ) : (
              mod.groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.map((q, qIndex) => (
                    <div key={qIndex} className="question-row">
                      <label>{q.label})</label>
                      <input
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(
                            modIndex,
                            groupIndex,
                            qIndex,
                            'text',
                            e.target.value
                          )
                        }
                        placeholder="Question text"
                        disabled={isSubmitted}
                      />
                      <input
                        value={q.co}
                        onChange={(e) =>
                          updateQuestion(
                            modIndex,
                            groupIndex,
                            qIndex,
                            'co',
                            e.target.value
                          )
                        }
                        placeholder="CO"
                        className="small"
                        disabled={isSubmitted}
                      />
                      <input
                        value={q.level}
                        onChange={(e) =>
                          updateQuestion(
                            modIndex,
                            groupIndex,
                            qIndex,
                            'level',
                            e.target.value
                          )
                        }
                        placeholder="L"
                        className="small"
                        disabled={isSubmitted}
                      />
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(
                            modIndex,
                            groupIndex,
                            qIndex,
                            'marks',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="small"
                        disabled={isSubmitted}
                      />
                    </div>
                  ))}
                  {groupIndex === 0 && (
                    <p className="or-text">
                      <strong>-- OR --</strong>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ))}

        <hr />
        <h2>🖨 Question Paper Preview</h2>
        <div className="preview">
          <p>
            <strong>Subject:</strong> {subject} ({subjectCode})
          </p>
          <p>
            <strong>Semester:</strong> {semester || '[Semester]'}
          </p>
          <p>{instructions}</p>

          <h4>Course Outcomes:</h4>
          <ul>
            {cos.map((co, i) => (
              <li key={i}>{co}</li>
            ))}
          </ul>

          {modules.map((mod, modIndex) => (
            <div key={modIndex}>
              <h4>{mod.title}</h4>
              {mod.groups.length === 0 ? (
                <em>Pattern not selected yet</em>
              ) : (
                <>
                  {mod.groups[0].map((q, i) => (
                    <div key={i}>
                      {q.label}) {q.text}{' '}
                      <strong>[{q.marks} marks]</strong>
                      <em> CO: {q.co || 'N/A'}</em>
                      <em> | L: {q.level || 'N/A'}</em>
                    </div>
                  ))}
                  <p className="or-text">
                    <strong>-- OR --</strong>
                  </p>
                  {mod.groups[1].map((q, i) => (
                    <div key={i}>
                      {q.label}) {q.text}{' '}
                      <strong>[{q.marks} marks]</strong>
                      <em> CO: {q.co || 'N/A'}</em>
                      <em> | L: {q.level || 'N/A'}</em>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>

        {!isSubmitted && (
          <div className="action-buttons">
            <button
              className="save-btn"
              onClick={() => saveQuestionPaper(true)}
            >
              💾 Save Draft
            </button>
            <button className="submit-btn" onClick={confirmAndSubmit}>
              📤 Submit Final
            </button>
          </div>
        )}
        {isSubmitted && (
          <p className="submitted-text">
            ✅ Paper submitted. Editing is locked.
          </p>
        )}
      </div>
    </div>
  );
}

export default QuestionPaperBuilder;
