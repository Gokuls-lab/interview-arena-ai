import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import API from '@/services/api';
import Data from '@/services/fetchdata';

export default function Interviews() {
  const [interviewResult, setinterviewResult] = useState(null);
  const [currentinterviewResult, setcurrentinterviewResult] = useState(null);
  const [inter, setinter] = useState([]);
  const [data, setdata] = useState([]);
  const [show, setshow] = useState(false);

  useEffect(() => {
    async function getInterview() {
      const interview = await Data.fetchInterviewResult();
      const temp = interview.map((i) => JSON.parse(i.result));
      setinter(interview);
      setinterviewResult(temp);
    }
    getInterview();
  }, []);

  useEffect(() => {
    async function getdata() {
      const temp = await Promise.all(
        inter.map(async (i) => {
          const temp_name = await API.jobs.getById(i.job_id);
          const temp_user = await Data.fetchusers(i.user_id);
          return { id: i.id, user: temp_user, job_name: temp_name };
        })
      );
      console.log(temp)
      setdata(temp);
    }

    if (inter.length > 0) getdata();
  }, [inter]);

  return (
    <>
      <Navbar />

      <h1 className='text-3xl font-bold m-20 ml-[25%]'>Interview Result</h1>
      <div className='flex w-screen justify-center'>
        <div className='bg-white w-1/2 border-zinc-100 border-2 rounded-2xl self-center overflow-y-auto max-h-[70vh]'>
          {data && data.map((i, index) => (
            <div
              key={i.id}
              onClick={() => {
                setcurrentinterviewResult(interviewResult[index]);
                setshow(true);
              }}
              className="cursor-pointer hover:bg-gray-100 p-4 border-b"
            >
                <div className='flex justify-between'>
              <h1 className="text-xl font-semibold">{i.job_name.company}</h1>
              <h3>{i.user.name}</h3>
              <button className='bg-blue-400 p-2 rounded-md text-white'>View Results</button>
                </div>
              <p className="text-gray-600">{i.job_name.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Modal */}
      {show && currentinterviewResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mt-20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Interview Evaluation</h2>
                <button
                  onClick={() => {
                    setcurrentinterviewResult(null);
                    setshow(false);
                  }}
                  className="text-gray-500"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {currentinterviewResult.error ? (
                <div className="bg-red-50 p-6 rounded-xl text-center">
                  <div className="text-red-500 mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Evaluation Error</h3>
                  <p className="text-gray-600 mb-4">{currentinterviewResult.message}</p>
                  {currentinterviewResult.rawResponse && (
                    <details className="text-left">
                      <summary className="cursor-pointer text-indigo-600 font-medium">Show raw response</summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                        {currentinterviewResult.rawResponse}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <svg className="w-40 h-40" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="#e0e0e0" strokeWidth="8" fill="none"></circle>
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          stroke="#4f46e5"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="339.292"
                          strokeDashoffset={339.292 * (1 - currentinterviewResult.overall_score / 100)}
                          transform="rotate(-90 60 60)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <div className="text-3xl font-bold">{currentinterviewResult.overall_score}</div>
                          <div className="text-gray-500 text-sm">Score</div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 mx-auto max-w-lg">{currentinterviewResult.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EvaluationCategory title="Communication" data={currentinterviewResult.communication} color="indigo" />
                    <EvaluationCategory title="Technical Knowledge" data={currentinterviewResult.technical_knowledge} color="blue" />
                    <EvaluationCategory title="Confidence" data={currentinterviewResult.confidence} color="green" />
                    <EvaluationCategory title="Body Language" data={currentinterviewResult.body_language} color="purple" />
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Improvement Tips</h3>
                    <ul className="space-y-3">
                      {currentinterviewResult.improvement_tips.map((tip, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="flex-shrink-0 text-indigo-500 mt-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => {
                        setcurrentinterviewResult(null);
                        setshow(false);
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Close Evaluation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EvaluationCategory({ title, data, color }) {
  const colorMap = {
    indigo: "bg-indigo-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-gray-50 p-5 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">{title}</h4>
        <div className="text-lg font-bold">{data.score}/10</div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div className={`h-full ${colorMap[color] || "bg-indigo-500"}`} style={{ width: `${data.score * 10}%` }}></div>
      </div>
      <p className="text-sm text-gray-600">{data.feedback}</p>
    </div>
  );
}
