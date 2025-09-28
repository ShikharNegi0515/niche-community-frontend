import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

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

    // Fetch post and its comments
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch post
                const resPost = await fetch(`http://localhost:5000/api/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const postData = await resPost.json();

                if (!resPost.ok) {
                    setError(postData.message || "Post not found");
                    setTimeout(() => navigate("/dashboard"), 2000);
                    return;
                }

                setPost(postData.post || postData); // adjust based on backend response

                // Fetch comments
                const resComments = await fetch(`http://localhost:5000/api/comments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const commentsData = await resComments.json();
                if (resComments.ok) setComments(commentsData);
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
            const res = await fetch(`http://localhost:5000/api/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ postId: id, content: newComment }),
            });

            const data = await res.json();
            if (res.ok) {
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
            const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
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

    if (loading) return <p>Loading post...</p>;
    if (error) return <p>{error}</p>;
    if (!post) return <p>Post not found.</p>;

    return (
        <div className="post-page">
            <Navbar />
            <div className="post-container">
                <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "1rem" }}>
                    ← Back to Dashboard
                </button>

                <div className="post-card">
                    <h2>{post.title || "Unknown"}</h2>
                    <p>{post.content || "No content"}</p>
                    <small>
                        By {post.user?.username || "Unknown"} in {post.community?.name || "Unknown"}
                    </small>
                </div>

                <div className="comments-section">
                    <h3>Comments</h3>

                    <div className="add-comment">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addComment()}
                        />
                        <button onClick={addComment}>Comment</button>
                    </div>

                    {comments.length === 0 ? (
                        <p>No comments yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment._id}
                                style={{
                                    borderTop: "1px solid #ccc",
                                    padding: "0.5rem 0",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <strong>{comment.user?.username || "Unknown"}:</strong> {comment.content}
                                </div>
                                {comment.user?._id === user.id && (
                                    <button
                                        style={{ color: "red", marginLeft: "1rem" }}
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
    );
};

export default PostPage;
