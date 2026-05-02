"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { io } from "socket.io-client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Activity, MessageSquare, FileText, Settings, User, AlertCircle, ArrowLeft, Paperclip, Send, Folder, X, Reply, ArrowRight, Tag, ShieldAlert, CheckCircle2 } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false });
const MarkdownRender = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown), { ssr: false });

export default function BugDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [bug, setBug] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [myRole, setMyRole] = useState<string>("TESTER");
  const [myUserId, setMyUserId] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("description");
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const fetchBug = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const [bugRes, activityRes] = await Promise.all([
        fetch(`http://localhost:3001/api/bugs/${resolvedParams.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:3001/api/bugs/${resolvedParams.id}/activity`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!bugRes.ok) throw new Error("Failed to fetch bug");
      
      const data = await bugRes.json();
      setBug(data);
      
      if (activityRes.ok) {
        setActivityLogs(await activityRes.json());
      }
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBug();

    const socket = io('http://localhost:3001');
    socket.on('bugUpdated', (data) => {
      if (data.bugId === resolvedParams.id) fetchBug();
    });
    socket.on('commentAdded', (data) => {
      if (data.bugId === resolvedParams.id) fetchBug();
    });

    return () => {
      socket.disconnect();
    };
  }, [resolvedParams.id, router]);

  const handlePostComment = async () => {
    if (!commentContent.trim()) return;
    setCommenting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3001/api/comments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          bugId: bug.id, 
          content: commentContent,
          parentCommentId: replyingTo?.id 
        })
      });
      setCommentContent("");
      setReplyingTo(null);
      setMentionQuery(null);
      await fetchBug(); // refresh comments
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentContent(val);
    
    // detect mention
    const words = val.split(/[\s\n]+/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (userName: string) => {
    const words = commentContent.split(/([\s\n]+)/);
    words[words.length - 1] = `@${userName} `;
    setCommentContent(words.join(""));
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@[A-Za-z0-9_ ]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1).trim();
        const isMember = members.some(m => m.user.name === name);
        if (isMember) {
          return <span key={i} className="text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">{part}</span>;
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const CommentItem = ({ comment }: { comment: any }) => {
    const isMine = comment.userId === myUserId;
    const parentComment = comment.parentCommentId ? bug.comments?.find((c:any) => c.id === comment.parentCommentId) : null;
    
    return (
      <div className={`flex w-full group ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
          <div className={`flex items-center gap-2 mb-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-400">{isMine ? 'You' : (comment.user?.name || "Unknown User")}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="relative flex items-end gap-2">
            {isMine && (
              <button onClick={() => { setReplyingTo(comment); textareaRef.current?.focus(); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm shrink-0 mb-1">
                <Reply className="w-3.5 h-3.5" />
              </button>
            )}
            
            <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'}`}>
              {parentComment && (
                <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${isMine ? 'bg-indigo-800/40 border-indigo-300 text-indigo-50' : 'bg-zinc-100 dark:bg-zinc-900 border-indigo-500 text-zinc-600 dark:text-zinc-400'} opacity-90`}>
                  <div className="font-bold mb-0.5">{parentComment.userId === myUserId ? 'You' : parentComment.user?.name}</div>
                  <div className="truncate max-w-full line-clamp-1">{parentComment.content}</div>
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word' }}>{renderCommentContent(comment.content)}</p>
            </div>

            {!isMine && (
              <button onClick={() => { setReplyingTo(comment); textareaRef.current?.focus(); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm shrink-0 mb-1">
                <Reply className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bugId", bug.id);

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3001/api/attachments", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      await fetchBug();
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. Please ensure your Cloudinary keys are valid.");
    } finally {
      setUploading(false);
    }
  };

  const updateBugField = async (field: string, value: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3001/api/bugs/${bug.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ [field]: value })
      });
      await fetchBug();
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (bug?.projectId) {
      const token = localStorage.getItem("token");
      Promise.all([
        fetch(`http://localhost:3001/api/projects/${bug.projectId}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      ])
      .then(async ([memRes, meRes]) => {
        const memData = await memRes.json();
        const meData = await meRes.json();
        setMembers(Array.isArray(memData) ? memData : []);
        if (meData?.userId && Array.isArray(memData)) {
          setMyUserId(meData.userId);
          const member = memData.find(m => m.userId === meData.userId);
          if (member) setMyRole(member.role);
        }
      })
      .catch(console.error);
    }
  }, [bug?.projectId]);

  const isActionDisabled = myRole === 'TESTER' || (myRole === 'DEVELOPER' && bug?.assignedTo !== myUserId);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (!bug) return <div className="flex items-center justify-center h-full text-zinc-500">Bug not found</div>;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 shrink-0 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-fit text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 pl-0 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-none px-2 py-0.5 text-xs font-bold uppercase tracking-wider">{bug.status.replace("_", " ")}</Badge>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" /> {bug.project?.name || "Unknown Project"}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm">Created {new Date(bug.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">{bug.title}</h1>
        </div>
      </header>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-4 flex-1 lg:min-h-0 pb-2">
        {/* Left Sidebar (Col 1) */}
        <div className="lg:col-span-1 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-500" /> Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5 text-sm">
              <div className="space-y-1.5">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Status</Label>
                <select disabled={isActionDisabled} value={bug.status} onChange={e => updateBugField('status', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all focus:ring-1 focus:ring-indigo-500">
                  <option value="OPEN">Open</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FIXED">Fixed</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REOPENED">Reopened</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Severity</Label>
                <select disabled={isActionDisabled} value={bug.severity} onChange={e => updateBugField('severity', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all focus:ring-1 focus:ring-indigo-500">
                  <option value="LOW">Low</option>
                  <option value="MINOR">Minor</option>
                  <option value="MAJOR">Major</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="BLOCKER">Blocker</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Priority</Label>
                <select disabled={isActionDisabled} value={bug.priority} onChange={e => updateBugField('priority', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all focus:ring-1 focus:ring-indigo-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Assignee</Label>
                  {myRole === 'DEVELOPER' && !bug.assignedTo && (
                    <button onClick={() => updateBugField('assignedTo', myUserId)} className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded transition-colors shadow-sm font-bold uppercase tracking-wide">
                      Accept Bug
                    </button>
                  )}
                </div>
                {myRole === 'MANAGER' || (myRole === 'DEVELOPER' && bug.assignedTo === myUserId) ? (
                  <select value={bug.assignedTo || ""} onChange={e => updateBugField('assignedTo', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-800 cursor-pointer shadow-sm transition-all focus:ring-1 focus:ring-indigo-500">
                    <option value="">Unassigned</option>
                    {members.filter(m => m.role !== 'TESTER').map(m => (
                      <option key={m.userId} value={m.userId}>{m.user.name} ({m.role})</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {bug.assignedTo ? members.find(m => m.userId === bug.assignedTo)?.user.name : <span className="text-zinc-500 italic">Unassigned</span>}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Reporter</Label>
                <div className="flex items-center gap-2 p-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {bug.reporter?.name?.charAt(0) || "U"}
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{bug.reporter?.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area (Col 2-4) */}
        <div className="lg:col-span-3 flex flex-col lg:h-full lg:min-h-0">
          
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl w-full sm:w-fit backdrop-blur-sm shrink-0 mb-4 overflow-x-auto max-w-full custom-scrollbar">
            <button onClick={() => setActiveTab('description')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'description' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}>
              <FileText className="w-4 h-4" /> Description
            </button>
            <button onClick={() => setActiveTab('discussion')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'discussion' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}>
              <MessageSquare className="w-4 h-4" /> Discussion
              {bug.comments?.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'discussion' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  {bug.comments.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'activity' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}>
              <Activity className="w-4 h-4" /> Activity Log
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 lg:min-h-0 lg:overflow-y-auto custom-scrollbar lg:pr-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'description' && (
              <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm lg:h-full flex flex-col min-h-[400px]">
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-8 flex-1 lg:overflow-y-auto custom-scrollbar">
                  <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"} className="bg-transparent text-zinc-900 dark:text-zinc-300 prose prose-zinc dark:prose-invert max-w-none">
                    <MarkdownRender source={bug.description} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                  </div>
                  
                  {(bug.attachments?.length > 0 || myRole !== 'DEVELOPER') && (
                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-indigo-500" /> Attachments
                      </h4>
                      
                      {bug.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-6">
                          {bug.attachments.map((att: any) => (
                            <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm group">
                              <FileText className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                              <span className="truncate max-w-[200px]">{att.fileUrl.split('/').pop()}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {myRole !== 'DEVELOPER' && (
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                          <Label className="flex flex-col items-center cursor-pointer">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-3">
                              <Paperclip className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Click to upload a file</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Images, logs, or documents (max 5MB)</span>
                            <Input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                          </Label>
                          {uploading && <p className="text-xs font-bold text-indigo-500 mt-3 animate-pulse">Uploading securely to cloud...</p>}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'discussion' && (
              <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col lg:h-full min-h-[500px]">
                <CardContent className="p-0 flex-1 flex flex-col relative lg:h-full">
                  <div className="flex-1 p-4 md:p-6 lg:overflow-y-auto custom-scrollbar flex flex-col">
                    {[...(bug.comments || [])].sort((a:any, b:any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((comment: any) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {(!bug.comments || bug.comments.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
                          <MessageSquare className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No comments yet</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">Start the discussion by leaving a comment below.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800/50">
                    <div className="space-y-3 relative">
                      {replyingTo && (
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 shadow-sm">
                          <span>Replying to <span className="text-indigo-600 dark:text-indigo-400 font-bold">{replyingTo.user?.name}</span></span>
                          <button onClick={() => setReplyingTo(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                      
                      {mentionQuery !== null && (
                        <div className="absolute bottom-[4.5rem] left-0 w-64 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                          {members.filter(m => m.user.name.toLowerCase().includes(mentionQuery)).map(m => (
                            <div key={m.userId} onClick={() => insertMention(m.user.name)} className="px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 cursor-pointer border-b border-zinc-100 dark:border-zinc-700/50 last:border-0 flex items-center justify-between">
                              <span className="font-medium">{m.user.name}</span>
                              <Badge variant="secondary" className="text-[10px] uppercase">{m.role}</Badge>
                            </div>
                          ))}
                          {members.filter(m => m.user.name.toLowerCase().includes(mentionQuery)).length === 0 && (
                            <div className="px-3 py-3 text-sm text-zinc-500 italic text-center bg-zinc-50 dark:bg-zinc-900/50">No members found</div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 items-end">
                        <Textarea 
                          ref={textareaRef}
                          value={commentContent}
                          onChange={handleCommentChange}
                          placeholder="Type @ to mention someone..." 
                          className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 shadow-sm min-h-[60px] resize-y" 
                          rows={2} 
                        />
                        <Button onClick={handlePostComment} disabled={commenting || !commentContent.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white h-[60px] px-6 shadow-md shadow-indigo-500/20 shrink-0">
                          {commenting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm lg:h-full flex flex-col min-h-[400px]">
                <CardContent className="p-4 sm:p-6 md:p-8 flex-1 lg:overflow-y-auto custom-scrollbar">
                  {activityLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
                        <Activity className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No recent activity</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">Changes made to this bug will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                      {activityLogs.map((log: any, index: number) => {
                        const changes = log.metadata?.changes || [];
                        if (changes.length === 0) return null;
                        
                        return (
                          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                              <Activity className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shadow-sm transition-all hover:shadow-md">
                              <div className="flex items-center justify-between mb-3">
                                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{log.userName}</div>
                                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
                              </div>
                              <div className="space-y-3">
                                {changes.map((change: any, i: number) => {
                                  let Icon = Settings;
                                  if (change.field === 'status') Icon = CheckCircle2;
                                  if (change.field === 'severity') Icon = ShieldAlert;
                                  if (change.field === 'priority') Icon = AlertCircle;
                                  if (change.field === 'assignedTo') Icon = User;
                                  
                                  return (
                                    <div key={i} className="flex flex-col gap-1.5 p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50">
                                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Icon className="w-3 h-3" /> {change.field}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium line-through decoration-zinc-400/50">
                                          {change.field === 'assignedTo' ? change.oldName : (change.old || 'None')}
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold">
                                          {change.field === 'assignedTo' ? change.newName : (change.new || 'None')}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
