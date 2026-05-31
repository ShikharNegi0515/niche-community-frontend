import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { BASE_URL } from "../components/utils.js";

const PostPage = () => {
    const { id } = useParams(); // post ID from URL
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch post and its comments (Single highly optimized call)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resPost = await fetch(`${BASE_URL}/api/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await resPost.json();

                if (!resPost.ok) {
                    setError(data.message || "Post not found");
                    setTimeout(() => navigate("/dashboard"), 2000);
                    return;
                }

                setPost(data.post); 
                setComments(data.comments || []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch post.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token, navigate]);

    // Add a new comment
    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${BASE_URL}/api/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ postId: id, content: newComment }),
            });

            const data = await res.json();
            if (res.ok) {
                // Attach current user object for immediate UI updates
                data.user = { _id: user.id, username: user.username };
                setComments([data, ...comments]);
                setNewComment("");
            } else {
                alert(data.message || "Failed to add comment");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete a comment
    const deleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setComments(comments.filter((c) => c._id !== commentId));
            } else {
                alert(data.message || "Failed to delete comment");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getInitials = (username) => {
        if (!username) return "?";
        const names = username.trim().split(" ");
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)" }}>Loading post details...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "2rem" }}>
                <div className="glass-panel" style={{ textAlign: "center", maxWidth: "400px" }}>
                    <p style={{ fontSize: "1.2rem", color: "var(--danger)" }}>⚠️ {error}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Redirecting you to dashboard...</p>
                </div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="post-page">
            <Navbar />
            <div className="post-page-container">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back to Dashboard
                </button>

                <div className="single-post-card">
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                    <div className="post-meta" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <div className="post-author">
                            <span>👤 Posted by <strong>{post.user?.username || "Anonymous"}</strong></span>
                            <span>•</span>
                            <span>🪐 in <strong>{post.community?.name || "Niche Sphere"}</strong></span>
                        </div>
                        <span className="post-tag">
                            📅 {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h3>Comments ({comments.length})</h3>

                        <div className="add-comment">
                            <input
                                type="text"
                                placeholder="Share your thoughts on this post..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addComment()}
                            />
                            <button className="primary-btn" onClick={addComment}>Comment</button>
                        </div>

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "1.5rem 0" }}>
                                    No comments yet. Start the conversation!
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment._id} className="comment-card">
                                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                            <div className="comment-author-avatar">
                                                {comment.user?.avatar ? (
                                                    <img src={comment.user.avatar} alt="avatar" />
                                                ) : (
                                                    getInitials(comment.user?.username)
                                                )}
                                            </div>
                                            <div className="comment-body">
                                                <span className="comment-author-name">{comment.user?.username || "Anonymous"}</span>
                                                <p className="comment-text">{comment.content}</p>
                                            </div>
                                        </div>
                                        {(comment.user?._id === user?.id || comment.user === user?.id) && (
                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => deleteComment(comment._id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;
