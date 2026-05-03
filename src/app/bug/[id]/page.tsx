"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { API_BASE_URL } from "@/lib/api";

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
        fetch(`${API_BASE_URL}/api/bugs/${resolvedParams.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/bugs/${resolvedParams.id}/activity`, { headers: { Authorization: `Bearer ${token}` } })
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

    const socket = io(API_BASE_URL);
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
      await fetch(`${API_BASE_URL}/api/comments`, {
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
      await fetch(`${API_BASE_URL}/api/attachments`, {
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
      await fetch(`${API_BASE_URL}/api/bugs/${bug.id}`, {
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
        fetch(`${API_BASE_URL}/api/projects/${bug.projectId}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
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

  if (loading) return <div className="flex items-center justify-center h-full text-zinc-500">Loading bug details...</div>;
  if (!bug) return <div className="flex items-center justify-center h-full text-zinc-500">Bug not found</div>;

  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-8rem)] animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col gap-4 shrink-0 mb-6 px-1 sm:px-0">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-fit text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 pl-0 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse hidden xs:block" />
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-none px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{bug.status.replace("_", " ")}</Badge>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" /> <span className="truncate max-w-[120px] sm:max-w-none">{bug.project?.name || "Unknown Project"}</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-sm">Created {new Date(bug.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight break-words">{bug.title}</h1>
        </div>
      </header>

      <div className="flex flex-col lg:grid lg:gap-8 lg:grid-cols-4 flex-1 lg:min-h-0">
        {/* Main Content Area (Order 1 on Mobile, LG Sidebar Col 2-4) */}
        <div className="order-1 lg:order-2 lg:col-span-3 flex flex-col lg:h-full lg:min-h-0">
          
          {/* Custom Tabs Navigation */}
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-xl w-full sm:w-fit shrink-0 mb-4 overflow-x-auto whitespace-nowrap custom-scrollbar scrollbar-hide">
            <button onClick={() => setActiveTab('description')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'description' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'}`}>
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Description
            </button>
            <button onClick={() => setActiveTab('discussion')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'discussion' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'}`}>
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Discussion
              {bug.comments?.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'discussion' ? 'bg-zinc-100 dark:bg-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                  {bug.comments.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'activity' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'}`}>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Activity
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 lg:min-h-0 lg:overflow-y-auto custom-scrollbar lg:pr-2 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6 lg:mb-0">
            {activeTab === 'description' && (
              <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-2xl flex flex-col min-h-[300px] lg:h-full overflow-hidden">
                <div className="p-5 sm:p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"} className="bg-transparent text-zinc-900 dark:text-zinc-300 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                    <MarkdownRender source={bug.description} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                  </div>
                  
                  {(bug.attachments?.length > 0 || myRole !== 'DEVELOPER') && (
                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-indigo-500" /> Attachments
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {bug.attachments?.map((att: any) => (
                          <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 transition-colors group">
                            <FileText className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                            <span className="truncate">{att.fileUrl.split('/').pop()}</span>
                          </a>
                        ))}
                      </div>
                      
                      {myRole !== 'DEVELOPER' && (
                        <div className="bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 sm:p-8 text-center hover:bg-zinc-100 transition-colors">
                          <Label className="flex flex-col items-center cursor-pointer">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                              <Paperclip className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-bold">Upload Attachment</span>
                            <span className="text-[10px] text-zinc-500 mt-1">Images or logs (max 5MB)</span>
                            <Input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                          </Label>
                          {uploading && <p className="text-[10px] font-bold text-indigo-500 mt-2 animate-pulse">Uploading...</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[500px] lg:h-full">
                <div className="flex-1 flex flex-col relative min-h-0">
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col">
                    {[...(bug.comments || [])].sort((a:any, b:any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((comment: any) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {(!bug.comments || bug.comments.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageSquare className="w-10 h-10 text-zinc-300 mb-3" />
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No comments yet</h3>
                        <p className="text-xs text-zinc-500 mt-1">Be the first to start the discussion.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800/80">
                    <div className="space-y-3 relative">
                      {replyingTo && (
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs">
                          <span>Replying to <span className="font-bold text-indigo-500">{replyingTo.user?.name}</span></span>
                          <button onClick={() => setReplyingTo(null)} className="text-zinc-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                      
                      <div className="flex gap-2 items-end">
                        <Textarea 
                          ref={textareaRef}
                          value={commentContent}
                          onChange={handleCommentChange}
                          placeholder="Write a comment..." 
                          className="bg-white dark:bg-[#0B0E14] border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-indigo-500 min-h-[44px] max-h-32 resize-y" 
                        />
                        <Button onClick={handlePostComment} disabled={commenting || !commentContent.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white h-[44px] px-4 shrink-0">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-2xl flex flex-col min-h-[400px] lg:h-full">
                <div className="p-4 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                  {activityLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Activity className="w-10 h-10 text-zinc-300 mb-3" />
                      <h3 className="text-sm font-bold">No recent activity</h3>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 sm:before:mx-auto before:h-full before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
                      {activityLogs.map((log: any) => {
                        const changes = log.metadata?.changes || [];
                        if (changes.length === 0) return null;
                        return (
                          <div key={log.id} className="relative flex items-center justify-between sm:justify-normal sm:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#151923] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 shrink-0 sm:order-1 sm:group-odd:-translate-x-1/2 sm:group-even:translate-x-1/2 z-10">
                              <Activity className="w-3.5 h-3.5" />
                            </div>
                            <div className="w-[calc(100%-3.5rem)] sm:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/30">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <div className="font-bold text-xs">{log.userName}</div>
                                <div className="text-[9px] text-zinc-500 uppercase">{new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
                              </div>
                              <div className="space-y-2">
                                {changes.map((change: any, i: number) => (
                                  <div key={i} className="text-[10px] p-2 rounded bg-white dark:bg-[#0B0E14] border border-zinc-100 dark:border-zinc-800/50">
                                    <span className="text-zinc-500 uppercase font-bold mr-2">{change.field}:</span>
                                    <span className="line-through opacity-50 mr-2">{change.old || 'None'}</span>
                                    <ArrowRight className="inline w-2 h-2 mx-1 opacity-50" />
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-2">{change.new || 'None'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Sidebar (Order 2 on Mobile, LG Sidebar Col 1) */}
        <div className="order-2 lg:order-1 lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#151923] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-500" /> Properties
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5 p-5 text-sm">
              <div className="space-y-1.5">
                <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Status</Label>
                <select disabled={isActionDisabled} value={bug.status} onChange={e => updateBugField('status', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-700 cursor-pointer disabled:opacity-50 text-sm">
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
                <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Severity</Label>
                <select disabled={isActionDisabled} value={bug.severity} onChange={e => updateBugField('severity', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-700 cursor-pointer text-sm">
                  <option value="LOW">Low</option>
                  <option value="MINOR">Minor</option>
                  <option value="MAJOR">Major</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="BLOCKER">Blocker</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Priority</Label>
                <select disabled={isActionDisabled} value={bug.priority} onChange={e => updateBugField('priority', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-700 cursor-pointer text-sm">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1.5 pt-2 sm:pt-0 lg:pt-2 border-t sm:border-0 lg:border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Assignee</Label>
                </div>
                {myRole === 'MANAGER' || (myRole === 'DEVELOPER' && bug.assignedTo === myUserId) ? (
                  <select value={bug.assignedTo || ""} onChange={e => updateBugField('assignedTo', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-700 cursor-pointer text-sm">
                    <option value="">Unassigned</option>
                    {members.filter(m => m.role !== 'TESTER').map(m => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium truncate">{bug.assignedTo ? members.find(m => m.userId === bug.assignedTo)?.user.name : "Unassigned"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
