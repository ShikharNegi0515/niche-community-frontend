import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { apiRequest } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { getInitials, formatRelativeTime } from "../components/utils.js";

const PostPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/posts/${id}`);
        setPost(data.post);
        setComments(data.comments || []);
      } catch (err) {
        showToast(err.message, "error");
        setTimeout(() => navigate("/dashboard"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, showToast]);

  const addComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const data = await apiRequest("/api/comments", {
        method: "POST",
        body: JSON.stringify({ postId: id, content: newComment.trim() }),
      });
      setComments((prev) => [data, ...prev]);
      setNewComment("");
      showToast("Comment added.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiRequest(`/api/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast("Comment removed.", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <LoadingSpinner label="Loading post..." />
      </div>
    );
  }

  if (!post) return null;

  const authorId = post.user?._id?.toString() || post.user?.toString();

  return (
    <div className="post-page">
      <Navbar />
      <div className="post-page-container">
        <button type="button" className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <article className="single-post-card">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <div className="post-meta">
            <div className="post-author">
              <span>
                👤 <strong>{post.user?.username || "Anonymous"}</strong>
              </span>
              <span>•</span>
              <span>🪐 {post.community?.name || "Community"}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>

          <section className="comments-section">
            <h3>Comments ({comments.length})</h3>

            <form className="add-comment" onSubmit={addComment}>
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "..." : "Comment"}
              </button>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="comments-empty">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((comment) => {
                  const commentAuthorId =
                    comment.user?._id?.toString() || comment.user?.toString();
                  const canDelete = commentAuthorId === user?.id;

                  return (
                    <div key={comment._id} className="comment-card">
                      <div className="comment-row">
                        <div className="comment-author-avatar">
                          {comment.user?.avatar ? (
                            <img src={comment.user.avatar} alt="" />
                          ) : (
                            getInitials(comment.user?.username)
                          )}
                        </div>
                        <div className="comment-body">
                          <span className="comment-author-name">
                            {comment.user?.username || "Anonymous"}
                          </span>
                          <span className="comment-time">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          <p className="comment-text">{comment.content}</p>
                        </div>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          className="comment-delete-btn"
                          onClick={() => deleteComment(comment._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PostPage;
